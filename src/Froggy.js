import { Frog } from './entities/Frog.js';

const colors = [ 'red', 'orange', 'yellow', 'lime', 'dodgerblue', 'blueviolet' ];
const bodyGrad = Array( colors.length );

export class Froggy extends Frog {
  static Count = 6;
  
  static Size = 0.7;
  
  constructor( values ) {
    super( values );

    this.color = Froggy.Colors[ this.froggyIndex ];
  }

  static drawFroggy( ctx, colorIndex ) {
    ctx.save();
    ctx.scale( Froggy.Size, Froggy.Size );

    bodyGrad[ colorIndex ] ??= Frog.getFrogGradient( ctx, colors[ colorIndex ] );

    Frog.drawFrog( ctx, bodyGrad[ colorIndex ] );
    ctx.restore();
  }
}
