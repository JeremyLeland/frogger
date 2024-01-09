export class AnimatedCanvas {
  ShowFPS = true;

  #reqId;

  #frameRates = [];

  constructor( width, height, canvas ) {
    this.canvas = canvas ?? document.createElement( 'canvas' );
    this.canvas.oncontextmenu = () => { return false };

    if ( !canvas ) {
      document.body.appendChild( this.canvas );
    }
    
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
    // Don't need this because we're drawing the level over everything
    // this.ctx.clearRect( 0, 0, this.ctx.canvas.width, this.ctx.canvas.height );

    this.ctx.save();
    this.draw( this.ctx );
    this.ctx.restore();
  }

  // TODO: Handle starts if already started, stops if already stopped...
  //       check if reqId not null? (set null in stop)

  start() {
    let lastTime;
    const animate = ( now ) => {
      lastTime ??= now;  // for first call only
      const dt = now - lastTime;
      lastTime = now;

      this.update( dt );  
      this.redraw();

      if ( this.ShowFPS ) {
        this.#frameRates.push( 1000 / dt );
        if ( this.#frameRates.length > 60 ) {
          this.#frameRates.shift();
        }

        this.ctx.beginPath();
        this.#frameRates.forEach( ( rate, index ) => this.ctx.lineTo( index, 70 - rate ) );
        for ( let y = 10; y < 70; y += 10 ) {
          this.ctx.moveTo(  0, y );
          this.ctx.lineTo( 60, y );
        }
        this.ctx.strokeStyle = 'orange';
        this.ctx.stroke();

        this.ctx.strokeRect( 0, 0, 60, 70 );
      }
  
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
