

import { Frog } from './Frog.js';

const MOVE_SPEED = 0.003;
const JUMP_TIME = 1 / MOVE_SPEED;

export class Player extends Frog {
  #jumpTimeLeft = 0;
  #jumpQueue = [];

  move( dir ) {
    this.#jumpQueue.push( dir );
  }

  update( dt, world ) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;

    if ( this.#jumpTimeLeft > 0 ) {
      this.#jumpTimeLeft -= dt;
      this.animationTime = this.#jumpTimeLeft * MOVE_SPEED;
    }

    if ( this.isAlive && this.#jumpTimeLeft <= 0 ) {
      this.#jumpTimeLeft = 0;
      this.dx = 0;
      this.dy = 0;

      const collidingWith = world.entities.find( 
        e => Math.abs( e.x - this.x ) < 0.5 && Math.abs( e.y - this.y ) < 0.5 
      );

      if ( collidingWith?.canRescue ) {
        world.rescue( collidingWith );
      }
      if ( collidingWith?.killsPlayer ) {
        this.isAlive = false;
      }
      else {
        this.ride = collidingWith;
      }

      if ( this.ride ) {        
        this.x = this.ride.x;
        this.y = this.ride.y;
      }
      else {
        this.x = Math.round( this.x );
        this.y = Math.round( this.y );

        if ( world.getTile( this.x, this.y ).tileInfo.KillsPlayer ) {
          this.isAlive = false;
        }
      }

      if ( this.#jumpQueue.length > 0 ) {
        const dir = this.#jumpQueue.shift();
        this.dir = dir;
  
        const nextTile = world.getTile( Math.round( this.x + dir.x ), Math.round( this.y + dir.y ) );

        if ( nextTile && !nextTile.tileInfo.Solid ) {
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
