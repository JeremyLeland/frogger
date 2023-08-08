import { Direction } from '../src/Entity.js';
import { Frog } from '../src/Frog.js';
import { Froggy } from '../src/Froggy.js';
import { Canvas } from '../src/common/Canvas.js';

export class UI {
  froggies = [];
  timeLeft;
  players = [];

  victory;
  defeat;

  constructor() {
    for ( let i = 0; i < 6; i ++ ) {
      const froggy = new Canvas( 48, 48 );
      
      froggy.ctx.scale( 48, 48 );
      froggy.ctx.translate( 0.5, 0.5 );
      froggy.ctx.rotate( Direction.Down.angle );
      froggy.ctx.lineWidth = 1 / 48;
      
      Froggy.drawFroggy( froggy.ctx, i );
    
      froggy.canvas.style.visibility = 'hidden';
      
      this.froggies.push( froggy.canvas );
    }
    
    for ( let i = 0; i < 4; i ++ ) {
      const player = new Canvas( 48, 48 );
    
      player.ctx.scale( 48, 48 );
      player.ctx.translate( 0.5, 0.5 );
      player.ctx.rotate( Direction.Up.angle );
      player.ctx.lineWidth = 1 / 48;
    
      Frog.drawFrog( player.ctx, 'green' );
    
      this.players.push( player.canvas );
    }
    
    const rescued = document.getElementById( 'rescued' );
    this.froggies.forEach( e => rescued.appendChild( e ) );

    this.timeLeft = document.getElementById( 'timeLeft' );
    
    const lives = document.getElementById( 'lives' );
    this.players.forEach( e => lives.appendChild( e ) );

    this.victory = document.getElementById( 'victory' );
    this.defeat = document.getElementById( 'defeat' );
  }

  reset() {
    for ( let i = 0; i < 6; i ++ ) {
      this.froggies[ i ].style.visibility = 'hidden';
    }

    this.setTimeLeft( 1 );
    this.setLives( 4 );

    this.victory.style.visibility = 'hidden';
    this.defeat.style.visibility = 'hidden';
  }

  showFroggy( index ) {
    this.froggies[ index ].style.visibility = 'visible';
  }

  setTimeLeft( ratio ) {
    this.timeLeft.style.width = `${ 100 * ratio }%`;
    this.timeLeft.style.backgroundSize = `${ 100 / ratio }%`;
  }

  setLives( numLives ) {
    this.players.forEach( ( player, index ) => 
      player.style.visibility = index < numLives ? 'visible' : 'hidden' 
    );
  }

  showVictory() {
    this.victory.style.visibility = 'visible';
  }

  showDefeat() {
    this.defeat.style.visibility = 'visible';
  }
}