const WIDTH = 0.8;  // as opposed to length (not necessarily in x axis)
const CORNER_RADIUS = 0.3;
const DETAIL_ROWS = 8;

export class Log {
  x = 0;
  y = 0;
  size = 1;

  length = 1;

  animationTime = 0;

  #body;
  #detail;

  constructor( values ) {
    Object.assign( this, values );

    this.#body = new Path2D();
    this.#body.roundRect( -0.5, -0.5 * WIDTH, this.length, WIDTH, CORNER_RADIUS );

    this.#detail = new Path2D();

    for ( let len = 0.1; len <= 0.4; len += 0.1 ) {
      for ( let x = -0.5 + CORNER_RADIUS; x < -0.5 + this.length - CORNER_RADIUS - 0.1; x += len * ( 2 + Math.random() ) ) {
        const y = WIDTH * ( Math.floor( Math.random() * DETAIL_ROWS ) / DETAIL_ROWS - 0.5 );
        
        this.#detail.moveTo( x, y );
        this.#detail.lineTo( x + len, y );
      }
    }
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.scale( this.size, this.size );

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 / this.size;

    const bodyGrad = ctx.createLinearGradient( 0, -1, 0, 1 );
    bodyGrad.addColorStop( 0, 'black' );
    bodyGrad.addColorStop( 0.5, '#884400' );
    bodyGrad.addColorStop( 1, 'black' );

    ctx.fillStyle = bodyGrad;

    ctx.fill( this.#body );
    ctx.stroke( this.#body );

    ctx.stroke( this.#detail );

    ctx.restore();
  }
}
