export class Entity {
  x = 0;
  y = 0;
  size = 1;

  animationTime = 0;

  constructor( values ) {
    Object.assign( this, values );
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( this.x, this.y );
    ctx.scale( this.size, this.size );

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 / ctx.getTransform().m11;

    this.drawEntity( ctx );

    ctx.restore();
  }

  drawEntity( ctx ) {}
}
