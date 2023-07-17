const BASE_W = 0.1, HEAD_W = 0.3, NECK = 0, LEN = 0.3;
const arrow = new Path2D();
arrow.moveTo( -LEN,  -BASE_W );
arrow.lineTo(  NECK, -BASE_W );
arrow.lineTo(  NECK, -HEAD_W );
arrow.lineTo(  LEN,   0 );
arrow.lineTo(  NECK,  HEAD_W );
arrow.lineTo(  NECK,  BASE_W );
arrow.lineTo( -LEN,   BASE_W );
arrow.closePath();

const ARROW_COLOR = '#ff05';
const TILE_BORDER = 1 / 64;

function drawDashedArrow( ctx, x1, y1, x2, y2 ) {
  ctx.beginPath();
  ctx.moveTo( x1, y1 );
  ctx.lineTo( x2, y2 );
  ctx.setLineDash( [ 0.1, 0.1 ] );
  ctx.stroke();
  ctx.setLineDash( [] );

  const HEAD = 0.5;
  const angle = Math.atan2( y1 - y2, x1 - x2 );
  ctx.beginPath();
  ctx.moveTo( x2, y2 );
  ctx.arc( x2, y2, 0.1, angle - HEAD, angle + HEAD );
  ctx.closePath();
  ctx.fill();
}

export class Level
{
  tiles;

  draw( ctx ) {
    ctx.fillStyle = ctx.strokeStyle = ARROW_COLOR;
    ctx.lineWidth = TILE_BORDER;

    for ( let r = 0; r < this.tiles[ 0 ].length; r ++ ) {
      for ( let c = 0; c < this.tiles.length; c ++ ) {
        const tile = this.tiles[ c ][ r ];
        ctx.strokeRect( c - 0.5, r - 0.5, 1, 1 );

        if ( tile.dir ) {
          ctx.save();
          ctx.translate( c, r );
          ctx.rotate( tile.dir.angle );
          ctx.fill( arrow );
          ctx.restore();
        }
        else if ( tile.warp ) {
          drawDashedArrow( ctx, c, r, tile.warp.c, tile.warp.r );
        }
      }
    }
  }
}