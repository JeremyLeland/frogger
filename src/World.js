import { Dir } from './Entity.js';
import { Entities } from './Entities.js';
import { Entity } from './Entity.js';
import { Frog } from './entities/Frog.js';
import { Froggy } from './Froggy.js';
import { Player } from './Player.js';

import { Constants } from './Constants.js';

let animationTime = 0;

export class World
{ 
  entities = [];
  player;
  lives = Constants.MaxLives;
  rescued = [];
  timeLeft = 0;
  paused = false;
  needsRespawn = true;
  spawnTimer = 0;

  defeat = false;
  victory = false;

  #level;

  // TODO: Should World just own all the Level loading stuff, so callers don't have to worry about both?

  constructor( level ) {
    this.#level = level;

    this.timeLeft = level.time;

    this.entities = level.entities.map( e => ( { ...e } ) );
  }

  // TODO: Move this update()
  rescue( froggy ) {
    this.rescued.push( Entities[ froggy.type ].froggyIndex );
    this.entities = this.entities.filter( e => e != froggy );

    this.lives = Math.min( Constants.MaxLives, this.lives + 1 );

    this.needsRespawn = true;
    this.victory = this.rescued.length == Constants.NumFroggies;
  }

  requestPlayerMove( dir ) {
    if ( this.needsRespawn && this.spawnTimer < 0 ) {
      // TODO: Should all this should go up in request move? I'd like to have everything down here, 
      // but how do I set it up to request a respawn?
      // Don't "request" anything, just create the player up there -- also means no initial spawn

      this.needsRespawn = false;
      this.spawnTimer = Constants.SpawnDelay;
      
      // TODO: assign() instead of making new?
      this.player = {
        type: 'Player',
        color: 'green',
        x: this.#level.spawn.x,
        y: this.#level.spawn.y,
        dir: this.#level.spawn.dir,
        dx: 0,
        dy: 0,
        jumpTimeLeft: 0,
        jumpQueue: [],
        animationTime: 0,
        status: Frog.Status.Alive,
      };
      
      // Object.assign( this.player, this.#level.spawn );

      this.timeLeft = this.#level.time;
    }
    else {
      if ( dir != this.player.jumpQueue.at( -1 ) ) {
        this.player.jumpQueue.push( dir );
      }
    }
  }

