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

export class Tiles {
  static drawGrass( ctx ) {
    ctx.fillStyle = 'darkgreen';
    ctx.fillRect( -0.5, -0.5, 1, 1 );
  }

  static drawBush( ctx ) {
    Tiles.drawGrass( ctx );    

    ctx.fillStyle = 'green';
    ctx.fill( bush );

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1 / ctx.getTransform().m11;
    ctx.stroke( bush );

    // TODO: Berries?
  }

  static drawSidewalk( ctx ) {
    ctx.fillStyle = 'darkgray';
    ctx.fillRect( -0.5, -0.5, 1, 1 );
    ctx.fillStyle = 'gray';
    ctx.fillRect( -0.4, -0.4, 0.8, 0.8 );
  }

  static drawStreet( ctx ) {
    ctx.fillStyle = '#333';
    ctx.fillRect( -0.5, -0.5, 1, 1 );
  }

  static drawWater( ctx ) {
    ctx.fillStyle = 'darkblue';
    ctx.fillRect( -0.5, -0.5, 1, 1 );
  }
}