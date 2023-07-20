
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
  killsPlayer = false;

  constructor( values ) {
    Object.assign( this, values );

    this.goalX = this.x;
    this.goalY = this.y;
  }

  update( dt ) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;
  }

  followTile( world ) {
    const col = Math.max( 0, Math.min( world.tiles.length - 1, Math.round( this.x - this.dir.x * 0.5 ) ) );
    const row = Math.max( 0, Math.min( world.tiles[ 0 ].length - 1, Math.round( this.y - this.dir.y * 0.5 ) ) );
    let tile = world.tiles[ col ][ row ];

    if ( this.currentTile != tile ) {
      this.currentTile = tile;
 
      if ( tile.warp ) {
        this.x = tile.warp.c;
        this.y = tile.warp.r;
        
        tile = world.tiles[ tile.warp.c ][ tile.warp.r ];
      }
      
      if ( tile.dir ) {
        if ( this.dir != tile.dir ) {
          this.x = Math.round( this.x );
          this.y = Math.round( this.y );
        }
        this.dir = tile.dir;

        if ( tile.tile.Speed ) {
          this.dx = tile.dir.x * tile.tile.Speed;
          this.dy = tile.dir.y * tile.tile.Speed;
        }
      }
    }
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.rotate( this.dir.angle );
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