export class GLCanvas {
  #reqId;

  constructor( width, height, canvas ) {
    this.canvas = canvas ?? document.createElement( 'canvas' );
    this.canvas.oncontextmenu = () => { return false };

    if ( !canvas ) {
      document.body.appendChild( this.canvas );
    }
    
    this.gl = this.canvas.getContext( 'webgl2' );

    if ( this.gl === null ) {
      alert( "Unable to initialize WebGL. Your browser or machine may not support it." );
    }

    this.gl.clearColor( 0.0, 0.5, 0.75, 1.0 );
    this.gl.clearDepth( 1.0 );
    this.gl.enable( this.gl.DEPTH_TEST );
    this.gl.depthFunc( this.gl.LEQUAL );

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

    this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );
  }

  redraw() {
    this.gl.clear( this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
    this.draw( this.gl );
  }

  // TODO: Handle starts if already started, stops if already stopped...
  //       check if reqId not null? (set null in stop)

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
