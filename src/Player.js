

import { Death, Frog } from './Frog.js';

const MOVE_SPEED = 0.003;
const JUMP_TIME = 1 / MOVE_SPEED;

let bodyGrad;

import { Tiles } from './Tiles.js';

export class Player extends Frog {
  #jumpTimeLeft = 0;
  #jumpQueue = [];

  static drawPlayer( ctx ) {
    bodyGrad ??= Frog.getFrogGradient( ctx, 'green' );

    Frog.drawFrog( ctx, bodyGrad );
  }

  move( dir ) {
    if ( dir != this.#jumpQueue.at( -1 ) ) {
      this.#jumpQueue.push( dir );
    }
  }

  kill( mannerOfDeath ) {
    this.isAlive = false;
    this.mannerOfDeath = mannerOfDeath;
    this.animationTime = 0;   // TODO: death splat animation?
    this.zIndex = -2;
    this.#jumpQueue = [];
  }

  update( dt, world ) {
    if ( this.isAlive ) {
      this.x += this.dx * dt;
      this.y += this.dy * dt;

      if ( this.#jumpTimeLeft > 0 ) {
        this.#jumpTimeLeft -= dt;
        this.animationTime = this.#jumpTimeLeft * MOVE_SPEED;
        this.zIndex = 2;
      }

      if ( this.#jumpTimeLeft <= 0 ) {
        this.#jumpTimeLeft = 0;
        this.zIndex = 0;

        this.dx = 0;
        this.dy = 0;

        const collidingWith = world.entities.find( 
          e => Math.abs( e.x - this.x ) < e.hitDist && Math.abs( e.y - this.y ) < e.hitDist
        );

        if ( collidingWith?.canRescue ) {
          world.rescue( collidingWith );
          this.#jumpQueue = [];
        }
        else if ( collidingWith?.killsPlayer ) {
          if ( ( this.dir.x == 0 && collidingWith.dir.x == 0 ) ||
               ( this.dir.y == 0 && collidingWith.dir.y == 0 ) ) {
            world.killPlayer( Death.SquishedHorizontal );
          }
          else {
            world.killPlayer( Death.SquishedVertical );
          }
        }
        else {
          this.ride = collidingWith;
        }

        if ( this.ride ) {        
          this.x = this.ride.x;
          this.y = this.ride.y;
        }
        else {
          const tileX = Math.round( this.x );
          const tileY = Math.round( this.y );

          const tile = world.getTile( tileX, tileY );
          if ( !tile || Tiles[ tile.tileInfoKey ].KillsPlayer ) {
            world.killPlayer( Death.Drowned );
          }
          else {
            this.x = tileX;
            this.y = tileY;
          }
        }

        if ( this.#jumpQueue.length > 0 ) {
          const dir = this.#jumpQueue.shift();
          this.dir = dir;

          // Take into account ride speed while determining next tile
          const nextX = this.x + dir.x + ( this.ride?.dx ?? 0 ) * JUMP_TIME;
          const nextY = this.y + dir.y + ( this.ride?.dy ?? 0 ) * JUMP_TIME;
          const nextTile = world.getTile( Math.round( nextX ), Math.round( nextY ) );

          if ( nextTile && !Tiles[ nextTile.tileInfoKey ].Solid ) {
            this.#jumpTimeLeft += JUMP_TIME;
            
            this.dx = dir.x * MOVE_SPEED;
            this.dy = dir.y * MOVE_SPEED;
            
            if ( this.ride ) {
              this.dx += this.ride.dx;
              this.dy += this.ride.dy;
              this.ride = null;
            }
          }
        }
      }
    }
  }

  drawEntity( ctx ) {
    bodyGrad ??= Frog.getFrogGradient( ctx, 'green' );

    Frog.drawFrog( ctx, bodyGrad, this.animationTime, this.isAlive, this.mannerOfDeath );
  }
}
