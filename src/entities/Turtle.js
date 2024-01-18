const LEG_L = 0.45, LEG_W = 0.08;
const HEAD_SIZE = 0.14;
const SHELL_SIZE = 0.3;

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

let bodyGrad, shellGrad;

export class Turtle {
  static drawTurtle( ctx, animationAction, animationTime = 0 ) {
    
    if ( !bodyGrad ) {
      bodyGrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
      bodyGrad.addColorStop( 0, 'green' );
      bodyGrad.addColorStop( 1, 'black' );
    }

    ctx.translate( -0.05, 0 );

    // ctx.fillStyle = bodyGrad;
    ctx.fillStyle = 'green';
    
    const legAngleOffset = 0.3 * Math.sin( 0.005 * animationTime );

    ctx.beginPath();

    [ -1, 1 ].forEach( side => {
      [ 0.4, 0.75 ].forEach( angle => {
        ctx.save();
        ctx.rotate( side * ( Math.PI * angle + legAngleOffset ) );    

        ctx.moveTo( 0, 0 );
        ctx.lineTo( LEG_L, -LEG_W );
        ctx.lineTo( LEG_L,  LEG_W );

        ctx.restore();
      } );
    } );

    ctx.moveTo( SHELL_SIZE + HEAD_SIZE * 1.5, 0 );
    ctx.arc( SHELL_SIZE + HEAD_SIZE / 2, 0, HEAD_SIZE, 0, Math.PI * 2 );

    ctx.fill();
    ctx.stroke();

    if ( !shellGrad ) {
      shellGrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
      shellGrad.addColorStop( 0, 'darkolivegreen' );
      shellGrad.addColorStop( 0.5, 'black' );
    }

    // ctx.fillStyle = shellGrad;
    ctx.fillStyle = 'darkolivegreen';

    ctx.fill( shell );
    ctx.stroke( shell );

    ctx.strokeStyle = '#000a';
    ctx.stroke( detail );
  }
}