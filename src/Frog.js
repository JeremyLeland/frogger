const FOOT_OFFSET_X = 0.4, FOOT_OFFSET_Y = 0.4;
const BODY_SIZE = 0.4;
const EYE_OFFSET_X = 0.17, EYE_OFFSET_Y = -0.18;
const EYE_SIZE = 0.1;
const PUPIL_OFFSET_X = 0.17, PUPIL_OFFSET_Y = -0.23;
const PUPIL_W = 0.08, PUPIL_H = 0.05;

const feet = new Path2D();

[ -1, 1 ].forEach( dir => {
  [ -1, 1 ].forEach( side => {
    feet.moveTo( side * ( FOOT_OFFSET_X + 0.05 ), dir * FOOT_OFFSET_Y + 0.1 );
    feet.lineTo( side * ( FOOT_OFFSET_X + 0.10 ), dir * FOOT_OFFSET_Y );
    feet.quadraticCurveTo( 
      side * FOOT_OFFSET_X, dir * FOOT_OFFSET_Y - 0.1, 
      side * ( FOOT_OFFSET_X - 0.10 ), dir * FOOT_OFFSET_Y
    );
    feet.lineTo( side * ( FOOT_OFFSET_X - 0.05 ), dir * FOOT_OFFSET_Y + 0.1 );
    feet.lineTo( side * ( FOOT_OFFSET_X + 0.05 ), dir * FOOT_OFFSET_Y + 0.1 );
  } );
} );

const body = new Path2D();
body.arc( 0, 0, BODY_SIZE, 0, Math.PI * 2 );

const sclera = new Path2D();
sclera.arc( -EYE_OFFSET_X, EYE_OFFSET_Y, EYE_SIZE, 0, Math.PI * 2 );
sclera.moveTo( EYE_OFFSET_X + EYE_SIZE, EYE_OFFSET_Y );
sclera.arc(  EYE_OFFSET_X, EYE_OFFSET_Y, EYE_SIZE, 0, Math.PI * 2 );

const pupils = new Path2D();
pupils.ellipse( -PUPIL_OFFSET_X, PUPIL_OFFSET_Y, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );
pupils.moveTo(  PUPIL_OFFSET_X + PUPIL_W, PUPIL_OFFSET_Y );
pupils.ellipse(  PUPIL_OFFSET_X, PUPIL_OFFSET_Y, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );

export class Frog {
  x = 0;
  y = 0;
  size = 1;
  color = 'red';

  animationTime = 0;

  constructor( values ) {
    Object.assign( this, values );
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.scale( this.size, this.size );

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 / this.size;

    // TODO: Is there a way to reuse this? Is it worth it performance-wise?
    const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    gradient.addColorStop( 0, this.color );
    gradient.addColorStop( 1, 'black' );

    ctx.fillStyle = gradient;
    
    const footOffset = 0.1 * Math.cos( 0.01 * this.animationTime );

    ctx.save();
    ctx.translate( 0, footOffset );    
    ctx.fill( feet );
    ctx.stroke( feet );
    ctx.restore();

    const legs = new Path2D();

    [ -1, 1 ].forEach( dir => {
      [ -1, 1 ].forEach( side => {
        legs.moveTo( side * ( FOOT_OFFSET_X - 0.2 ), 0 );
        legs.quadraticCurveTo(
          side * FOOT_OFFSET_X, 0,
          side * ( FOOT_OFFSET_X + 0.05 ), dir * FOOT_OFFSET_Y + 0.1 + footOffset 
        );
        legs.lineTo( side * ( FOOT_OFFSET_X - 0.05 ), dir * FOOT_OFFSET_Y + 0.1 + footOffset );
        legs.quadraticCurveTo( side * ( FOOT_OFFSET_X - 0.1 ), dir * 0.1, side * ( FOOT_OFFSET_X - 0.2 ), dir * 0.2 );
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

    ctx.restore();
  }
}
