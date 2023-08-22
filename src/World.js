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

import { Direction } from './Entity.js';
import { Props } from './Props.js';
import { TileMap } from './TileMap.js';
import { Entity } from './Entity.js';
import { Entities } from './Entities.js';
import { Death } from './Frog.js';
import { Player } from './Player.js';

import * as Constants from './Constants.js';
import * as Utility from './common/Utility.js';

const DirArray = [
  Direction.Up,
  Direction.Left,
  Direction.Down,
  Direction.Right
];
const DirMap = new Map( DirArray.map( ( e, i ) => [ e, i + 1 ] ) );

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
  crop;
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

    this.crop = json.crop ? {
      minCol: json.crop[ 0 ],
      minRow: json.crop[ 1 ],
      maxCol: json.crop[ 2 ],
      maxRow: json.crop[ 3 ],
    } : {
      minCol: 0,
      minRow: 0,
      maxCol: json.cols - 1,
      maxRow: json.rows - 1,
    }

    json.tiles?.forEach( ( tileIndex, index ) => {
      const col = index % json.cols;
      const row = Math.floor( index / json.cols );

      this.tiles[ col ][ row ].tileInfoKey = json.tileInfoKeys[ tileIndex ];
    } );

    json.directions?.forEach( ( dirIndex, index ) => {
      if ( dirIndex > 0 ) {
        const col = index % json.cols;
        const row = Math.floor( index / json.cols );

        if ( dirIndex > 0 ) {
          this.tiles[ col ][ row ].dir = DirArray[ dirIndex - 1 ];
        }
      }
    } );

    json.warps?.forEach( coords => 
      this.tiles[ coords[ 0 ] ][ coords [ 1 ] ].warp = { col: coords[ 2 ], row: coords[ 3 ] }
    );

    this.#tileMap = new TileMap( this.tiles );

    for ( const type in json.entities ) {
      json.entities[ type ]?.forEach( coords => 
        this.addEntity( type, coords[ 0 ], coords[ 1 ] ) 
      );
    }

    this.maxTime = json.time ?? 15000;
    
    this.lives = Constants.MaxLives;
    
    [ this.spawnCol, this.spawnRow ] = json.player ?? [ Math.floor( this.cols / 2 ), Math.floor( this.rows / 2 ) ];
    this.respawnPlayer();
  }

  toJson() {
    const tileInfoKeys = new Map();
    const jsonTiles = [];
    const jsonDirs = [];
    const jsonWarps = [];
    const jsonEntities = {};

    for ( let index = 0, row = 0; row < this.rows; row ++ ) {
      for ( let col = 0; col < this.cols; col ++, index ++ ) {
        const tile = this.tiles[ col ][ row ];

        if ( !tileInfoKeys.has( tile.tileInfoKey ) ) {
          tileInfoKeys.set( tile.tileInfoKey, tileInfoKeys.size );
        }
        jsonTiles.push( tileInfoKeys.get( tile.tileInfoKey ) );
        jsonDirs.push( tile.dir ? DirMap.get( tile.dir ) : 0 );

        if ( tile.warp ) {
          jsonWarps.push( [ col, row, tile.warp.col, tile.warp.row ] );
        }
      }
    }

    this.entities.forEach( entity => {
      jsonEntities[ entity.entityKey ] ??= [];
      jsonEntities[ entity.entityKey ].push( [ entity.x, entity.y ] );
    } );
    
    return {
      cols: this.cols,
      rows: this.rows,
      crop: [ this.crop.minCol, this.crop.minRow, this.crop.maxCol, this.crop.maxRow ],
      tileInfoKeys: Array.from( tileInfoKeys.keys() ),
      tiles: jsonTiles,
      directions: jsonDirs,
      warps: jsonWarps,
      entities: jsonEntities,
      player: [ this.spawnCol, this.spawnRow ],
      time: this.maxTime,
    };
  }

  getTile( col, row ) {
    if ( this.crop.minCol <= col && col <= this.crop.maxCol && 
         this.crop.minRow <= row && row <= this.crop.maxRow ) {
      return this.tiles[ col ][ row ];
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

  setWarp( startCol, startRow, endCol, endRow ) {
    const start = this.tiles[ startCol ][ startRow ];
    start.dir = null;
    start.warp = { col: endCol, row: endRow };
  }

  clearWarp( col, row ) {
    this.tiles[ col ][ row ].warp = null;
  }

  addEntity( type, col, row ) {
    this.removeEntity( col, row );

    this.entities.push(
      Object.assign( 
        new Entity( {
          x: col,
          y: row,
          dir: this.tiles[ col ]?.[ row ]?.dir ?? Direction.Right,
        } ), 
        Entities[ type ]
      )
    );
  }

  removeEntity( col, row ) {
    this.entities = this.entities.filter( e => e.x != col || e.y != row );
  }

  // TODO: Fix warps when adding/removing!

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
    this.crop.maxCol += delta;

    for ( let r = 0; r < this.rows; r ++ ) {
      for ( let c = 0; c < this.cols; c ++ ) {
        const tile = this.tiles[ c ][ r ];
        if ( tile.warp?.col >= col ) {
            tile.warp.col += delta;
        }
      }
    }

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
    this.crop.maxRow += delta;

    for ( let r = 0; r < this.rows; r ++ ) {
      for ( let c = 0; c < this.cols; c ++ ) {
        const tile = this.tiles[ c ][ r ];
        if ( tile.warp?.row >= row ) {
            tile.warp.row += delta;
        }
      }
    }

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

    this.player = new Player( {
      x: this.spawnCol, 
      y: this.spawnRow, 
      color: 'green',
      dir: this.tiles[ this.spawnCol ][ this.spawnRow ].dir ?? Direction.Right
    } );
  }

  rescue( entity ) {
    this.rescued.push( entity );
    this.entities = this.entities.filter( e => e != entity );

    this.lives = Math.min( Constants.MaxLives, this.lives + 1 );

    this.needsRespawn = true;
    this.victory = this.entities.filter( e => e.canRescue ).length == 0;
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

  draw( ctx, showCropped = false ) {
    ctx.save();
    ctx.translate( 0.5, 0.5 );

    if ( !showCropped ) {
      ctx.translate( -this.crop.minCol, -this.crop.minRow );
    }

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
    
    this.entities.filter( e => e.zIndex < this.player.zIndex ).forEach( e => e.draw( ctx ) );
    this.player?.draw( ctx );
    this.entities.filter( e => e.zIndex >= this.player.zIndex ).forEach( e => e.draw( ctx ) );

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
            ctx.rotate( tile.dir.angle );
            ctx.fill( arrow );
            ctx.restore();
          }

          ctx.scale( 0.02, 0.02 );    // work around https://bugzilla.mozilla.org/show_bug.cgi?id=1845828
          ctx.fillText( `(${ c },${ r })`, 0, 20 );

          ctx.restore();
          
          if ( tile.warp ) {
            ctx.setLineDash( [ 0.1, 0.1 ] );
            Utility.drawArrow( ctx, c, r, tile.warp.col, tile.warp.row );
            ctx.setLineDash( [] );
          }
        }
      }
    }

    ctx.restore();

    if ( showCropped ) {
      // TODO: Precalculate this path? Would need to update whenever resized
      ctx.beginPath();
      ctx.moveTo( this.crop.minCol,     this.crop.minRow     );
      ctx.lineTo( this.crop.minCol,     this.crop.maxRow + 1 );
      ctx.lineTo( this.crop.maxCol + 1, this.crop.maxRow + 1 );
      ctx.lineTo( this.crop.maxCol + 1, this.crop.minRow     );
      ctx.lineTo( this.crop.minCol,     this.crop.minRow     );
      
      ctx.setLineDash( [ 0.1, 0.1 ] );
      ctx.lineWidth = 0.05;
      ctx.stroke();
      
      ctx.lineTo( 0, 0 );
      ctx.lineTo( this.cols, 0 );
      ctx.lineTo( this.cols, this.rows );
      ctx.lineTo( 0, this.rows );
      ctx.lineTo( 0, 0 );
      
      ctx.fillStyle = "#000b";
      ctx.fill();
    }
  }
}