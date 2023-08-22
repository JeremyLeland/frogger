const BUSH_SIDES = 7;
const BUSH_SIZE = 0.4, SIDE_SIZE = 0.6;

const bush = new Path2D();
bush.moveTo( BUSH_SIZE, 0 );
const angVal = Math.PI * 2 / BUSH_SIDES;
for ( let i = 1; i <= BUSH_SIDES; i ++ ) {
  const sideAngle = ( i - 0.5 ) * angVal;
  const bushAngle = i * angVal;

  bush.quadraticCurveTo(
    Math.cos( sideAngle ) * SIDE_SIZE, Math.sin( sideAngle ) * SIDE_SIZE,
    Math.cos( bushAngle ) * BUSH_SIZE, Math.sin( bushAngle ) * BUSH_SIZE,
  );
}

const LILYPAD_SIZE = 0.4, LILYPAD_ANGLE = 0.3, LILYPAD_OFFSET = 0.15;

const lilypad = new Path2D();
lilypad.moveTo( LILYPAD_OFFSET, 0 );
lilypad.arc( 0, 0, LILYPAD_SIZE, LILYPAD_ANGLE, -LILYPAD_ANGLE );
lilypad.closePath();

export const Props = {
  Bush: {
    draw: ( ctx ) => {
      // TODO: Set this once for all bushes?
      const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 2 );
      gradient.addColorStop( 0, 'darkgreen' );
      gradient.addColorStop( 1, 'black' );
      ctx.fillStyle = gradient;
      ctx.fill( bush );

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1 / ctx.getTransform().m11;
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
      ctx.lineWidth = 1 / ctx.getTransform().m11;
      ctx.stroke( lilypad );
    }
  }
}
