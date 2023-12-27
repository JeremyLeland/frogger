import { Tiles } from './Tiles.js';

export class Level
{
  cols;
  rows;
  tileInfoKeys;
  tiles;
  directions;
  entities;
  time;
  
  constructor( cols, rows ) {
    this.cols = cols;
    this.rows = rows;

    this.tileInfoKeys = [ 'Grass' ];
    this.tiles = Array( this.cols * this.rows ).fill( 0 );
    this.directions = Array.from( this.tiles );

    this.entities = [];
    this.spawn = { x: 0, y: 0, dir: 0 };
    this.time = 15000;
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
}
