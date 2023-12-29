import { Direction } from "./Entity.js";

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

const ROAD_LINE_WIDTH = 0.15, ROAD_LINE_LEN = 0.5;

export const Tiles = {
  Grass: {
    Base: 'Grass',
    draw: ( ctx ) => {
      ctx.fillStyle = 'forestgreen';
      ctx.fillRect( -0.5, -0.5, 1, 1 );
    }
  },
  Bush: {
    Base: 'Grass',
    Solid: true,
    draw: ( ctx ) => {
      Tiles.Grass.draw( ctx );    

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
  Sidewalk: {
    Base: 'Sidewalk',
    draw: ( ctx ) => {
      ctx.fillStyle = 'darkgray';
      ctx.fillRect( -0.5, -0.5, 1, 1 );
      ctx.fillStyle = 'gray';
      ctx.fillRect( -0.4, -0.4, 0.8, 0.8 );
    }
  },
  Road: {
    Base: 'Road',
    draw: ( ctx, tile, nTile, wTile ) => {
      ctx.fillStyle = '#333';
      ctx.fillRect( -0.5, -0.5, 1, 1 );

      if ( tile?.dir ) {
        if ( nTile && nTile.tileInfoKey == 'Road' && tile.dir != Direction.Up && nTile.dir && nTile.dir != Direction.Down ) {
          ctx.fillStyle = 'yellow';
          ctx.fillRect( -ROAD_LINE_LEN / 2, -0.5 - ROAD_LINE_WIDTH / 2, ROAD_LINE_LEN, ROAD_LINE_WIDTH );
        }
        
        if ( wTile && wTile.tileInfoKey == 'Road' && tile.dir != Direction.Left && wTile.dir && wTile.dir != Direction.Right ) {
          ctx.fillStyle = 'yellow';
          ctx.fillRect( -0.5 - ROAD_LINE_WIDTH / 2, -ROAD_LINE_LEN / 2, ROAD_LINE_WIDTH, ROAD_LINE_LEN );
        }
      }
    }
  },
  Water: {
    Base: 'Water',
    KillsPlayer: true,
    draw: ( ctx ) => {
      ctx.fillStyle = 'darkblue';
      ctx.fillRect( -0.5, -0.5, 1, 1 );
    }
  },
  Lilypad: {
    Base: 'Water',
    draw: ( ctx ) => {
      Tiles.Water.draw( ctx );

      const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 2 );
      gradient.addColorStop( 0, 'darkgreen' );
      gradient.addColorStop( 1, 'black' );
      ctx.fillStyle = gradient;
      ctx.fill( lilypad );

      ctx.strokeStyle = 'black';
      ctx.lineWidth = 0.02;
      ctx.stroke( lilypad );
    }
  }
}
