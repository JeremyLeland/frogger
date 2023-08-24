import { Froggy } from './Froggy.js';
import { Log } from './entities/Log.js';
import { Turtle } from './entities/Turtle.js';
import { Car } from './entities/Car.js';

export const Entities = {
  // Rides
  Turtle: {
    Speed: 0.001,
    hitDist: 0.5,   // if this is < 0.5, you can fall between turtles
    zIndex: -1,
    drawEntity: Turtle.drawTurtle
  },
  LogStart: {
    Speed: 0.001,
    hitDist: 0.5,
    zIndex: -1,
    drawEntity: Log.drawStart
  },
  LogMiddle: {
    Speed: 0.001,
    hitDist: 0.5,
    zIndex: -1,
    drawEntity: Log.drawMiddle
  },
  LogEnd: {
    Speed: 0.001,
    hitDist: 0.5,
    zIndex: -1,
    drawEntity: Log.drawEnd
  },

  // Cars
  RedCar: {
    Speed: 0.0035,
    killsPlayer: true,
    hitDist: Car.HitDist,
    zIndex: 1,
    drawEntity: Car.drawRedCar
  },
  YellowCar: {
    Speed: 0.003,
    killsPlayer: true,
    hitDist: Car.HitDist,
    zIndex: 1,
    drawEntity: Car.drawYellowCar
  },
  GreenCar: {
    Speed: 0.0025,
    killsPlayer: true,
    hitDist: Car.HitDist,
    zIndex: 1,
    drawEntity: Car.drawGreenCar
  },
  BlueCar: {
    Speed: 0.002,
    killsPlayer: true,
    hitDist: Car.HitDist,
    zIndex: 1,
    drawEntity: Car.drawBlueCar
  }
};

for ( let i = 0; i < Froggy.Count; i ++ ) {
  Entities[ 'Froggy' + ( i + 1 ) ] = {
    canRescue: true,
    hitDist: 0.5,
    froggyIndex: i,
    drawEntity: function( ctx ) { Froggy.drawFroggy( ctx, i ) }
  }
}

for ( const entityKey in Entities ) {
  Entities[ entityKey ].entityKey = entityKey;
}