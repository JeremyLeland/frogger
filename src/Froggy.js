

import { Frog } from './Frog.js';

export class Froggy extends Frog {
  static Count = 6;
  static Colors = [ 'red', 'orange', 'yellow', 'lime', 'dodgerblue', 'blueviolet' ];
  
  size = 0.7;
  canRescue = true;
  
  constructor( values ) {
    super( values );

    this.color = Froggy.Colors[ this.froggyIndex ];
  }

  update( dt, world ) { }     // quick way to avoid animation for now
}
