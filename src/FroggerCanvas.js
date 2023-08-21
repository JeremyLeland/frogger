import * as Constants from './Constants.js';
import { Direction } from './Entity.js';
import { AnimatedCanvas } from './common/AnimatedCanvas.js';

import { Frog } from './Frog.js';
import { Froggy } from './Froggy.js';

const KeyDir = {
  KeyW: Direction.Up,
  KeyA: Direction.Left,
  KeyS: Direction.Down,
  KeyD: Direction.Right,
  ArrowUp: Direction.Up,
  ArrowLeft: Direction.Left,
  ArrowDown: Direction.Down,
  ArrowRight: Direction.Right,
};

// TODO: Trying to extract game playing functionality into here,
//       so index isn't doing most of it
// Also, this is what editor will use to play test a level

export class FroggerCanvas extends AnimatedCanvas {
  showCropped = false;
  showUI = true;
  scale = 1;

  #showVictory = false;
  #showDefeat = false;
  
  constructor( canvas ) {
    super( 100, 100, canvas );
    
    document.addEventListener( 'keydown', ( e ) => {
      if ( this.world ) {

        if ( this.world.needsRespawn ) {
          this.world.respawnPlayer();
        }
        else {
          const dir = KeyDir[ e.code ];
          if ( dir ) {
            this.world.player.move( dir );
          }
        }
      }
    } );
  }

  update( dt ) {
    this.world.update( dt );

    if ( this.world.victory != this.#showVictory ) {
      this.#showVictory = this.world.victory;
      document.getElementById( 'victory' ).style.visibility = this.world.victory ? 'visible' : 'hidden';
    }
    if ( this.world.defeat != this.#showDefeat ) {
      this.#showDefeat = this.world.defeat;
      document.getElementById( 'defeat' ).style.visibility = this.world.defeat ? 'visible' : 'hidden';
    }
  }

  draw( ctx ) {
    ctx.save();
    ctx.scale( this.scale, this.scale );
    
    this.world.draw( ctx, this.showCropped );

    if ( this.showUI ) {
      ctx.translate( 0, 15 );
      ctx.fillStyle = 'gray';
      ctx.fillRect( 0, 0, 15, 1 );

      ctx.translate( 0.5, 0.5 );
      ctx.lineWidth = 1 / this.scale;

      // Froggies
      for ( let i = 0; i < Constants.NumFroggies; i ++ ) {
        if ( this.world.rescued.find( e => e.froggyIndex == i ) ) {
          ctx.save();
          ctx.rotate( Direction.Down.angle );
          Froggy.drawFroggy( ctx, i );
          ctx.restore();
        }
        ctx.translate( 1, 0 );
      }
      
      // Timer
      const timerGrad = ctx.createLinearGradient( 0, 0, 3, 0 );
      timerGrad.addColorStop( 0, 'red' );
      timerGrad.addColorStop( 0.5, 'yellow' );
      timerGrad.addColorStop( 1, 'green' );

      ctx.fillStyle = timerGrad;
      ctx.fillRect( 0, -0.15, 4 * ( this.world.timeLeft / this.world.maxTime ), 0.3 );
      ctx.strokeRect( 0, -0.15, 4, 0.3 );

      ctx.translate( 5, 0 );

      // Lives
      for ( let i = 4; i > 0; i -- ) {
        if ( i <= this.world.lives ) {
          ctx.save();
          ctx.rotate( Direction.Up.angle );
          Frog.drawFrog( ctx );
          ctx.restore();
        }
        ctx.translate( 1, 0 );
      }
        
      ctx.restore();
    }
  } 
}