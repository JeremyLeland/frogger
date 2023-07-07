const LEG_L = 0.45, LEG_W = 0.08;
const HEAD_SIZE = 0.15;
const SHELL_SIZE = 0.3;

const leg = new Path2D();
leg.moveTo( 0, 0 );
leg.lineTo( LEG_L, -LEG_W );
leg.lineTo( LEG_L,  LEG_W );
leg.closePath();

const head = new Path2D();
head.arc( SHELL_SIZE + HEAD_SIZE / 2, 0, HEAD_SIZE, 0, Math.PI * 2 );

const shell = new Path2D();
shell.arc( 0, 0, SHELL_SIZE, 0, Math.PI * 2 );


export class Turtle {
  x = 0;
  y = 0;
  size = 1;

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

    const bodyGrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    bodyGrad.addColorStop( 0, 'green' );
    bodyGrad.addColorStop( 1, 'black' );

    ctx.fillStyle = bodyGrad;
    
    const legAngleOffset = 0.3 * Math.cos( 0.005 * this.animationTime );

    [ -1, 1 ].forEach( side => {
      [ 0.4, 0.75 ].forEach( angle => {
        ctx.save();
        ctx.rotate( side * ( Math.PI * angle + legAngleOffset ) );    
        ctx.fill( leg );
        ctx.stroke( leg );
        ctx.restore();
      } );
    } );

    ctx.fill( head );
    ctx.stroke( head );

    const shellGrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    shellGrad.addColorStop( 0, 'darkolivegreen' );
    shellGrad.addColorStop( 0.5, 'black' );

    ctx.fillStyle = shellGrad;

    ctx.fill( shell );
    ctx.stroke( shell );

    ctx.restore();
  }
}
