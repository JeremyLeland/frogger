import { Frog } from './Frog.js';

export class Froggy extends Frog {
  static Count = 6;
  static Colors = [ 'red', 'orange', 'yellow', 'lime', 'dodgerblue', 'blueviolet' ];
  
  static Size = 0.7;
  
  constructor( values ) {
    super( values );

    this.color = Froggy.Colors[ this.froggyIndex ];
  }

  update( dt, world ) { }     // quick way to avoid animation for now

  static drawFroggy( ctx, colorIndex ) {
    ctx.save();
    ctx.scale( Froggy.Size, Froggy.Size );
    Frog.drawFrog( ctx, Froggy.Colors[ colorIndex ] );
    ctx.restore();
  }
}
