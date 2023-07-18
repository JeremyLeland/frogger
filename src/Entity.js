
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

  constructor( values ) {
    Object.assign( this, values );

    this.goalX = this.x;
    this.goalY = this.y;
  }

  update( dt ) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;
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