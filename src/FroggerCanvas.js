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
  
  constructor( world, canvas ) {
    super( world.cols * Constants.TileSize, world.rows * Constants.TileSize, canvas )
    this.world = world;

    // canvas.addEventListener( 'keydown', e => {
    //   if ( this.world.needsRespawn ) {
    //     this.world.respawnPlayer();
    //   }
    //   else {
    //     const dir = KeyDir[ e.code ];
    //     if ( dir ) {
    //       this.world.player.move( dir );
    //     }
    //   }
    // } );
  }

  update( dt ) {
    this.world.update( dt );
  }

  // TODO: Show crop code here?

  draw( ctx ) {
    ctx.save();
    ctx.scale( Constants.TileSize, Constants.TileSize );
    
    // if ( !this.showCropped ) {
    //   ctx.translate( -this.world.crop.minCol, -this.world.crop.minRow );
    // }
    
    this.world.draw( ctx, this.showCropped );

    // if ( showCropped ) {
    //   ctx.beginPath();
    //   ctx.moveTo( world.crop.minCol,     world.crop.minRow     );
    //   ctx.lineTo( world.crop.minCol,     world.crop.maxRow + 1 );
    //   ctx.lineTo( world.crop.maxCol + 1, world.crop.maxRow + 1 );
    //   ctx.lineTo( world.crop.maxCol + 1, world.crop.minRow     );
    //   ctx.lineTo( world.crop.minCol,     world.crop.minRow     );
      
    //   ctx.setLineDash( [ 0.1, 0.1 ] );
    //   ctx.lineWidth = 0.05;
    //   ctx.stroke();
      
    //   ctx.lineTo( 0, 0 );
    //   ctx.lineTo( world.cols, 0 );
    //   ctx.lineTo( world.cols, world.rows );
    //   ctx.lineTo( 0, world.rows );
    //   ctx.lineTo( 0, 0 );
      
    //   ctx.fillStyle = "#000b";
    //   ctx.fill();
    // }
      
      ctx.restore();
  } 
}