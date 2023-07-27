const WIDTH = 0.7;  // as opposed to length (not necessarily in x axis)
const CORNER_RADIUS = 0.3;

const body = new Path2D();
body.roundRect( -0.5, -0.5 * WIDTH, 1, WIDTH, CORNER_RADIUS );

const windshield = new Path2D();
windshield.roundRect( -0.35, -0.3, 0.65, 0.6, 0.2 );

const roof = new Path2D();
roof.roundRect( -0.25, -0.3, 0.4, 0.6, 0.2 );


function drawCar( ctx, color ) {
  ctx.fillStyle = color;
  ctx.fill( body );
  ctx.stroke( body );
  
  ctx.fillStyle = 'gray';
  ctx.fill( windshield );
  ctx.stroke( windshield );
  
  ctx.fillStyle = color;
  ctx.fill( roof );
  ctx.stroke( roof );
}

// TODO: Come up with different types for cars (e.g. sedan, pickup, van, box truck)

// TODO: Combine with Rides into one Entities list? Not sure there's a point in separating these

export const Cars = {
  Red: {
    killsPlayer: true,
    drawEntity: function( ctx ) { drawCar( ctx, 'red' ) }
  },
  Orange: {
    killsPlayer: true,
    drawEntity: function( ctx ) { drawCar( ctx, 'orange' ) }
  },
  Yellow: {
    killsPlayer: true,
    drawEntity: function( ctx ) { drawCar( ctx, 'yellow' ) }
  },
  Blue: {
    killsPlayer: true,
    drawEntity: function( ctx ) { drawCar( ctx, 'cyan' ) }
  }
}