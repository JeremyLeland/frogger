export const Direction = {
  Left: 0, Up: 1, Right: 2, Down: 3
};

export const Dir = [
  /*Left:*/   { x: -1, y:  0, angle:  Math.PI     },
  /*Up:*/     { x:  0, y: -1, angle: -Math.PI / 2 },
  /*Right:*/  { x:  1, y:  0, angle:  0           },
  /*Down:*/   { x:  0, y:  1, angle:  Math.PI / 2 },
];

export class Entity {
  x = 0;
  y = 0;

  // TODO: Store this as dir index, not value (for easier serialization)
  dir = Direction.Right;

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
    this.x += this.dx * dt;
    this.y += this.dy * dt;

    this.animationTime += dt;

    const col = Math.max( 0, Math.min( world.tiles.length - 1, Math.round( this.x - Dir[ this.dir ].x * 0.49 ) ) );
    const row = Math.max( 0, Math.min( world.tiles[ 0 ].length - 1, Math.round( this.y - Dir[ this.dir ].y * 0.49 ) ) );
    let tile = world.tiles[ col ][ row ];

    if ( this.currentTile != tile ) {
      this.currentTile = tile;
 
      if ( tile.warp ) {
        this.x = tile.warp.col;
        this.y = tile.warp.row;
        
        tile = world.tiles[ tile.warp.col ][ tile.warp.row ];
      }
      
      if ( tile.dir != undefined ) {
        if ( this.dir != tile.dir ) {
          this.x = Math.round( this.x );
          this.y = Math.round( this.y );
        }
        this.dir = tile.dir;

        if ( this.info.Speed ) {
          this.dx = Dir[ tile.dir ].x * this.info.Speed;
          this.dy = Dir[ tile.dir ].y * this.info.Speed;
        }
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