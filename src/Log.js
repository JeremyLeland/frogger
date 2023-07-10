const WIDTH = 0.8;


export class Log {
  x = 0;
  y = 0;
  size = 1;

  length = 1;

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

    const bodyGrad = ctx.createLinearGradient( 0, -1, 0, 1 );
    bodyGrad.addColorStop( 0, 'black' );
    bodyGrad.addColorStop( 0.5, 'brown' );
    bodyGrad.addColorStop( 1, 'black' );

    ctx.fillStyle = bodyGrad;
    
    const body = new Path2D();
    body.roundRect( -0.5, -0.5 * WIDTH, this.length, WIDTH, 0.2 );

    ctx.fill( body );
    ctx.stroke( body );

    ctx.restore();
  }
}
