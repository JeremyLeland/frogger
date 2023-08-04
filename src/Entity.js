
export const Direction = {
  Up:     { x:  0, y: -1, angle: -Math.PI / 2 },
  Left:   { x: -1, y:  0, angle:  Math.PI     },
  Down:   { x:  0, y:  1, angle:  Math.PI / 2 },
  Right:  { x:  1, y:  0, angle:  0           },
};

export class Entity {
  x = 0;
  y = 0;
  dir = Direction.Right;
  size = 1;

  dx = 0;
  dy = 0;

  animationTime = 0;
  zIndex = 0;

  constructor( values ) {
    Object.assign( this, values );
  }

  update( dt, world ) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;

    this.animationTime += dt;

    const col = Math.max( 0, Math.min( world.tiles.length - 1, Math.round( this.x - this.dir.x * 0.49 ) ) );
    const row = Math.max( 0, Math.min( world.tiles[ 0 ].length - 1, Math.round( this.y - this.dir.y * 0.49 ) ) );
    let tile = world.tiles[ col ][ row ];

    if ( this.currentTile != tile ) {
      this.currentTile = tile;
 
      if ( tile.warp ) {
        this.x = tile.warp.col;
        this.y = tile.warp.row;
        
        tile = world.tiles[ tile.warp.col ][ tile.warp.row ];
      }
      
      if ( tile.dir ) {
        if ( this.dir != tile.dir ) {
          this.x = Math.round( this.x );
          this.y = Math.round( this.y );
        }
        this.dir = tile.dir;

        if ( this.Speed ) {
          this.dx = tile.dir.x * this.Speed;
          this.dy = tile.dir.y * this.Speed;
        }
      }
    }
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.rotate( this.dir?.angle ?? 0 );
    ctx.scale( this.size, this.size );

    ctx.strokeStyle = 'black';

    // https://math.stackexchange.com/questions/13150/extracting-rotation-scale-values-from-2d-transformation-matrix/13165#13165
    // Assuming uniform scale
    const t = ctx.getTransform();
    const sx = /*Math.sign( t.a ) **/ Math.hypot( t.a, t.b );
    ctx.lineWidth = 1 / sx;

    this.drawEntity( ctx );

    ctx.restore();
  }

  drawEntity( ctx ) {}
}