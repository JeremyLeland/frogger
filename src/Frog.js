const FOOT_DIST = 0.4;

const feet = new Path2D();

[ -1, 1 ].forEach( dir => {
  [ -1, 1 ].forEach( side => {
    feet.moveTo( side * 0.55, dir * FOOT_DIST + 0.1 );
    feet.lineTo( side * 0.6, dir * FOOT_DIST );
    feet.quadraticCurveTo( side * 0.5, dir * FOOT_DIST - 0.1, side * 0.4, dir * FOOT_DIST );
    feet.lineTo( side * 0.45, dir * FOOT_DIST + 0.1 );
    feet.lineTo( side * 0.55, dir * FOOT_DIST + 0.1 );
  } );
} );

const body = new Path2D();
body.arc( 0, 0, 0.5, 0, Math.PI * 2 );

const EYE_SIZE = 0.125;

const sclera = new Path2D();
sclera.arc( -0.2, -0.2, EYE_SIZE, 0, Math.PI * 2 );
sclera.moveTo( 0.2 + EYE_SIZE, -0.2 );
sclera.arc(  0.2, -0.2, EYE_SIZE, 0, Math.PI * 2 );

const PUPIL_W = 0.1, PUPIL_H = 0.06;

const pupils = new Path2D();
pupils.ellipse( -0.2, -0.27, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );
pupils.moveTo(  0.2 + PUPIL_W, -0.27 );
pupils.ellipse(  0.2, -0.27, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );

export class Frog {
  x = 320;
  y = 160;

  size = 128;

  color = 'green';

  animationTime = 0;

  draw( ctx ) {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.scale( this.size, this.size );

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 / this.size;

    
    ctx.fillStyle = this.color;
    
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
        legs.quadraticCurveTo( side * 0.5, 0, side * 0.55, dir * FOOT_DIST + 0.1 + footOffset );
        legs.lineTo( side * 0.45, dir * FOOT_DIST + 0.1 + footOffset );
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
