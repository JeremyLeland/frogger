import { Tiles } from './Tiles.js';
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

  getTileInfo( x, y ) {
    const col = Math.round( x );
    const row = Math.round( y );

    if ( 0 <= col && col < this.cols && 
         0 <= row && row < this.rows ) {
      return Tiles[ this.tileInfoKeys[ this.tiles[ col + row * this.cols ] ] ];
    }
  }

  setTileInfo( col, row, tileInfoKey ) {
    let tileKeyIndex = this.tileInfoKeys.indexOf( tileInfoKey );
    if ( tileKeyIndex < 0 ) {
      tileKeyIndex = this.tileInfoKeys.length;
      this.tileInfoKeys.push( tileInfoKey );
    }

    this.tiles[ col + row * this.cols ] = tileKeyIndex;
    this.#tileMap = null;
  }

  setDirection( col, row, dir ) {
    this.directions[ col + row * this.cols ] = dir;
    
    // May need new tilemap, e.g. this might've affected road lines
    this.#tileMap = null;
  }

  addEntity( col, row, type ) {
    this.entities.push( { type: type, x: col, y: row } );
  }

  removeEntity( col, row ) {
    this.entities = this.entities.filter( e => e.x != col || e.y != row );
  }

  //
  // TODO: Make all these work for 1D arrays
  //
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
  }
}
