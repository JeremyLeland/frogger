const FOOT_OFFSET_X = 0.4, FOOT_OFFSET_Y = 0.4;
const FOOT_SIZE = 0.1, TOE_LENGTH = 0.1;
const FOOT_SHIFT = -0.1;

const BODY_SIZE = 0.4;

const EYE_OFFSET_X = 0.18, EYE_OFFSET_Y = 0.17;
const EYE_SIZE = 0.1;

const PUPIL_OFFSET_X = 0.23, PUPIL_OFFSET_Y = 0.17;
const PUPIL_W = 0.05, PUPIL_H = 0.08;

const feet = new Path2D();

[ -1, 1 ].forEach( dir => {
  [ -1, 1 ].forEach( side => {
    const x = dir * FOOT_OFFSET_X + FOOT_SHIFT;
    const y = side * FOOT_OFFSET_Y;

    feet.moveTo( x,             y - FOOT_SIZE / 2 );
    feet.lineTo( x + FOOT_SIZE, y - FOOT_SIZE     );
    feet.quadraticCurveTo( 
      x + FOOT_SIZE + TOE_LENGTH, y, 
      x + FOOT_SIZE,              y + FOOT_SIZE
    );
    feet.lineTo( x, y + FOOT_SIZE / 2 );
    feet.lineTo( x, y - FOOT_SIZE / 2 );
  } );
} );

const body = new Path2D();
body.arc( 0, 0, BODY_SIZE, 0, Math.PI * 2 );

const sclera = new Path2D();
sclera.arc( EYE_OFFSET_X, -EYE_OFFSET_Y, EYE_SIZE, 0, Math.PI * 2 );
sclera.moveTo( EYE_OFFSET_X, EYE_OFFSET_Y + EYE_SIZE );
sclera.arc( EYE_OFFSET_X,  EYE_OFFSET_Y, EYE_SIZE, 0, Math.PI * 2 );

const pupils = new Path2D();
pupils.ellipse( PUPIL_OFFSET_X, -PUPIL_OFFSET_Y, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );
pupils.moveTo(  PUPIL_OFFSET_X, PUPIL_OFFSET_Y + PUPIL_H );
pupils.ellipse( PUPIL_OFFSET_X,  PUPIL_OFFSET_Y, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );

import { Direction, Entity } from './Entity.js';

const MOVE_SPEED = 0.003;

function getMove( have, want, dt ) {
  const goalMove = want - have;
  return Math.sign( goalMove ) * Math.min( MOVE_SPEED * dt, Math.abs( goalMove ) );
}

export class Frog extends Entity {
  #isJumping = false;
  #jumpQueue = [];

  constructor( values ) {
    super( values );

    this.goalX = this.x;
    this.goalY = this.y;
  }

  move( dir ) {
    this.#jumpQueue.push( dir );
  }

  update( dt ) {
    if ( this.#isJumping ) {
      this.x += getMove( this.x, this.goalX, dt );
      this.y += getMove( this.y, this.goalY, dt );

      if ( this.x == this.goalX && this.y == this.goalY ) {
        this.#isJumping = false;
        this.animationTime = 0;
      }
      else {
        this.animationTime += dt;
      }
    }
    else if ( this.#jumpQueue.length > 0 ) {
      const dir = this.#jumpQueue.shift();

      this.goalX = this.x + dir.x;
      this.goalY = this.y + dir.y;
      this.angle = dir.angle;
      this.#isJumping = true;
    }
  }

  drawEntity( ctx ) {
    // TODO: Is there a way to reuse this? Is it worth it performance-wise?
    const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    gradient.addColorStop( 0, this.color );
    gradient.addColorStop( 1, 'black' );

    ctx.fillStyle = gradient;
    
    const footOffset = -0.1 * Math.sin( this.animationTime * Math.PI * MOVE_SPEED );

    ctx.save();
    ctx.translate( footOffset, 0 );    
    ctx.fill( feet );
    ctx.stroke( feet );
    ctx.restore();

    const legs = new Path2D();

    [ -1, 1 ].forEach( dir => {
      [ -1, 1 ].forEach( side => {
        const footX = dir * FOOT_OFFSET_X + FOOT_SHIFT + footOffset;

        // TODO: Change magic numbers to named constants
        legs.moveTo( 0, side * ( FOOT_OFFSET_Y - 0.2 ) );
        legs.quadraticCurveTo(
          0, side * FOOT_OFFSET_Y,
          footX, side * ( FOOT_OFFSET_Y + FOOT_SIZE / 2 ), 
        );
        legs.lineTo( footX, side * ( FOOT_OFFSET_Y - FOOT_SIZE / 2 ) );
        legs.quadraticCurveTo( 
          dir * 0.1, side * ( FOOT_OFFSET_Y - 0.1 ), 
          dir * 0.2, side * ( FOOT_OFFSET_Y - 0.2 ), 
        );
      } );
    } );

    legs.closePath();

    ctx.fill( legs );
    ctx.stroke( legs );

    ctx.fill( body );
    ctx.stroke( body );

    ctx.fillStyle = 'white';
    ctx.fill( sclera );
    ctx.stroke( sclera );

    ctx.fillStyle = 'black';
    ctx.fill( pupils );
  }
}
