export class Entity {
  x = 0;
  y = 0;
  angle = 0;
  size = 1;

  animationTime = 0;

  constructor( values ) {
    Object.assign( this, values );
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
