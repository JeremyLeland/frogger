const CAR_WIDTH = 0.7;  // as opposed to length (not necessarily in x axis)
const CORNER_RADIUS = 0.3;

const body = new Path2D();
body.roundRect( -0.5, -0.5 * CAR_WIDTH, 1, CAR_WIDTH, CORNER_RADIUS );

const windshield = new Path2D();
windshield.roundRect( -0.35, -0.3, 0.65, 0.6, 0.2 );

const roof = new Path2D();
roof.roundRect( -0.25, -0.3, 0.4, 0.6, 0.2 );

function drawCar( ctx, color ) {
  const bodyGrad = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
  bodyGrad.addColorStop( 0, color );
  bodyGrad.addColorStop( 1, 'black' );
  
  ctx.fillStyle = bodyGrad;
  ctx.fill( body );
  ctx.stroke( body );
  
  ctx.fillStyle = 'gray';
  ctx.fill( windshield );
  ctx.stroke( windshield );
  
  ctx.fillStyle = bodyGrad;
  ctx.fill( roof );
  ctx.stroke( roof );
}

export class Car {
  static HitDist = 0.75;
  
  static drawRedCar( ctx ) { drawCar( ctx, 'red' ) }
  static drawYellowCar( ctx ) { drawCar( ctx, 'yellow' ) }
  static drawGreenCar( ctx ) { drawCar( ctx, 'lime' ) }
  static drawBlueCar( ctx ) { drawCar( ctx, 'dodgerblue' ) }
}