
export const Direction = {
  Up:     { x:  0, y: -1, angle: -Math.PI / 2 },
  Left:   { x: -1, y:  0, angle:  Math.PI     },
  Down:   { x:  0, y:  1, angle:  Math.PI / 2 },
  Right:  { x:  1, y:  0, angle:  0           },
};

export class Entity {
  x = 0;
  y = 0;
  angle = 0;
  size = 1;

  moveSpeed = 0;

  animationTime = 0;

  constructor( values ) {
    Object.assign( this, values );

    this.goalX = this.x;
    this.goalY = this.y;
  }

  update( dt ) {
    this.x += getMove( this.x, this.goalX, this.moveSpeed * dt );
    this.y += getMove( this.y, this.goalY, this.moveSpeed * dt );
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.rotate( this.angle );
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

function getMove( have, want, maxMove ) {
  const goalMove = want - have;
  return Math.sign( goalMove ) * Math.min( maxMove, Math.abs( goalMove ) );
}