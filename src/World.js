const BASE_W = 0.05, HEAD_W = 0.2, NECK = 0, LEN = 0.2;
const arrow = new Path2D();
arrow.moveTo( -LEN,  -BASE_W );
arrow.lineTo(  NECK, -BASE_W );
arrow.lineTo(  NECK, -HEAD_W );
arrow.lineTo(  LEN,   0 );
arrow.lineTo(  NECK,  HEAD_W );
arrow.lineTo(  NECK,  BASE_W );
arrow.lineTo( -LEN,   BASE_W );
arrow.closePath();

const ARROW_COLOR = '#ff05';
const TILE_BORDER = 1 / 64;

import { Direction, Dir } from './Entity.js';
import { Props } from './Props.js';
import { TileMap } from './TileMap.js';
import { Entity } from './Entity.js';
import { Entities } from './Entities.js';
import { Death } from './Frog.js';
import { Player } from './Player.js';

import * as Constants from './Constants.js';

export class World
{
  static DebugGrid = false;

  static async fromFile( path ) {
    const string = await ( await fetch( path ) ).text();  // TODO: error handling
    return World.fromString( string );
  }

  static fromString( string ) {
    const json = JSON.parse( string );    // TODO: error handling
    return json ? new World( json ) : null;
  }
 
  entities = [];
  rescued = [];
  player;
  tiles;
  maxTime;
  timeLeft = 0;
  
  needsRespawn = false;
  defeat = false;
  victory = false;

  #tileMap;

  constructor( json ) {
    this.cols = json.cols;
    this.rows = json.rows;

    this.tiles = Array.from( 
      Array( json.cols ), () => Array.from( 
        Array( json.rows ), () => ( { tileInfoKey: 'Grass' } ) ) );


    // TODO: Move all this to tileMap?
    json.tiles?.forEach( ( tileIndex, index ) => {
      const col = index % json.cols;
      const row = Math.floor( index / json.cols );

      this.tiles[ col ][ row ].tileInfoKey = json.tileInfoKeys[ tileIndex ];
    } );

    json.directions?.forEach( ( dirIndex, index ) => {
      const col = index % json.cols;
      const row = Math.floor( index / json.cols );

      this.tiles[ col ][ row ].dir = dirIndex;
    } );

    this.#tileMap = new TileMap( this.tiles );

    this.maxTime = json.time ?? 15000;
    [ this.spawnCol, this.spawnRow ] = json.player ?? [ Math.floor( this.cols / 2 ), Math.floor( this.rows / 2 ) ];

    this.entities = this.getEntitiesFromJson( json.entities );
    this.lives = Constants.MaxLives;    
    this.respawnPlayer();
    // TODO: Don't spawn automaticaly?
  }

  toJson() {
    const tileInfoKeys = new Map();
    const jsonTiles = [];
    const jsonDirs = [];

    for ( let index = 0, row = 0; row < this.rows; row ++ ) {
      for ( let col = 0; col < this.cols; col ++, index ++ ) {
        const tile = this.tiles[ col ][ row ];

        if ( !tileInfoKeys.has( tile.tileInfoKey ) ) {
          tileInfoKeys.set( tile.tileInfoKey, tileInfoKeys.size );
        }
        jsonTiles.push( tileInfoKeys.get( tile.tileInfoKey ) );
        jsonDirs.push( tile.dir );
      }
    }
    
    return {
      cols: this.cols,
      rows: this.rows,
      tileInfoKeys: Array.from( tileInfoKeys.keys() ),
      tiles: jsonTiles,
      directions: jsonDirs,
      entities: this.getEntitiesJson(),
      player: [ this.spawnCol, this.spawnRow ],
      time: this.maxTime,
    };
  }

  applyWorldState( json ) {
    this.entities = this.getEntitiesFromJson( json.entities );
    this.player = new Player( Entities.Player, json.player );
    this.rescued = json.rescued;
    this.timeLeft = json.timeLeft;
    this.lives = json.lives;
  }

  getWorldstateJson() {
    return {
      entities: this.getEntitiesJson(),
      player: { x: this.player.x, y: this.player.y, dir: this.player.dir },
      rescued: this.rescued,
      timeLeft: this.timeLeft,
      lives: this.lives,
    }
  }

  getEntitiesFromJson( json ) {
    const entities = [];

    for ( const entityKey in json ) {
      json[ entityKey ]?.forEach( coords => 
        entities.push( new Entity( Entities[ entityKey ], { x: coords[ 0 ], y: coords[ 1 ] } ) ) 
      );
    }

    return entities;
  }

  getEntitiesJson() {
    const jsonEntities = {};

    this.entities.forEach( entity => {
      jsonEntities[ entity.info.entityKey ] ??= [];
      jsonEntities[ entity.info.entityKey ].push( [ entity.x, entity.y ] );
    } );

    return jsonEntities;
  }

  getTile( x, y ) {
    const col = Math.round( x );
    const row = Math.round( y );

    if ( 0 <= col && col <= this.cols && 
         0 <= row && row <= this.rows ) {
      return this.tiles[ col ]?.[ row ];
    }
  }

