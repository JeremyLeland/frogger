export class AnimatedCanvas {
  #reqId;

  constructor( width, height ) {
    this.canvas = document.createElement( 'canvas' );
    this.canvas.oncontextmenu = () => { return false };

    // TODO: Sometimes don't do this automatically?
    document.body.appendChild( this.canvas );
    
    this.ctx = this.canvas.getContext( '2d' /*, { alpha: false }*/ );

    if ( width && height ) {
      this.setSize( width, height );
    }
    else {
      window.onresize = () => this.setSize( window.innerWidth, window.innerHeight );
      window.onresize();
    }
  }

  setSize( width, height ) {
    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx.scale( devicePixelRatio, devicePixelRatio );
  }

  redraw() {
    this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );

    this.ctx.save();
    this.draw( this.ctx );
    this.ctx.restore();
  }

  start() {
    let lastTime;
    const animate = ( now ) => {
      lastTime ??= now;  // for first call only
      this.update( now - lastTime );
      lastTime = now;
  
      this.redraw();
  
      this.#reqId = requestAnimationFrame( animate );
    };

    this.#reqId = requestAnimationFrame( animate );
  }

  stop() {
    cancelAnimationFrame( this.#reqId );
  }

  update( dt ) {}
  draw( ctx ) {}
}
