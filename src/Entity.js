import { Entities } from './Entities.js';

export const Direction = {
  None: 0, Up: 1, Left: 2, Down: 3, Right: 4
};

// TODO: Rename DirInfo, put in a better named file?
export const Dir = [
  /* none */  { x:  0, y:  0, angle:  0          , dist: ( x, y ) => 0                       },
  /*Up:*/     { x:  0, y: -1, angle: -Math.PI / 2, dist: ( x, y ) => y - Math.ceil( y - 1 )  },
  /*Left:*/   { x: -1, y:  0, angle:  Math.PI    , dist: ( x, y ) => x - Math.ceil( x - 1 )  },
  /*Down:*/   { x:  0, y:  1, angle:  Math.PI / 2, dist: ( x, y ) => Math.floor( y + 1 ) - y },
  /*Right:*/  { x:  1, y:  0, angle:  0          , dist: ( x, y ) => Math.floor( x + 1 ) - x },
];

export const Rasterized = {};

// TODO: Don't use {} for parameter here (save heap?)

// NOTE: Using 1.5 to give extra space for log center, animated frog legs, etc
const SIZE = 1.5;

export function draw( entity, ctx, { dir, action, time } = {} ) {
  let rasterized = Rasterized[ entity.type ];

  if ( !rasterized ) {
    const image = new OffscreenCanvas( SIZE * ctx.scaleVal * devicePixelRatio, SIZE * ctx.scaleVal * devicePixelRatio );
    const offscreenCtx = image.getContext( '2d' );

    offscreenCtx.scale( image.width / SIZE, image.height / SIZE );
    offscreenCtx.translate( SIZE / 2, SIZE / 2 );

    offscreenCtx.strokeStyle = 'black';
    offscreenCtx.lineWidth = 0.02;

    rasterized = Rasterized[ entity.type ] = {
      image: image,
      ctx: offscreenCtx,
      needsRedraw: true,
    }
  }

  if ( rasterized.needsRedraw ) {
    rasterized.ctx.clearRect( -SIZE / 2, -SIZE / 2, SIZE, SIZE );

    Entities[ entity.type ].draw( rasterized.ctx, action ?? entity.animationAction, time ?? entity.animationTime ?? 0 );

    rasterized.needsRedraw = false;
  }

  const rotate = Dir[ ( dir > 0 ? dir : null ) ?? entity.dir ]?.angle ?? 0;
  
  ctx.translate( entity.x, entity.y );
  ctx.rotate( rotate );
  ctx.translate( -SIZE / 2, -SIZE / 2 );
  ctx.scale( SIZE / rasterized.image.width, SIZE / rasterized.image.height ); 
  {
    ctx.drawImage( Rasterized[ entity.type ].image, 0, 0 );
  }
  ctx.scale( rasterized.image.width / SIZE, rasterized.image.height / SIZE );
  ctx.translate( SIZE / 2, SIZE / 2 );
  ctx.rotate( -rotate );
  ctx.translate( -entity.x, -entity.y );

}
