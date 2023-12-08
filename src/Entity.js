export const Direction = {
  None: 0, Up: 1, Left: 2, Down: 3, Right: 4
};

export const Dir = [
  /* none */  { x:  0, y:  0, angle:  0          , dist: ( x, y ) => 0                       },
  /*Up:*/     { x:  0, y: -1, angle: -Math.PI / 2, dist: ( x, y ) => y - Math.ceil( y - 1 )  },
  /*Left:*/   { x: -1, y:  0, angle:  Math.PI    , dist: ( x, y ) => x - Math.ceil( x - 1 )  },
  /*Down:*/   { x:  0, y:  1, angle:  Math.PI / 2, dist: ( x, y ) => Math.floor( y + 1 ) - y },
  /*Right:*/  { x:  1, y:  0, angle:  0          , dist: ( x, y ) => Math.floor( x + 1 ) - x },
];

export class Entity {
  x = 0;
  y = 0;

  // TODO: Store this as dir index, not value (for easier serialization)
  // dir = Direction.Right;

  dx = 0;
  dy = 0;

  animationAction;
  animationTime = 0;
  zIndex = 0;

  info;

  constructor( info, values ) {
    this.info = info;
    Object.assign( this, values );
  }

  update( dt, world ) {
    this.dir ??= world.getTile( this.x, this.y ).dir;

    this.animationTime += dt;
    
    if ( this.info.Speed ) {
      while ( dt > 0 ) {
        const dist = Dir[ this.dir ].dist( this.x, this.y );
        const time = Math.min( dist / this.info.Speed, dt );
        
        this.x += Dir[ this.dir ].x * this.info.Speed * time;
        this.y += Dir[ this.dir ].y * this.info.Speed * time;
        
        if ( time < dt ) {
          const newTile = world.getTile( this.x, this.y );
          if ( newTile ) {
            if ( newTile.dir ) {
              this.dir = newTile.dir;
            }
          }
          else {
            // Attempt to work backwards to find where to warp to

            // NOTE: This gets messy because the old frogger allowed multiple paths to
            //       share a direction-less tile. We need to do extra work to accomodate
            //       this case.

            let prevX = Math.round( this.x );
            let prevY = Math.round( this.y );
            let prevDir = this.dir;
            let tries = 0;
            
            do {
              const fromBackDir = prevDir;
              const fromLeftDir = prevDir == 1 ? 4 : prevDir - 1;
              const fromRightDir = prevDir == 4 ? 1 : prevDir + 1;

              for ( const testDir of [ fromBackDir, fromLeftDir, fromRightDir ] ) {
                const testX = prevX - Dir[ testDir ].x;
                const testY = prevY - Dir[ testDir ].y;
                const testTile = world.getTile( testX, testY );

                if ( testTile?.dir == testDir ) {
                  prevDir = testDir;
                  break;
                }
              }

              prevX -= Dir[ prevDir ].x;
              prevY -= Dir[ prevDir ].y;
            }
            while ( world.getTile( prevX, prevY ) && ++tries < 100 );

            if ( tries == 100 ) {
              debugger;
            }

            this.x = prevX;
            this.y = prevY;
            this.dir = prevDir;
          }
        }

        dt -= time;
      }
    }
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.rotate( Dir[ this.dir ]?.angle ?? 0 );
    // ctx.scale( this.size, this.size );   // nothing changes size for now

    ctx.strokeStyle = 'black';

    // https://math.stackexchange.com/questions/13150/extracting-rotation-scale-values-from-2d-transformation-matrix/13165#13165
    // Assuming uniform scale
    const t = ctx.getTransform();
    const sx = /*Math.sign( t.a ) **/ Math.hypot( t.a, t.b );
    ctx.lineWidth = 1 / sx;

    this.info.drawEntity( ctx, this.animationAction, this.animationTime );

    ctx.restore();
  }

  drawEntity( ctx ) {}
}