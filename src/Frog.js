const FOOT_X_OFFSET = 0.5, FOOT_Y_OFFSET = 0.4;
const BODY_SIZE = 0.5;
const EYE_SIZE = 0.125;
const PUPIL_W = 0.1, PUPIL_H = 0.06;

const feet = new Path2D();

[ -1, 1 ].forEach( dir => {
  [ -1, 1 ].forEach( side => {
    feet.moveTo( side * ( FOOT_X_OFFSET + 0.05 ), dir * FOOT_Y_OFFSET + 0.1 );
    feet.lineTo( side * ( FOOT_X_OFFSET + 0.10 ), dir * FOOT_Y_OFFSET );
    feet.quadraticCurveTo( 
      side * FOOT_X_OFFSET, dir * FOOT_Y_OFFSET - 0.1, 
      side * ( FOOT_X_OFFSET - 0.10 ), dir * FOOT_Y_OFFSET
    );
    feet.lineTo( side * ( FOOT_X_OFFSET - 0.05 ), dir * FOOT_Y_OFFSET + 0.1 );
    feet.lineTo( side * ( FOOT_X_OFFSET + 0.05 ), dir * FOOT_Y_OFFSET + 0.1 );
  } );
} );

const body = new Path2D();
body.arc( 0, 0, BODY_SIZE, 0, Math.PI * 2 );

const sclera = new Path2D();
sclera.arc( -0.2, -0.2, EYE_SIZE, 0, Math.PI * 2 );
sclera.moveTo( 0.2 + EYE_SIZE, -0.2 );
sclera.arc(  0.2, -0.2, EYE_SIZE, 0, Math.PI * 2 );

const pupils = new Path2D();
pupils.ellipse( -0.2, -0.27, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );
pupils.moveTo(  0.2 + PUPIL_W, -0.27 );
pupils.ellipse(  0.2, -0.27, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );

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
        legs.moveTo( side * 0.3, 0 );
        legs.quadraticCurveTo( side * 0.5, 0, side * 0.55, dir * FOOT_Y_OFFSET + 0.1 + footOffset );
        legs.lineTo( side * 0.45, dir * FOOT_Y_OFFSET + 0.1 + footOffset );
        legs.quadraticCurveTo( side * 0.4, dir * 0.1, side * 0.3, dir * 0.2 );
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
