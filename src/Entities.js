import { Froggy } from './Froggy.js';
import { Player } from './Player.js';
import { Log } from './entities/Log.js';
import { Turtle } from './entities/Turtle.js';
import { Car } from './entities/Car.js';

export const Entities = {
  Player: {
    draw: Player.drawPlayer
  },

  // Rides
  Turtle: {
    Speed: 0.001,
    hitDist: 0.5,   // if this is < 0.5, you can fall between turtles
    draw: Turtle.drawTurtle
  },
  LogStart: {
    Speed: 0.001,
    hitDist: 0.5,
    draw: Log.drawStart
  },
  LogMiddle: {
    Speed: 0.001,
    hitDist: 0.5,
    draw: Log.drawMiddle
  },
  LogEnd: {
    Speed: 0.001,
    hitDist: 0.5,
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

for ( let i = 0; i < Froggy.Count; i ++ ) {
  Entities[ 'Froggy' + ( i + 1 ) ] = {
    canRescue: true,
    hitDist: 0.5,
    froggyIndex: i,
    draw: function( ctx ) { Froggy.drawFroggy( ctx, i ) }
  }
}

for ( const entityKey in Entities ) {
  Entities[ entityKey ].entityKey = entityKey;
}