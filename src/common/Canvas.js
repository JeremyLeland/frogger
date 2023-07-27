export class Canvas {

  constructor( width = window.innerWidth, height = window.innerHeight ) {
    this.canvas = document.createElement( 'canvas' );
    this.canvas.oncontextmenu = () => { return false };
    this.setSize( width, height );
    
    this.ctx = this.canvas.getContext( '2d' /*, { alpha: false }*/ );
    this.ctx.scale( devicePixelRatio, devicePixelRatio );
  }

  setSize( width, height ) {
    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
  }
}
