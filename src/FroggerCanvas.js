import * as Constants from './Constants.js';
import { Direction } from './Entity.js';
import { AnimatedCanvas } from './common/AnimatedCanvas.js';

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
  
  constructor( canvas ) {
    super( Constants.TileSize, Constants.TileSize, canvas )
    
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

  setWorld( world ) {
    this.world = world;

    this.setSize( world.cols * Constants.TileSize, world.rows * Constants.TileSize );
  }

  update( dt ) {
    this.world.update( dt );
  }

  // TODO: Show crop code here?

  draw( ctx ) {
    ctx.save();
    ctx.scale( Constants.TileSize, Constants.TileSize );
    
    this.world.draw( ctx, this.showCropped );
      
    ctx.restore();
  } 
}