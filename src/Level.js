const BASE_W = 0.05, HEAD_W = 0.2, NECK = 0, LEN = 0.2;
const arrow = new Path2D();
arrow.moveTo( -LEN,  -BASE_W );
arrow.lineTo(  NECK, -BASE_W );
arrow.lineTo(  NECK, -HEAD_W );
arrow.lineTo(  LEN,   0 );
arrow.lineTo(  NECK,  HEAD_W );
arrow.lineTo(  NECK,  BASE_W );
arrow.lineTo( -LEN,   BASE_W );
arrow.closePath();

const ARROW_COLOR = '#ff05';
const TILE_BORDER = 1 / 64;

import { Dir } from './Entity.js';
import { Tiles } from './Tiles.js';
import { Props } from './Props.js';
import { TileMap } from './TileMap.js';

export class Level
{
  static DebugGrid = false;

  cols = 1;
  rows = 1;
  
  tileInfoKeys = [ 'Grass' ];
  tiles = [ 0 ];
  directions = [ 0 ];

  entities = [];
  spawn = { x: 0, y: 0, dir: 0 };
  time = 15000;

  #tileMap;
  
  setSize( cols, rows ) {
    this.cols = cols;
    this.rows = rows;

    this.tiles = Array( this.cols * this.rows ).fill( 0 );
    this.directions = Array.from( this.tiles );
  }

  // TODO: Make this take col,row instead, and have caller do Math.round()?
  getTileInfo( x, y ) {
    const col = Math.round( x );
    const row = Math.round( y );

    if ( 0 <= col && col < this.cols && 
         0 <= row && row < this.rows ) {
      return Tiles[ this.tileInfoKeys[ this.tiles[ col + row * this.cols ] ] ];
    }
  }

  //
  // TODO -- make all these use 1D arrays instead of 2D
  //

  setDirection( dir, col, row ) {
    this.tiles[ col ][ row ].dir = dir;

    let affected = this.entities.find( e => e.x == col && e.y == row );
    
    if ( affected ) {
      affected.dir = dir;
    }
    else if ( this.player.x == col && this.player.y == row ) {
      this.player.dir = dir;
    }
  }

  addEntity( type, col, row ) {
    this.removeEntity( col, row );

    this.entities.push(
      new Entity( 
        Entities[ type ], 
        {
          x: col,
          y: row,
          // dir: this.tiles[ col ]?.[ row ]?.dir ?? Direction.Right,
        }
      )
    );
  }

  removeEntity( col, row ) {
    this.entities = this.entities.filter( e => e.x != col || e.y != row );
  }

  addColumn( col ) {
    this.tiles.splice( col, 0, 
      Array.from( this.tiles[ col ], e => ( { tileInfoKey: e.tileInfoKey, dir: e.dir } ) ) 
    );
    this.#adjustColumns( col, +1 );
  }

  removeColumn( col ) {
    this.tiles.splice( col, 1 );
    this.#adjustColumns( col, -1 );
  }

  #adjustColumns( col, delta ) {
    this.cols += delta;

    this.entities.filter( e => e.x >= col ).forEach( e => e.x += delta );
    if ( this.player.x >= col ) {
      this.player.x += delta;
    }
  }

  addRow( row ) {
    for ( let col = 0; col < this.cols; col ++ ) {
      const toCopy = this.tiles[ col ][ row ];
      this.tiles[ col ].splice( row, 0, ( { tileInfoKey: toCopy.tileInfoKey, dir: toCopy.dir } ) );
    }

    this.#adjustRows( row, +1 );
  }

  removeRow( row ) {
    for ( let col = 0; col < this.cols; col ++ ) {
      this.tiles[ col ].splice( row, 1 );
    }
    this.#adjustRows( row, -1 );
  }

  #adjustRows( row, delta ) {
    this.rows += delta;

    this.entities.filter( e => e.y >= row ).forEach( e => e.y += delta );
    if ( this.player.y >= row ) {
      this.player.y += delta;
    }
  }

  draw( ctx ) {
    if ( this.#tileMap == null ) {
      this.#tileMap = new TileMap( this );
    }

    this.#tileMap.draw( ctx );

    ctx.save();

    for ( let row = 0; row < this.rows; row ++ ) {
      ctx.save();
      
      for ( let col = 0; col < this.cols; col ++ ) {
    
        const prop = Props[ this.tileInfoKeys[ this.tiles[ col + row * this.cols ] ] ];
        prop?.draw( ctx );

        if ( this.spawn.x == col && this.spawn.y == row ) {
          Props[ 'Bullseye' ].draw( ctx );
        }

        if ( Level.DebugGrid ) {
          ctx.fillStyle = ctx.strokeStyle = ARROW_COLOR;
          ctx.lineWidth = TILE_BORDER;
          ctx.textAlign = 'center';
          ctx.font = '10px Arial';      // work around https://bugzilla.mozilla.org/show_bug.cgi?id=1845828

          ctx.strokeRect( -0.5, -0.5, 1, 1 );

          const dir = this.directions[ col + row * this.cols ];
          if ( dir > 0 ) {
            ctx.save();
            ctx.rotate( Dir[ dir ].angle );
            ctx.fill( arrow );
            ctx.restore();
          }

          ctx.save();
          ctx.scale( 0.02, 0.02 );    // work around https://bugzilla.mozilla.org/show_bug.cgi?id=1845828
          ctx.fillText( `(${ col },${ row })`, 0, 20 );
          ctx.restore();
        }

        ctx.translate( 1, 0 );
      }

      ctx.restore();
      ctx.translate( 0, 1 );
    }

    ctx.restore();
  }
}