  update( dt ) {
    if ( this.paused ) {
      return false;
    }
    else {
      animationTime += dt;

      //
      // Entities
      //

      this.entities.forEach( entity => {
        const speed = Entities[ entity.type ].Speed;

        if ( speed ) {
          entity.dir ??= this.#level.directions[ entity.x + entity.y * this.#level.cols ];

          let totalTime = dt;
          while ( totalTime > 0 ) {
            const dist = Dir[ entity.dir ].dist( entity.x, entity.y );
            const time = Math.min( dist / speed, totalTime );
            
            entity.dx = Dir[ entity.dir ].x * speed;
            entity.dy = Dir[ entity.dir ].y * speed;

            entity.x += entity.dx * time;
            entity.y += entity.dy * time;
            
            if ( time < totalTime ) {
              const col = Math.round( entity.x );
              const row = Math.round( entity.y );

              if ( 0 <= col && 0 <= row && col < this.#level.cols && row < this.#level.rows ) {
                const newDir = this.#level.directions[ col + row * this.#level.cols ];
                if ( newDir ) {
                  entity.dir = newDir;
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
                  // TODO: Move to Level class?
                  if ( this.#level.directions[ prevX + prevY * this.#level.cols ] ) {
                    const fromBackDir = prevDir;
                    const fromLeftDir = prevDir == 1 ? 4 : prevDir - 1;
                    const fromRightDir = prevDir == 4 ? 1 : prevDir + 1;
                    
                    for ( const testDir of [ fromBackDir, fromLeftDir, fromRightDir ] ) {
                      const testX = prevX - Dir[ testDir ].x;
                      const testY = prevY - Dir[ testDir ].y;

                      if ( 0 <= testX && 0 <= testY && testX < this.#level.cols && testY < this.#level.rows ) {
                        const dir = this.#level.directions[ testX + testY * this.#level.cols ];

                        if ( dir == testDir ) {
                          prevDir = testDir;
                          break;
                        }
                      }
                    }
                  }
                    
                  prevX -= Dir[ prevDir ].x;
                  prevY -= Dir[ prevDir ].y;
                }
                while ( 0 <= prevX && 0 <= prevY && prevX < this.#level.cols && prevY < this.#level.rows && ++tries < 100 );

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

      if ( this.needsRespawn ) {
        this.spawnTimer -= dt;
      }

      if ( this.player?.status == Frog.Status.Alive ) {
        this.player.animationTime = 0;

        this.player.x += this.player.dx * dt;
        this.player.y += this.player.dy * dt;

        if ( this.player.jumpTimeLeft > 0 ) {
          this.player.jumpTimeLeft -= dt;
          this.player.animationTime = this.player.jumpTimeLeft * MOVE_SPEED;
        }

        if ( this.player.jumpTimeLeft <= 0 ) {
          this.player.jumpTimeLeft = 0;

          this.player.dx = 0;
          this.player.dy = 0;

          const collidingWith = this.entities.find( 
            e => Math.abs( e.x - this.player.x ) < Entities[ e.type ].hitDist && Math.abs( e.y - this.player.y ) < Entities[ e.type ].hitDist
          );

          let goalX = Math.round( this.player.x );
          let goalY = Math.round( this.player.y );

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
              goalX = collidingWith.x;
              goalY = collidingWith.y;
              this.player.dx = collidingWith.dx;
              this.player.dy = collidingWith.dy;
            }
          }
          else {
            const tile = this.#level.getTileInfo( this.player.x, this.player.y );
            if ( !tile || tile.KillsPlayer ) {
              this.player.status = Frog.Status.Drowned;
            }
          }

          if ( this.player.status == Frog.Status.Alive ) {
            const cx = goalX - this.player.x;
            const cy = goalY - this.player.y;
            const p = 1 / ( 1 + 100 * Math.pow( Math.hypot( cx, cy ), 2 ) );
            this.player.x += p * cx;
            this.player.y += p * cy;
          }

          if ( !this.needsRespawn && this.player.status == Frog.Status.Alive && this.player.jumpQueue.length > 0 ) {
            const dir = this.player.jumpQueue.shift();
            this.player.dir = dir;

            // Take into account ride speed while determining next tile
            const nextX = this.player.x + Dir[ dir ].x + this.player.dx * JUMP_TIME;
            const nextY = this.player.y + Dir[ dir ].y + this.player.dy * JUMP_TIME;

            const nextTile = this.#level.getTileInfo( nextX, nextY );

            if ( nextTile && !nextTile.Solid ) {
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
          this.defeat = this.lives < 0;

          this.needsRespawn = true;
        }
      }

      return true;
    }
  }

  draw( ctx, showUI = true ) {
    ctx.save(); {
      ctx.translate( 0.5, 0.5 );
      ctx.lineWidth = 0.02;

      this.#level.draw( ctx );

      // TODO: If drowned, draw below level (with translucent water)
      
      if ( this.player ) {
        this.player.animationAction = this.player.status;

        if ( this.player.status != Frog.Status.Alive ) {
          Entity.draw( this.player, ctx );
        }
      }

      [ 'Froggy1', 'Froggy2', 'Froggy3', 'Froggy4', 'Froggy5', 'Froggy6', 'Turtle', 'LogStart', 'LogMiddle', 'LogEnd', 'RedCar', 'YellowCar', 'GreenCar', 'BlueCar' ].forEach( entityKey => {
        Entities[ entityKey ].drawPaths.forEach( pathInfo => {
          const combined = new Path2D();
          this.entities.filter( e => e.type == entityKey ).forEach( e => {
            const transform = new DOMMatrix();
            transform.translateSelf( e.x, e.y );
            transform.rotateSelf( Dir[ e.dir ]?.angle ?? 0 );
            
            combined.addPath( pathInfo.path ?? pathInfo.pathFunc( e.animationAction, animationTime ), transform );
          } );
  
          if ( pathInfo.fillStyle ) {
            ctx.fillStyle = pathInfo.fillStyle;
            ctx.fill( combined );
          }
          if ( pathInfo.strokeStyle ) {
            ctx.strokeStyle = pathInfo.strokeStyle;
            ctx.stroke( combined );
          }
        } );  
      } );

      
      // this.entities.forEach( entity => Entity.draw( entity, ctx, { time: animationTime } ) );

      if ( this.player && this.player.status == Frog.Status.Alive ) {
        Entity.draw( this.player, ctx );
      }
    }
    ctx.restore();

    // Victory/defeat banner
    if ( this.defeat )    drawBanner( ctx, 'Defeat!' );
    if ( this.victory )   drawBanner( ctx, 'Victory!' );

    // UI
    if ( showUI ) {
      ctx.save(); {
        ctx.translate( 0, 15 );
        ctx.fillStyle = 'gray';
        ctx.fillRect( 0, 0, 15, 1 );

        ctx.translate( 0.5, 0.5 );
        ctx.lineWidth = 0.02;

        // Froggies
        for ( let i = 0; i < Constants.NumFroggies; i ++ ) {
          if ( this.rescued.includes( i ) ) {
            ctx.save();
            ctx.rotate( Math.PI / 2 );
            Froggy.drawFroggy( ctx, i );
            ctx.restore();
          }
          ctx.translate( 1, 0 );
        }
        
        // Timer
        const timerGrad = ctx.createLinearGradient( 0, 0, 3, 0 );
        timerGrad.addColorStop( 0, 'red' );
        timerGrad.addColorStop( 0.5, 'yellow' );
        timerGrad.addColorStop( 1, 'green' );

        ctx.fillStyle = timerGrad;
        ctx.fillRect( 0, -0.15, 4 * ( this.timeLeft / this.#level.time ), 0.3 );
        ctx.strokeRect( 0, -0.15, 4, 0.3 );

        ctx.translate( 5, 0 );

        // Lives
        for ( let i = 4; i > 0; i -- ) {
          if ( i <= this.lives ) {
            ctx.save();
            ctx.rotate( -Math.PI / 2 );
            Player.drawPlayer( ctx );
            ctx.restore();
          }
          ctx.translate( 1, 0 );
        }
      }
      ctx.restore();
    }

    if ( this.paused ) {
      ctx.fillStyle = '#000b';
      ctx.fillRect( 0, 0, 16, 16 ); // make it extra big to cover everything

      ctx.textAlign = 'center';
      // NOTE: Safari doesn't seem to respect "textBaseline=middle", so offsetting manually
      ctx.font = '1px Silly';
      ctx.fillStyle = 'white';
      ctx.fillText( 'Paused', 15 / 2, 7.8 );
    }
  }
}

function drawBanner( ctx, text ) {
  ctx.save(); {
    ctx.fillStyle = '#000b';
    ctx.fillRect( 0, 6.5, 15, 2 );

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.05;
    ctx.strokeRect( -1, 6.5, 17, 2 );

    // TODO: Can text be part of a Path2D? Does that help anything?
    ctx.textAlign = 'center';
    ctx.font = '1px Silly';
    ctx.fillStyle = 'white';
    ctx.fillText( text, 15 / 2, 7.8 );
  }
  ctx.restore();
}