  setDirection( dir, col, row ) {
    this.tiles[ col ][ row ].dir = dir;

    let affected = this.entities.find( e => e.x == col && e.y == row );
    
    if ( affected ) {
      affected.dir = dir;
    }
    else if ( this.player.x == col && this.player.y == row ) {
      this.player.dir = dir;
    }
  }

  addEntity( type, col, row ) {
    this.removeEntity( col, row );

    this.entities.push(
      new Entity( 
        Entities[ type ], 
        {
          x: col,
          y: row,
          // dir: this.tiles[ col ]?.[ row ]?.dir ?? Direction.Right,
        }
      )
    );
  }

  removeEntity( col, row ) {
    this.entities = this.entities.filter( e => e.x != col || e.y != row );
  }

  addColumn( col ) {
    this.tiles.splice( col, 0, 
      Array.from( this.tiles[ col ], e => ( { tileInfoKey: e.tileInfoKey, dir: e.dir } ) ) 
    );
    this.#adjustColumns( col, +1 );
  }

  removeColumn( col ) {
    this.tiles.splice( col, 1 );
    this.#adjustColumns( col, -1 );
  }

  #adjustColumns( col, delta ) {
    this.cols += delta;

    this.entities.filter( e => e.x >= col ).forEach( e => e.x += delta );
    if ( this.player.x >= col ) {
      this.player.x += delta;
    }
  }

  addRow( row ) {
    for ( let col = 0; col < this.cols; col ++ ) {
      const toCopy = this.tiles[ col ][ row ];
      this.tiles[ col ].splice( row, 0, ( { tileInfoKey: toCopy.tileInfoKey, dir: toCopy.dir } ) );
    }

    this.#adjustRows( row, +1 );
  }

  removeRow( row ) {
    for ( let col = 0; col < this.cols; col ++ ) {
      this.tiles[ col ].splice( row, 1 );
    }
    this.#adjustRows( row, -1 );
  }

  #adjustRows( row, delta ) {
    this.rows += delta;

    this.entities.filter( e => e.y >= row ).forEach( e => e.y += delta );
    if ( this.player.y >= row ) {
      this.player.y += delta;
    }
  }

  killPlayer( mannerOfDeath ) {
    this.player.kill( mannerOfDeath );
    this.needsRespawn = true;
    
    // TODO: Lose when lives < 0
    this.lives--;
    this.defeat = this.lives < 0;
  }

  respawnPlayer() {
    this.needsRespawn = false;

    this.timeLeft = this.maxTime;

    this.player = new Player( Entities.Player, {
      x: this.spawnCol, 
      y: this.spawnRow, 
      color: 'green',
      dir: this.tiles[ this.spawnCol ][ this.spawnRow ].dir ?? Direction.Right
    } );
  }

  rescue( froggy ) {
    this.rescued.push( froggy.info.froggyIndex );
    this.entities = this.entities.filter( e => e != froggy );

    this.lives = Math.min( Constants.MaxLives, this.lives + 1 );

    this.needsRespawn = true;
    this.victory = this.entities.filter( e => e.info.canRescue ).length == 0;
  }

  update( dt ) {
    this.entities.forEach( entity => entity.update( dt, this ) );
    this.player?.update( dt, this );

    if ( !this.needsRespawn ) {
      this.timeLeft = Math.max( 0, this.timeLeft - dt );
      
      if ( this.timeLeft == 0 ) {
        this.killPlayer( Death.Expired );
      }
    }
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( 0.5, 0.5 );

    this.#tileMap.draw( ctx );

    ctx.save();

    for ( let row = 0; row < this.rows; row ++ ) {
      ctx.save();
      
      for ( let col = 0; col < this.cols; col ++ ) {
    
        const prop = Props[ this.tiles[ col ][ row ].tileInfoKey ];
        prop?.draw( ctx );

        ctx.translate( 1, 0 );
      }

      ctx.restore();
      ctx.translate( 0, 1 );
    }

    ctx.restore();
    
    this.entities.filter( e => e.info.zIndex < this.player.zIndex ).forEach( e => e.draw( ctx ) );
    this.player?.draw( ctx );
    this.entities.filter( e => e.info.zIndex >= this.player.zIndex ).forEach( e => e.draw( ctx ) );

    if ( World.DebugGrid ) {
      ctx.fillStyle = ctx.strokeStyle = ARROW_COLOR;
      ctx.lineWidth = TILE_BORDER;
      ctx.textAlign = 'center';
      ctx.font = '10px Arial';      // work around https://bugzilla.mozilla.org/show_bug.cgi?id=1845828
      
      for ( let r = 0; r < this.rows; r ++ ) {
        for ( let c = 0; c < this.cols; c ++ ) {
          const tile = this.tiles[ c ][ r ];

          ctx.save();
          ctx.translate( c, r );

          ctx.strokeRect( -0.5, -0.5, 1, 1 );

          if ( tile.dir ) {
            ctx.save();
            ctx.rotate( Dir[ tile.dir ].angle );
            ctx.fill( arrow );
            ctx.restore();
          }

          ctx.scale( 0.02, 0.02 );    // work around https://bugzilla.mozilla.org/show_bug.cgi?id=1845828
          ctx.fillText( `(${ c },${ r })`, 0, 20 );

          ctx.restore();
        }
      }
    }

    ctx.restore();
  }
}