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

import { Entity } from './Entity.js';

export class Turtle extends Entity {

  moveSpeed = 0.001;  // TODO: Get from tile (for faster/slower water?)

  move( dir ) {
    this.goalX = Math.floor( this.x ) + dir.x;
    this.goalY = Math.floor( this.y ) + dir.y;
    this.angle = dir.angle;
  }

  update( dt, world ) {
    super.update( dt );

    if ( this.x == this.goalX && this.y == this.goalY ) {
      let tile = world.tiles[ Math.floor( this.x ) ][ Math.floor( this.y ) ];

      if ( tile.warp ) {
        this.x = tile.warp.c;
        this.y = tile.warp.r;

        tile = world.tiles[ tile.warp.c ][ tile.warp.r ];
      }

      if ( tile.dir ) {
        this.move( tile.dir );
      }
    }
  }
  
  drawEntity( ctx ) {
    const bodyGrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    bodyGrad.addColorStop( 0, 'green' );
    bodyGrad.addColorStop( 1, 'black' );

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

    ctx.stroke( detail );
  }
}
