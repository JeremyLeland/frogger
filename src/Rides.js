//
// Turtle
//
const LEG_L = 0.45, LEG_W = 0.08;
const HEAD_SIZE = 0.14;
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


const DETAIL_W_1 = 0.13, DETAIL_W_2 = 0.1, DETAIL_W_3 = 0.1;

const detail = new Path2D();

for ( let i = 0; i < 6; i ++ ) {
  const angle = i * Math.PI * 2 / 6;

  const ax = Math.cos( angle ) * DETAIL_W_1;
  const ay = Math.sin( angle ) * DETAIL_W_1;

  const bx = ax + Math.cos( angle ) * DETAIL_W_2;
  const by = ay + Math.sin( angle ) * DETAIL_W_2;

  const left = angle - Math.PI / 3;
  const cx = bx + Math.cos( left ) * DETAIL_W_3;
  const cy = by + Math.sin( left ) * DETAIL_W_3;

  const right = angle + Math.PI / 3;
  const dx = bx + Math.cos( right ) * DETAIL_W_3;
  const dy = by + Math.sin( right ) * DETAIL_W_3;

  detail.lineTo( ax, ay );
  detail.lineTo( bx, by );
  detail.lineTo( cx, cy );
  detail.moveTo( bx, by );
  detail.lineTo( dx, dy );
  detail.moveTo( ax, ay );
}

detail.lineTo( DETAIL_W_1, 0 );

// 
// Log
//
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

// TODO: Log details
// for ( let len = 0.1; len <= 0.4; len += 0.1 ) {
//   for ( let x = -0.5 + CORNER_RADIUS; x < -0.5 + this.length - CORNER_RADIUS - 0.1; x += len * ( 2 + Math.random() ) ) {
//     const y = WIDTH * ( Math.floor( Math.random() * DETAIL_ROWS ) / DETAIL_ROWS - 0.5 );
    
//     this.#detail.moveTo( x, y );
//     this.#detail.lineTo( x + len, y );
//   }
// }

function drawLog( ctx, path ) {
  const bodyGrad = ctx.createLinearGradient( 0, -1, 0, 1 );
  bodyGrad.addColorStop( 0, 'black' );
  bodyGrad.addColorStop( 0.5, 'saddlebrown' );
  bodyGrad.addColorStop( 1, 'black' );

  ctx.fillStyle = bodyGrad;

  ctx.fill( path );
  ctx.stroke( path );
}


export const Rides = {
  Turtle: {
    drawEntity: function( ctx ) {
      const bodyGrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
      bodyGrad.addColorStop( 0, 'green' );
      bodyGrad.addColorStop( 1, 'black' );

      ctx.translate( -0.05, 0 );

      ctx.fillStyle = bodyGrad;
      
      const legAngleOffset = 0.3 * Math.sin( 0.005 * this.animationTime );

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

      ctx.strokeStyle = '#000a';
      ctx.stroke( detail );
    }
  },
  LogStart: {
    drawEntity: function( ctx ) { drawLog( ctx, start ) }
  },
  LogMiddle: {
    drawEntity: function( ctx ) { drawLog( ctx, middle ) }
  },
  LogEnd: {
    drawEntity: function( ctx ) { drawLog( ctx, end ) }
  },
};

