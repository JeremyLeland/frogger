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

export function draw( entity, ctx, { dir, action, time } = {} ) {
  let rasterized = Rasterized[ entity.type ];

  if ( !rasterized ) {
    const image = new OffscreenCanvas( 1.5 * ctx.scaleVal * devicePixelRatio, 1.5 * ctx.scaleVal * devicePixelRatio );
    const offscreenCtx = image.getContext( '2d' );

    offscreenCtx.scale( image.width / 1.5, image.height / 1.5 );
    offscreenCtx.translate( 0.75, 0.75 );

    offscreenCtx.strokeStyle = 'black';
    offscreenCtx.lineWidth = 0.02;

    rasterized = Rasterized[ entity.type ] = {
      image: image,
      ctx: offscreenCtx,
      needsRedraw: true,
    }
  }

  if ( rasterized.needsRedraw ) {
    rasterized.ctx.clearRect( -0.75, -0.75, 1.5, 1.5 );

    Entities[ entity.type ].draw( rasterized.ctx, action ?? entity.animationAction, time ?? entity.animationTime ?? 0 );

    rasterized.needsRedraw = false;
  }

  // ctx.save();

  const rotate = Dir[ ( dir > 0 ? dir : null ) ?? entity.dir ]?.angle ?? 0;
  
  ctx.translate( entity.x, entity.y );
  ctx.rotate( rotate );
  ctx.translate( -0.75, -0.75 );
  ctx.scale( 1.5 / rasterized.image.width, 1.5 / rasterized.image.height ); 
  {
    ctx.drawImage( Rasterized[ entity.type ].image, 0, 0 );
  }
  ctx.scale( rasterized.image.width / 1.5, rasterized.image.height / 1.5 );
  ctx.translate( 0.75, 0.75 );
  ctx.rotate( -rotate );
  ctx.translate( -entity.x, -entity.y );

  // ctx.restore();
}
