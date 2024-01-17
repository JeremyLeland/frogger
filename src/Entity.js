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

export class Entity {
  static draw( entity, ctx, { dir, action, time } = {} ) {
    ctx.save();
    ctx.translate( entity.x, entity.y );
    ctx.rotate( Dir[ ( dir > 0 ? dir : null ) ?? entity.dir ]?.angle ?? 0 );
    // ctx.scale( entity.size, entity.size );   // nothing changes size for now
  
    if ( !Rasterized[ entity.type ] ) {
      const offscreen = new OffscreenCanvas( 48 * devicePixelRatio, 48 * devicePixelRatio );
      const offscreenCtx = offscreen.getContext( '2d' );

      offscreenCtx.scale( 48 * devicePixelRatio, 48 * devicePixelRatio );
      offscreenCtx.translate( 0.5, 0.5 );

      offscreenCtx.strokeStyle = 'black';
      offscreenCtx.lineWidth = 0.02;

      Entities[ entity.type ].draw( offscreenCtx, action ?? entity.animationAction, time ?? entity.animationTime ?? 0 );

      Rasterized[ entity.type ] = offscreen;
    }
    
    ctx.translate( -0.5, -0.5 );
    ctx.scale( 1/48/devicePixelRatio, 1/48/devicePixelRatio );
    ctx.drawImage( Rasterized[ entity.type ], 0, 0 );

    ctx.restore();
  }
}
