const WIDTH = 0.7;  // as opposed to length (not necessarily in x axis)
const CORNER_RADIUS = 0.3;

const body = new Path2D();
body.roundRect( -0.5, -0.5 * WIDTH, 1, WIDTH, CORNER_RADIUS );

const windshield = new Path2D();
windshield.roundRect( -0.35, -0.3, 0.65, 0.6, 0.2 );

const roof = new Path2D();
roof.roundRect( -0.25, -0.3, 0.4, 0.6, 0.2 );

import { Entity } from './Entity.js';

export class Car extends Entity {

  killsPlayer = true;

  update( dt, world ) {
    super.update( dt );

    this.followTile( world );
  }

  drawEntity( ctx ) {
    ctx.fillStyle = this.color;
    ctx.fill( body );
    ctx.stroke( body );

    ctx.fillStyle = 'gray';
    ctx.fill( windshield );
    ctx.stroke( windshield );

    ctx.fillStyle = this.color;
    ctx.fill( roof );
    ctx.stroke( roof );
  }
}
