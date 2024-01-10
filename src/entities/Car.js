const CAR_WIDTH = 0.7;  // as opposed to length (not necessarily in x axis)
const CORNER_RADIUS = 0.3;

export const body = new Path2D();
body.roundRect( -0.5, -0.5 * CAR_WIDTH, 1, CAR_WIDTH, CORNER_RADIUS );

export const windshield = new Path2D();
windshield.roundRect( -0.35, -0.3, 0.65, 0.6, 0.2 );

export const roof = new Path2D();
roof.roundRect( -0.25, -0.3, 0.4, 0.6, 0.2 );

const colors = [ 'red', 'yellow', 'lime', 'dodgerblue' ];
const bodyGrad = Array( colors.length );

// TODO: Do we even use this?
export const HitDist = 0.75;
