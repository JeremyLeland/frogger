const BUSH_SIDES = 7;
const BUSH_SIZE = 0.4, SIDE_SIZE = 0.6;

function getBushPath( scale ) {
  const path = new Path2D();
  path.moveTo( BUSH_SIZE * scale, 0 );
  const angVal = Math.PI * 2 / BUSH_SIDES;
  for ( let i = 1; i <= BUSH_SIDES; i ++ ) {
    const sideAngle = ( i - 0.5 ) * angVal;
    const bushAngle = i * angVal;
  
    path.quadraticCurveTo(
      Math.cos( sideAngle ) * SIDE_SIZE * scale, Math.sin( sideAngle ) * SIDE_SIZE * scale,
      Math.cos( bushAngle ) * BUSH_SIZE * scale, Math.sin( bushAngle ) * BUSH_SIZE * scale,
    );
  }
  return path;
}

const LILYPAD_SIZE = 0.4, LILYPAD_ANGLE = 0.3, LILYPAD_OFFSET = 0.15;

const lilypad = new Path2D();
lilypad.moveTo( LILYPAD_OFFSET, 0 );
lilypad.arc( 0, 0, LILYPAD_SIZE, LILYPAD_ANGLE, -LILYPAD_ANGLE );
lilypad.closePath();

const BULLSEYE_COLORS = [ 'blue', 'white', 'red' ];
const BULLSEYE_RADII = [ 0.4, 0.25, 0.1 ].map( e => e * 0.75 );

export const Props = {
  Bush: {
    paths: [ getBushPath( 1 ), getBushPath( 0.75 ), getBushPath( 0.5 ) ],
    draw: ( ctx ) => {
      // TODO: Set this once for all bushes?
      const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 2 );
      gradient.addColorStop( 0, 'darkgreen' );
      gradient.addColorStop( 1, 'black' );
      ctx.fillStyle = gradient;
      ctx.fill( bush );

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.02;
      ctx.stroke( bush );

      // TODO: Berries?
    }
  },
  Lilypad: {
    draw: ( ctx ) => {
      const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 2 );
      gradient.addColorStop( 0, 'darkgreen' );
      gradient.addColorStop( 1, 'black' );
      ctx.fillStyle = gradient;
      ctx.fill( lilypad );

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.02;
      ctx.stroke( lilypad );
    }
  },
  Bullseye: {
    draw: ( ctx ) => {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.02;
      ctx.globalAlpha = 0.5;

      for ( let i = 0; i < 3; i ++ ) {
        ctx.beginPath();
        ctx.arc( 0, 0, BULLSEYE_RADII[ i ], 0, Math.PI * 2 );
        ctx.fillStyle = BULLSEYE_COLORS[ i ];
        ctx.fill();
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }
  }
}
