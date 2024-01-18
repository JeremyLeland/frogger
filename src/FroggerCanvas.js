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
  showUI = true;

  world;
  
  constructor( canvas ) {
    super( 100, 100, canvas );
 
    document.addEventListener( 'keydown', ( e ) => {
      const dir = KeyDir[ e.code ];
      if ( dir != undefined ) {
        this.world?.requestPlayerMove( dir );
      }
    } );

    let startX, startY, endX, endY;
    document.addEventListener( 'touchstart', ( e ) => {
      const pos = e.touches?.[ 0 ] ?? e;
      startX = pos.clientX;
      startY = pos.clientY;
    } );

    document.addEventListener( 'touchmove', ( e ) => {
      const pos = e.touches?.[ 0 ] ?? e;
      endX = pos.clientX;
      endY = pos.clientY;
    } );

    document.addEventListener( 'touchend', ( e ) => {
      const dx = endX - startX;
      const dy = endY - startY;

      const dir = Math.abs( dx ) > Math.abs( dy ) ?
        ( dx < 0 ? Direction.Left : Direction.Right ) :
        ( dy < 0 ? Direction.Up   : Direction.Down  );
      
      this.world?.requestPlayerMove( dir );
    } );
  }

  update( dt ) {
    this.world?.update( dt );
  }

  draw( ctx ) {
    this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );
    
    // ctx.save(); {
    //   ctx.scale( this.scale, this.scale );

      this.world?.draw( ctx, this.showUI );
    // }
    // ctx.restore();
  }
}