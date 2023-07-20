import { Direction } from "../src/Entity.js";

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

const ROAD_LINE_WIDTH = 0.15, ROAD_LINE_LEN = 0.5;

export const Tiles = {
  Grass: {
    draw: ( ctx ) => {
      ctx.fillStyle = 'darkgreen';
      ctx.fillRect( -0.5, -0.5, 1, 1 );
    }
  },
  Bush: {
    Solid: true,
    draw: ( ctx ) => {
      Tiles.Grass.draw( ctx );    

      ctx.fillStyle = 'green';
      ctx.fill( bush );

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1 / ctx.getTransform().m11;
      ctx.stroke( bush );

      // TODO: Berries?
    }
  },
  Sidewalk: {
    draw: ( ctx ) => {
      ctx.fillStyle = 'darkgray';
      ctx.fillRect( -0.5, -0.5, 1, 1 );
      ctx.fillStyle = 'gray';
      ctx.fillRect( -0.4, -0.4, 0.8, 0.8 );
    }
  },
  Road: {
    Speed: 0.002,
    draw: ( ctx, tile, nTile, wTile ) => {
      ctx.fillStyle = '#333';
      ctx.fillRect( -0.5, -0.5, 1, 1 );

      if ( nTile && nTile.tile == Tiles.Road && tile.dir != Direction.Up && nTile.dir != Direction.Down ) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect( -ROAD_LINE_LEN / 2, -0.5 - ROAD_LINE_WIDTH / 2, ROAD_LINE_LEN, ROAD_LINE_WIDTH );
      }
      
      if ( wTile && wTile.tile == Tiles.Road && tile.dir != Direction.Left && wTile.dir != Direction.Right ) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect( -0.5 - ROAD_LINE_WIDTH / 2, -ROAD_LINE_LEN / 2, ROAD_LINE_WIDTH, ROAD_LINE_LEN );
      }
    }
  },
  Water: {
    Fatal: true,
    Speed: 0.001,
    draw: ( ctx ) => {
      ctx.fillStyle = 'darkblue';
      ctx.fillRect( -0.5, -0.5, 1, 1 );
    }
  },
}
