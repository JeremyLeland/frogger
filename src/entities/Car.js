const CAR_WIDTH = 0.7;  // as opposed to length (not necessarily in x axis)
const CORNER_RADIUS = 0.3;

const body = new Path2D();
body.roundRect( -0.5, -0.5 * CAR_WIDTH, 1, CAR_WIDTH, CORNER_RADIUS );

const windshield = new Path2D();
windshield.roundRect( -0.35, -0.3, 0.65, 0.6, 0.2 );

const roof = new Path2D();
roof.roundRect( -0.25, -0.3, 0.4, 0.6, 0.2 );

const colors = [ 'red', 'yellow', 'lime', 'dodgerblue' ];
const bodyGrad = Array( colors.length );

function drawCar( ctx, colorIndex ) {
  
  if ( !bodyGrad[ colorIndex ] ) {
    const grad = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    grad.addColorStop( 0, colors[ colorIndex ] );
    grad.addColorStop( 1, 'black' );

    bodyGrad[ colorIndex ] = grad;
  }
  
  // ctx.fillStyle = bodyGrad[ colorIndex ];
  ctx.fillStyle = colors[ colorIndex ];
  ctx.fill( body );
  ctx.stroke( body );
  
  ctx.fillStyle = 'gray';
  ctx.fill( windshield );
  ctx.stroke( windshield );
  
  // ctx.fillStyle = bodyGrad[ colorIndex ];
  ctx.fillStyle = colors[ colorIndex ];
  ctx.fill( roof );
  ctx.stroke( roof );
}

export class Car {
  static HitDist = 0.75;

  static drawRedCar( ctx ) { drawCar( ctx, 0 ) }
  static drawYellowCar( ctx ) { drawCar( ctx, 1 ) }
  static drawGreenCar( ctx ) { drawCar( ctx, 2 ) }
  static drawBlueCar( ctx ) { drawCar( ctx, 3 ) }
}