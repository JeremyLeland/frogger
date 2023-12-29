import { Frog } from './Frog.js';

let bodyGrad;

export class Player {
  static drawPlayer( ctx, animationAction, animationTime ) {
    bodyGrad ??= Frog.getFrogGradient( ctx, 'green' );

    Frog.drawFrog( ctx, bodyGrad, animationAction, animationTime );
  }
}
