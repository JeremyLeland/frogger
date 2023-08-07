const LOG_WIDTH = 0.4;  // as opposed to length (not necessarily in x axis)
const END_SIZE = 0.3;
const DETAIL_ROWS = 8;

const start = new Path2D();
start.moveTo( 0.6, -LOG_WIDTH );
start.lineTo( -0.5 + END_SIZE, -LOG_WIDTH );
start.quadraticCurveTo( -0.5, -LOG_WIDTH, -0.5, 0 );
start.quadraticCurveTo( -0.5,  LOG_WIDTH, -0.5 + END_SIZE, LOG_WIDTH );
start.lineTo( 0.6, LOG_WIDTH );

const middle = new Path2D();
middle.moveTo( -0.55, -LOG_WIDTH );
middle.lineTo(  0.55, -LOG_WIDTH );
middle.moveTo( -0.55,  LOG_WIDTH );
middle.lineTo(  0.55,  LOG_WIDTH );

const end = new Path2D();
end.moveTo( -0.5, -LOG_WIDTH );
end.lineTo( 0.5 - END_SIZE, -LOG_WIDTH );
end.quadraticCurveTo( 0.5, -LOG_WIDTH, 0.5, 0 );
end.quadraticCurveTo( 0.5,  LOG_WIDTH, 0.5 - END_SIZE, LOG_WIDTH );
end.lineTo( -0.5, LOG_WIDTH );

// TODO: Log details
// for ( let len = 0.1; len <= 0.4; len += 0.1 ) {
//   for ( let x = -0.5 + CORNER_RADIUS; x < -0.5 + this.length - CORNER_RADIUS - 0.1; x += len * ( 2 + Math.random() ) ) {
//     const y = WIDTH * ( Math.floor( Math.random() * DETAIL_ROWS ) / DETAIL_ROWS - 0.5 );
    
//     this.#detail.moveTo( x, y );
//     this.#detail.lineTo( x + len, y );
//   }
// }

function setGradient( ctx ) {
  const bodyGrad = ctx.createLinearGradient( 0, -1, 0, 1 );
  bodyGrad.addColorStop( 0, 'black' );
  bodyGrad.addColorStop( 0.5, 'saddlebrown' );
  bodyGrad.addColorStop( 1, 'black' );

  ctx.fillStyle = bodyGrad;
}

export class Log {
  static drawStart( ctx ) {
    setGradient( ctx );
  
    ctx.fill( start );
    ctx.stroke( start );
  }

  static drawMiddle( ctx ) {
    setGradient( ctx );

    ctx.fillRect( -0.55, -LOG_WIDTH, 1.1, LOG_WIDTH * 2 );
    ctx.stroke( middle );
  }

  static drawEnd( ctx ) {
    setGradient( ctx );
  
    ctx.fill( end );
    ctx.stroke( end );
  }
}

