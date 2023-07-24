const LOG_WIDTH = 0.4;  // as opposed to length (not necessarily in x axis)
const END_SIZE = 0.3;
const DETAIL_ROWS = 8;

const start = new Path2D();
start.moveTo( 0.5, -LOG_WIDTH );
start.lineTo( -0.5 + END_SIZE, -LOG_WIDTH );
start.quadraticCurveTo( -0.5, -LOG_WIDTH, -0.5, 0 );
start.quadraticCurveTo( -0.5,  LOG_WIDTH, -0.5 + END_SIZE, LOG_WIDTH );
start.lineTo( 0.5, LOG_WIDTH );

const middle = new Path2D();
middle.moveTo( -0.5, -LOG_WIDTH );
middle.lineTo(  0.6, -LOG_WIDTH );  // Making this wider so the line is 
middle.lineTo(  0.6,  LOG_WIDTH );  // always hidden by the next piece
middle.lineTo( -0.5,  LOG_WIDTH );

const end = new Path2D();
end.moveTo( -0.5, -LOG_WIDTH );
end.lineTo( 0.5 - END_SIZE, -LOG_WIDTH );
end.quadraticCurveTo( 0.5, -LOG_WIDTH, 0.5, 0 );
end.quadraticCurveTo( 0.5,  LOG_WIDTH, 0.5 - END_SIZE, LOG_WIDTH );
end.lineTo( -0.5, LOG_WIDTH );

const paths = { start: start, middle: middle, end: end };

import { Entity } from './Entity.js';

export class Log extends Entity {
  #path;

  constructor( values ) {
    super( values );

    this.#path = paths[ this.logType ];

    // for ( let len = 0.1; len <= 0.4; len += 0.1 ) {
    //   for ( let x = -0.5 + CORNER_RADIUS; x < -0.5 + this.length - CORNER_RADIUS - 0.1; x += len * ( 2 + Math.random() ) ) {
    //     const y = WIDTH * ( Math.floor( Math.random() * DETAIL_ROWS ) / DETAIL_ROWS - 0.5 );
        
    //     this.#detail.moveTo( x, y );
    //     this.#detail.lineTo( x + len, y );
    //   }
    // }
  }

  drawEntity( ctx ) {
    const bodyGrad = ctx.createLinearGradient( 0, -1, 0, 1 );
    bodyGrad.addColorStop( 0, 'black' );
    bodyGrad.addColorStop( 0.5, 'saddlebrown' );
    bodyGrad.addColorStop( 1, 'black' );

    ctx.fillStyle = bodyGrad;

    ctx.fill( this.#path );
    ctx.stroke( this.#path );

    // ctx.stroke( this.#detail );
  }
}
