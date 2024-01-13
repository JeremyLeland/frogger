import { Dir } from './Entity.js';
import { Player } from './Player.js';
import * as Frog from './entities/Frog.js';
import * as Log from './entities/Log.js';
import * as Turtle from './entities/Turtle.js';
import * as Car from './entities/Car.js';

export const Entities = {
  Player: {
    drawPaths: [
      {
        fillStyle: 'green',
        strokeStyle: 'black',
        pathFunc: Frog.FootFunc,
      },
      {
        fillStyle: 'green',
        strokeStyle: 'black',
        pathFunc: Frog.LegFunc,
      },
      {
        fillStyle: 'green',
        strokeStyle: 'black',
        pathFunc: Frog.BodyFunc,
      },
      {
        fillStyle: 'white',
        strokeStyle: 'black',
        pathFunc: Frog.ScleraFunc,
      },
      {
        fillStyle: 'black',
        strokeStyle: 'black',
        pathFunc: Frog.PupilFunc,
      }
    ],
    draw: Player.drawPlayer
  },

  // Rides
  Turtle: {
    Speed: 0.001,
    hitDist: 0.5,   // if this is < 0.5, you can fall between turtles
    drawPaths: [
      {
        fillStyle: 'green',
        strokeStyle: 'black',
        pathFunc: Turtle.legsHeadFunc,
      },
      {
        fillStyle: 'darkolivegreen',
        strokeStyle: 'black',
        path: Turtle.shell,
      },
      {
        strokeStyle: '#000a',
        path: Turtle.detail,
      }
    ],
    draw: Turtle.drawTurtle
  },
  LogStart: {
    Speed: 0.001,
    hitDist: 0.5,
    drawPaths: [
      {
        fillStyle: 'saddleBrown',
        strokeStyle: 'black',
        path: Log.start,
      }
    ],
    draw: Log.drawStart
  },
  LogMiddle: {
    Speed: 0.001,
    hitDist: 0.5,
    drawPaths: [
      {
        fillStyle: 'saddleBrown',
        path: Log.middleFill,
      },
      {
        strokeStyle: 'black',
        path: Log.middleStroke,
      },
    ],
    draw: Log.drawMiddle
  },
  LogEnd: {
    Speed: 0.001,
    hitDist: 0.5,
    drawPaths: [
      {
        fillStyle: 'saddleBrown',
        strokeStyle: 'black',
        path: Log.end,
      }
    ],
    draw: Log.drawEnd
  },

  // Cars
  RedCar: {
    Speed: 0.0035,
    killsPlayer: true,
    hitDist: Car.HitDist,
    drawPaths: [
      {
        fillStyle: 'red',
        strokeStyle: 'black',
        path: Car.body,
      },
      {
        fillStyle: 'gray',
        strokeStyle: 'black',
        path: Car.windshield,
      },
      {
        fillStyle: 'red',
        strokeStyle: 'black',
        path: Car.roof,
      },
    ],
    draw: Car.drawRedCar
  },
  YellowCar: {
    Speed: 0.003,
    killsPlayer: true,
    hitDist: Car.HitDist,
    drawPaths: [
      {
        fillStyle: 'yellow',
        strokeStyle: 'black',
        path: Car.body,
      },
      {
        fillStyle: 'gray',
        strokeStyle: 'black',
        path: Car.windshield,
      },
      {
        fillStyle: 'yellow',
        strokeStyle: 'black',
        path: Car.roof,
      },
    ],
    draw: Car.drawYellowCar
  },
  GreenCar: {
    Speed: 0.0025,
    killsPlayer: true,
    hitDist: Car.HitDist,
    drawPaths: [
      {
        fillStyle: 'lime',
        strokeStyle: 'black',
        path: Car.body,
      },
      {
        fillStyle: 'gray',
        strokeStyle: 'black',
        path: Car.windshield,
      },
      {
        fillStyle: 'lime',
        strokeStyle: 'black',
        path: Car.roof,
      },
    ],
    draw: Car.drawGreenCar
  },
  BlueCar: {
    Speed: 0.002,
    killsPlayer: true,
    hitDist: Car.HitDist,
    drawPaths: [
      {
        fillStyle: 'dodgerblue',
        strokeStyle: 'black',
        path: Car.body,
      },
      {
        fillStyle: 'gray',
        strokeStyle: 'black',
        path: Car.windshield,
      },
      {
        fillStyle: 'dodgerblue',
        strokeStyle: 'black',
        path: Car.roof,
      },
    ],
    draw: Car.drawBlueCar
  }
};

[ 'red', 'orange', 'yellow', 'lime', 'dodgerblue', 'blueviolet' ].forEach( ( color, index ) =>
  Entities[ 'Froggy' + ( index + 1 ) ] = {
    canRescue: true,
    hitDist: 0.5,
    froggyIndex: index,   // TODO: redundant? Can we just use entityKey in place of this?
    scale: 0.7,
    drawPaths: [
      {
        fillStyle: color,
        strokeStyle: 'black',
        path: Frog.FootFunc(),
      },
      {
        fillStyle: color,
        strokeStyle: 'black',
        path: Frog.LegFunc(),
      },
      {
        fillStyle: color,
        strokeStyle: 'black',
        path: Frog.BodyFunc(),
      },
      {
        fillStyle: 'white',
        strokeStyle: 'black',
        path: Frog.ScleraFunc(),
      },
      {
        fillStyle: 'black',
        strokeStyle: 'black',
        path: Frog.PupilFunc(),
      }
    ],
  }
);

// TODO: Version that takes single element?

const transform = new DOMMatrix();

export function drawEntities( ctx, drawInfo, entities, animationTime = 0 ) {
  drawInfo.drawPaths?.forEach( pathInfo => {
    const combined = new Path2D();

    function processEntity( entity ) {
      // reset existing DOMMatrix() to avoid new
      transform.a = transform.d = 1;
      transform.b = transform.c = transform.e = transform.f = 0;

      transform.translateSelf( entity?.x ?? 0, entity?.y ?? 0 );
      transform.rotateSelf( Dir[ entity?.dir ]?.angle ?? 0 );

      if ( drawInfo.scale ) {
        transform.scaleSelf( drawInfo.scale ); 
      }

      if ( pathInfo.scale ) {
        transform.scaleSelf( pathInfo.scale );
      }
      
      combined.addPath( pathInfo.path ?? pathInfo.pathFunc( entity?.animationAction, entity?.animationTime ?? animationTime ), transform );
    }

    if ( Array.isArray( entities ) ) {
      entities.forEach( e => processEntity( e ) );
    }
    else {
      processEntity( entities );
    }

    if ( pathInfo.fillStyle ) {
      ctx.fillStyle = pathInfo.fillStyle;
      ctx.fill( combined );
    }
    if ( pathInfo.strokeStyle ) {
      ctx.strokeStyle = pathInfo.strokeStyle;
      ctx.stroke( combined );
    }
  } );
}