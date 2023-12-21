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

import { Dir } from './Entity.js';
import { Props } from './Props.js';
import { Tiles } from './Tiles.js';
import { TileMap } from './TileMap.js';
import { Entities } from './Entities.js';
import { Frog } from './Frog.js';

import * as Constants from './Constants.js';

let animationTime = 0;

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
  // TODO: Spawn timer?
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
    this.spawn = json.spawn;

    this.entities = json.entities;

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
        jsonDirs.push( tile.dir ?? 0 );
      }
    }
    
    return {
      cols: this.cols,
      rows: this.rows,
      tileInfoKeys: Array.from( tileInfoKeys.keys() ),
      tiles: jsonTiles,
      directions: jsonDirs,
      entities: this.getEntitiesJson(),
      spawn: this.spawn,
      time: this.maxTime,
    };
  }

  getWorldstateJson() {
    return {
      entities: this.entities,
      player: this.player,
      rescued: this.rescued,
      timeLeft: this.timeLeft,
      lives: this.lives,
    }
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

  respawnPlayer() {
    this.timeLeft = this.maxTime;

    this.needsRespawn = false;

    this.player = {
      type: 'Player',
      x: this.spawn.x,
      y: this.spawn.y,
      dir: this.spawn.dir,
      color: 'green',
      status: Frog.Status.Alive,
    };
  }

  rescue( froggy ) {
    this.rescued.push( Entities[ froggy.type ].froggyIndex );
    this.entities = this.entities.filter( e => e != froggy );

    this.lives = Math.min( Constants.MaxLives, this.lives + 1 );

    this.needsRespawn = true;
    this.victory = this.rescued.length == Constants.NumFroggies;
  }

  requestPlayerMove( dir ) {
    if ( this.needsRespawn || this.player.status != Frog.Status.Alive ) {
      this.respawnPlayer();
    }
    else {
      if ( dir != this.player.jumpQueue.at( -1 ) ) {
        this.player.jumpQueue.push( dir );
      }
    }
  }

  update( dt ) {
    animationTime += dt;

    //
    // Entities
    //

    this.entities.forEach( entity => {
      const speed = Entities[ entity.type ].Speed;

      if ( speed ) {
        let totalTime = dt;
        while ( totalTime > 0 ) {
          const dist = Dir[ entity.dir ].dist( entity.x, entity.y );
          const time = Math.min( dist / speed, totalTime );
          
          entity.dx = Dir[ entity.dir ].x * speed;
          entity.dy = Dir[ entity.dir ].y * speed;

          entity.x += entity.dx * time;
          entity.y += entity.dy * time;
          
          if ( time < totalTime ) {
            const newTile = this.getTile( entity.x, entity.y );
            if ( newTile ) {
              if ( newTile.dir ) {
                entity.dir = newTile.dir;
              }
            }
            else {
              // Attempt to work backwards to find where to warp to

              // NOTE: entity gets messy because the old frogger allowed multiple paths to
              //       share a direction-less tile. We need to do extra work to accomodate
              //       entity case.

              let prevX = Math.round( entity.x );
              let prevY = Math.round( entity.y );
              let prevDir = entity.dir;
              let tries = 0;
              
              do {
                // Only check for incoming directions if current tile could change direction
                // Otherwise, just keep going back
                if ( this.getTile( prevX, prevY )?.dir ) {
                  const fromBackDir = prevDir;
                  const fromLeftDir = prevDir == 1 ? 4 : prevDir - 1;
                  const fromRightDir = prevDir == 4 ? 1 : prevDir + 1;
                  
                  for ( const testDir of [ fromBackDir, fromLeftDir, fromRightDir ] ) {
                    const testX = prevX - Dir[ testDir ].x;
                    const testY = prevY - Dir[ testDir ].y;
                    const testTile = this.getTile( testX, testY );
                    
                    if ( testTile?.dir == testDir ) {
                      prevDir = testDir;
                      break;
                    }
                  }
                }
                  
                prevX -= Dir[ prevDir ].x;
                prevY -= Dir[ prevDir ].y;
              }
              while ( this.getTile( prevX, prevY ) && ++tries < 100 );

              if ( tries == 100 ) {
                debugger;
              }

              entity.x = prevX;
              entity.y = prevY;
              entity.dir = prevDir;
            }
          }

          totalTime -= time;
        }
      }
    } );

    //
    // Player
    //

    // TODO: Put constants somewhere else
    const MOVE_SPEED = 0.003;
    const JUMP_TIME = 1 / MOVE_SPEED;

    if ( this.player.status == Frog.Status.Alive ) {
      this.player.dx ??= 0;
      this.player.dy ??= 0;
      this.player.jumpTimeLeft ??= 0;
      this.player.jumpQueue ??= [];
      this.player.animationTime = 0;

      this.player.x += this.player.dx * dt;
      this.player.y += this.player.dy * dt;

      if ( this.player.jumpTimeLeft > 0 ) {
        this.player.jumpTimeLeft -= dt;
        this.player.animationTime = this.player.jumpTimeLeft * MOVE_SPEED;
        this.player.zIndex = 2;
      }

      if ( this.player.jumpTimeLeft <= 0 ) {
        this.player.jumpTimeLeft = 0;
        this.player.zIndex = 0;

        this.player.dx = 0;
        this.player.dy = 0;

        const collidingWith = this.entities.find( 
          e => Math.abs( e.x - this.player.x ) < Entities[ e.type ].hitDist && Math.abs( e.y - this.player.y ) < Entities[ e.type ].hitDist
        );

        if ( collidingWith ) {   
          if ( Entities[ collidingWith.type ]?.canRescue ) {
            this.rescue( collidingWith );
          }
          else if ( Entities[ collidingWith.type ]?.killsPlayer ) {
            // If difference is even, they are facing parallel
            this.player.status = Math.abs( this.player.dir - collidingWith.dir ) % 2 == 0 ? 
              Frog.Status.SquishedHorizontal : Frog.Status.SquishedVertical;
          }
          else {
            this.player.x = collidingWith.x;
            this.player.y = collidingWith.y;
            this.player.dx = collidingWith.dx;
            this.player.dy = collidingWith.dy;
          }
        }
        else {
          const tileX = Math.round( this.player.x );
          const tileY = Math.round( this.player.y );

          const tile = this.getTile( tileX, tileY );
          if ( !tile || Tiles[ tile.tileInfoKey ].KillsPlayer ) {
            this.player.status = Frog.Status.Drowned;
          }
          else {
            this.player.x = tileX;
            this.player.y = tileY;
          }
        }

        if ( !this.needsRespawn && this.player.status == Frog.Status.Alive && this.player.jumpQueue.length > 0 ) {
          const dir = this.player.jumpQueue.shift();
          this.player.dir = dir;

          // Take into account ride speed while determining next tile
          const nextX = this.player.x + Dir[ dir ].x + this.player.dx * JUMP_TIME;
          const nextY = this.player.y + Dir[ dir ].y + this.player.dy * JUMP_TIME;
          const nextTile = this.getTile( Math.round( nextX ), Math.round( nextY ) );

          if ( nextTile && !Tiles[ nextTile.tileInfoKey ].Solid ) {
            this.player.jumpTimeLeft += JUMP_TIME;
            
            this.player.dx += Dir[ dir ].x * MOVE_SPEED;
            this.player.dy += Dir[ dir ].y * MOVE_SPEED;
          }
        }
      }

      if ( !this.needsRespawn && this.player.status == Frog.Status.Alive ) {
        this.timeLeft = Math.max( 0, this.timeLeft - dt );

        if ( this.timeLeft == 0 ) {
          this.player.status = Frog.Status.Expired;
        }
      }

      if ( this.player.status != Frog.Status.Alive ) {
        this.lives --;
      }
    }
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( 0.5, 0.5 );
    ctx.lineWidth = 0.02;

    this.#tileMap.draw( ctx );

    ctx.save();

    for ( let row = 0; row < this.rows; row ++ ) {
      ctx.save();
      
      for ( let col = 0; col < this.cols; col ++ ) {
    
        const prop = Props[ this.tiles[ col ][ row ].tileInfoKey ];
        prop?.draw( ctx );

        if ( this.spawn.x == col && this.spawn.y == row ) {
          Props[ 'Bullseye' ].draw( ctx );
        }

        ctx.translate( 1, 0 );
      }

      ctx.restore();
      ctx.translate( 0, 1 );
    }

    ctx.restore();
    
    // TODO: Draw player after CanRide and before KillsPlayer, unless player is jumping (or already dead)
    this.player.animationAction = this.player.status;

    if ( this.player.status != Frog.Status.Alive ) {
      drawEntity( ctx, this.player );
    }

    this.entities.forEach( entity => drawEntity( ctx, entity ) );

    if ( this.player.status == Frog.Status.Alive ) {
      drawEntity( ctx, this.player );
    }

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

function drawEntity( ctx, entity ) {
  ctx.save();
  ctx.translate( entity.x, entity.y );
  ctx.rotate( Dir[ entity.dir ]?.angle ?? 0 );
  // ctx.scale( entity.size, entity.size );   // nothing changes size for now

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 0.02;

  Entities[ entity.type ].draw( ctx, entity.animationAction, entity.animationTime ?? animationTime );

  ctx.restore();
}