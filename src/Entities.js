import { Froggy } from './Froggy.js';
import { Player } from './Player.js';
import * as Frog from './entities/Frog.js';
import * as Log from './entities/Log.js';
import * as Turtle from './entities/Turtle.js';
import * as Car from './entities/Car.js';

export const Entities = {
  Player: {
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
    froggyIndex: index,
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