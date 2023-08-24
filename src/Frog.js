const FOOT_OFFSET_X = 0.4, FOOT_OFFSET_Y = 0.4;
const FOOT_SIZE = 0.1, TOE_LENGTH = 0.1;
const FOOT_SHIFT = -0.1;

const BODY_SIZE = 0.4;

const body = new Path2D();
body.arc( 0, 0, BODY_SIZE, 0, Math.PI * 2 );

const bodySquishHoriz = new Path2D();
bodySquishHoriz.ellipse( 0, 0, BODY_SIZE + 0.1, BODY_SIZE, 0, 0, Math.PI * 2 );

const bodySquishVert = new Path2D();
bodySquishVert.ellipse( 0, 0, BODY_SIZE, BODY_SIZE + 0.1, 0, 0, Math.PI * 2 );

const EYE_OFFSET_X = 0.18, EYE_OFFSET_Y = 0.17;
const EYE_SIZE = 0.1;

const PUPIL_OFFSET_X = 0.23, PUPIL_OFFSET_Y = 0.17;
const PUPIL_W = 0.05, PUPIL_H = 0.08;

const sclera = new Path2D();
sclera.arc( EYE_OFFSET_X, -EYE_OFFSET_Y, EYE_SIZE, 0, Math.PI * 2 );
sclera.moveTo( EYE_OFFSET_X, EYE_OFFSET_Y + EYE_SIZE );
sclera.arc( EYE_OFFSET_X,  EYE_OFFSET_Y, EYE_SIZE, 0, Math.PI * 2 );

const pupils = new Path2D();
pupils.ellipse( PUPIL_OFFSET_X, -PUPIL_OFFSET_Y, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );
pupils.moveTo(  PUPIL_OFFSET_X, PUPIL_OFFSET_Y + PUPIL_H );
pupils.ellipse( PUPIL_OFFSET_X,  PUPIL_OFFSET_Y, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );

const exes = new Path2D();
exes.moveTo( EYE_OFFSET_X - EYE_SIZE, -EYE_OFFSET_Y - EYE_SIZE );
exes.lineTo( EYE_OFFSET_X + EYE_SIZE, -EYE_OFFSET_Y + EYE_SIZE );
exes.moveTo( EYE_OFFSET_X + EYE_SIZE, -EYE_OFFSET_Y - EYE_SIZE );
exes.lineTo( EYE_OFFSET_X - EYE_SIZE, -EYE_OFFSET_Y + EYE_SIZE );
exes.moveTo( EYE_OFFSET_X - EYE_SIZE, EYE_OFFSET_Y - EYE_SIZE );
exes.lineTo( EYE_OFFSET_X + EYE_SIZE, EYE_OFFSET_Y + EYE_SIZE );
exes.moveTo( EYE_OFFSET_X + EYE_SIZE, EYE_OFFSET_Y - EYE_SIZE );
exes.lineTo( EYE_OFFSET_X - EYE_SIZE, EYE_OFFSET_Y + EYE_SIZE );

import { Direction, Entity } from './Entity.js';

export const Death = {
  Expired: 0,
  Drowned: 1,
  SquishedHorizontal: 2,
  SquishedVertical: 3,
};

export class Frog extends Entity {
  isAlive = true;

  static getFrogGradient( ctx, color ) {
    const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    gradient.addColorStop( 0, color );
    gradient.addColorStop( 1, 'black' );
    return gradient;
  }

  static drawFrog( ctx, bodyGradient, animationTime = 0, isAlive = true, mannerOfDeath ) {
    ctx.fillStyle = bodyGradient;
    
    const footOffset = -0.1 * Math.sin( animationTime * Math.PI );

    const feet = new Path2D();

    [ -1, 1 ].forEach( dir => {
      [ -1, 1 ].forEach( side => {
        const x = dir * ( FOOT_OFFSET_X + ( mannerOfDeath == Death.SquishedHorizontal ? 0.1 : 0 ) ) + FOOT_SHIFT + footOffset;
        const y = side * ( FOOT_OFFSET_Y + ( mannerOfDeath == Death.SquishedVertical ? 0.1 : 0 ) );

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

    ctx.fill( feet );
    ctx.stroke( feet );

    const legs = new Path2D();

    [ -1, 1 ].forEach( dir => {
      [ -1, 1 ].forEach( side => {
        const footX = dir * ( FOOT_OFFSET_X + ( mannerOfDeath == Death.SquishedHorizontal ? 0.1 : 0 ) ) + FOOT_SHIFT + footOffset;
        const footY = FOOT_OFFSET_Y + ( mannerOfDeath == Death.SquishedVertical ? 0.1 : 0 );

        // TODO: Change magic numbers to named constants
        legs.moveTo( 0, side * ( footY - 0.2 ) );
        legs.quadraticCurveTo(
          0, side * footY,
          footX, side * ( footY + FOOT_SIZE / 2 ), 
        );
        legs.lineTo( footX, side * ( footY - FOOT_SIZE / 2 ) );
        legs.quadraticCurveTo( 
          dir * 0.1, side * ( footY - 0.1 ), 
          dir * 0.2, side * ( footY - 0.2 ), 
        );
      } );
    } );

    legs.closePath();

    ctx.fill( legs );
    ctx.stroke( legs );

    if ( mannerOfDeath == Death.SquishedHorizontal ) {
      ctx.fill( bodySquishHoriz );
      ctx.stroke( bodySquishHoriz );
    }
    else if ( mannerOfDeath == Death.SquishedVertical ) {
      ctx.fill( bodySquishVert );
      ctx.stroke( bodySquishVert );
    }
    else {
      ctx.fill( body );
      ctx.stroke( body );
    }
      
    if ( isAlive ) {
      ctx.fillStyle = 'white';
      ctx.fill( sclera );
      ctx.stroke( sclera );
      
      ctx.fillStyle = 'black';
      ctx.fill( pupils );
    }
    else {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = EYE_SIZE / 2;
      ctx.stroke( exes );
    }

    if ( mannerOfDeath == Death.Drowned ) {
      ctx.fillStyle = '#000080aa';
      ctx.fillRect( -0.5, -0.5, 1, 1 );
    }
  }
}
