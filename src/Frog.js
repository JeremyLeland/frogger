const FOOT_OFFSET_X = 0.4, FOOT_OFFSET_Y = 0.4;
const FOOT_SIZE = 0.1, TOE_LENGTH = 0.1;
const FOOT_SHIFT = -0.1;

const BODY_SIZE = 0.4;

const EYE_OFFSET_X = 0.18, EYE_OFFSET_Y = 0.17;
const EYE_SIZE = 0.1;

const PUPIL_OFFSET_X = 0.23, PUPIL_OFFSET_Y = 0.17;
const PUPIL_W = 0.05, PUPIL_H = 0.08;

const feet = new Path2D();

// [ -1, 1 ].forEach( dir => {
//   [ -1, 1 ].forEach( side => {
//     feet.moveTo( side * ( FOOT_OFFSET_X + 0.05 ), dir * FOOT_OFFSET_Y + 0.1 );
//     feet.lineTo( side * ( FOOT_OFFSET_X + 0.10 ), dir * FOOT_OFFSET_Y );
//     feet.quadraticCurveTo( 
//       side * FOOT_OFFSET_X, dir * FOOT_OFFSET_Y - 0.1, 
//       side * ( FOOT_OFFSET_X - 0.10 ), dir * FOOT_OFFSET_Y
//     );
//     feet.lineTo( side * ( FOOT_OFFSET_X - 0.05 ), dir * FOOT_OFFSET_Y + 0.1 );
//     feet.lineTo( side * ( FOOT_OFFSET_X + 0.05 ), dir * FOOT_OFFSET_Y + 0.1 );
//   } );
// } );

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

import { Entity } from './Entity.js';

export class Frog extends Entity {
  drawEntity( ctx ) {
    // TODO: Is there a way to reuse this? Is it worth it performance-wise?
    const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    gradient.addColorStop( 0, this.color );
    gradient.addColorStop( 1, 'black' );

    ctx.fillStyle = gradient;
    
    const footOffset = 0.1 * Math.sin( 0.01 * this.animationTime );

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
