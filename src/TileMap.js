import { Direction } from '../src/Entity.js';
import { Tiles } from '../src/Tiles.js';
import * as Utility from '../src/common/Utility.js';

const DirIndex = {
  Left: 0, Up: 1, Right: 2, Down: 3
};

const CORNER_RADIUS = 0.25;

const LAYERS = [
  'Water',
  'Road',
  'Sidewalk',
  'Grass',
];

const COLORS = [
  '#00aa',
  '#333',
  'dimgray',
  'green',
];

export class TileMap {
  #layerPaths;
  #layerEdges = [];

  // TODO: Combine all these into one large dictionary of types => path arrays?
  #sidewalkSquares = new Path2D();
  #lanesPath = new Path2D();
  #bushPaths = Array.from( Tiles.Bush.drawPaths, _ => new Path2D() );
  #lilypadPaths = Array.from( Tiles.Lilypad.drawPaths, _ => new Path2D() );

  constructor( level ) {
    this.#layerPaths = LAYERS.map( layerName => {
      // Store the edges coming from each corner, indexed by direction
      const edges = Array.from( 
        Array( level.cols + 1 ), _ => Array.from( 
          Array( level.rows + 1 ), _ => 
            Array( 4 ) ) );
      
      this.#layerEdges.push( edges );
  
      for ( let row = 0; row < level.rows; row ++ ) {
        for ( let col = 0; col < level.cols; col ++ ) {
          const currentBase = level.getTileInfo( col, row ).Base;
          
          if ( currentBase == layerName ) {
            // Left edge (going down)
            if ( 0 == col || currentBase != level.getTileInfo( col - 1, row ).Base ) {
              edges[ col ][ row ][ DirIndex.Down ] = [ col, row, col, row + 1 ];
            }
            
            // Top edge (going left)
            if ( 0 == row || currentBase != level.getTileInfo( col, row - 1 ).Base ) {
              edges[ col + 1 ][ row ][ DirIndex.Left ] = [ col + 1, row, col, row ];
            }
            
            // Right edge (going up)
            if ( level.cols == col + 1 || currentBase != level.getTileInfo( col + 1, row ).Base ) {
              edges[ col + 1 ][ row + 1 ][ DirIndex.Up ] = [ col + 1, row + 1, col + 1, row ];
            }
            
            // Bottom edge (going right)
            if ( level.rows == row + 1 || currentBase != level.getTileInfo( col, row + 1 ).Base ) {
              edges[ col ][ row + 1 ][ DirIndex.Right ] = [ col, row + 1, col + 1, row + 1 ];
            }
          }
        }
      }
  
      const nextEdge = new Map();
  
      for ( let row = 0; row <= level.rows; row ++ ) {
        for ( let col = 0; col <= level.cols; col ++ ) {
          for ( let dir = 0; dir < 4; dir ++ ) {
            const current = edges[ col ][ row ][ dir ];
  
            if ( current ) {
              const nextCorner = edges[ current[ 2 ] ][ current[ 3 ] ];
  
              // TODO: Try +1 vs -1
              const checkDir = 1;
              for ( let nextDirIndex = 0; nextDirIndex < 4; nextDirIndex ++ ) {
                const nextDir = Utility.modulo( dir + nextDirIndex * checkDir, 4 );
  
                const next = nextCorner[ nextDir ];
                if ( next ) {
                  nextEdge.set( current, next );
                  break;
                }
              }
            }
          }
        }
      }
  
      const unvisited = new Set();
      const visited = new Set();
  
      for ( let row = 0; row <= level.rows; row ++ ) {
        for ( let col = 0; col <= level.cols; col ++ ) {
          edges[ col ][ row ].forEach( edge => {
            if ( edge ) {
              unvisited.add( edge );
            }
          } );
        }
      }
  
      const path = new Path2D();
  
      while ( unvisited.size > 0 ) {
        let [ edge ] = unvisited;
  
        const startDX = edge[ 2 ] - edge[ 0 ];
        const startDY = edge[ 3 ] - edge[ 1 ];
        path.moveTo( -0.5 + edge[ 0 ] + startDX * CORNER_RADIUS, -0.5 + edge[ 1 ] + startDY * CORNER_RADIUS );
  
        while ( !visited.has( edge ) ) {
          unvisited.delete( edge );
          visited.add( edge );
          
          const prev = edge;
          edge = nextEdge.get( edge );
  
          const prevDX = prev[ 2 ] - prev[ 0 ];
          const prevDY = prev[ 3 ] - prev[ 1 ];
          const nextDX = edge[ 2 ] - edge[ 0 ];
          const nextDY = edge[ 3 ] - edge[ 1 ];
  
          if ( prevDX != nextDX || prevDY != nextDY ) {
            if ( 0 == prev[ 2 ] || 0 == prev[ 3 ] || prev[ 2 ] == level.cols || prev[ 3 ] == level.rows ) {
              path.lineTo( -0.5 + prev[ 2 ], -0.5 + prev[ 3 ] );  
            }
            else {
              path.lineTo( -0.5 + prev[ 2 ] - prevDX * CORNER_RADIUS, -0.5 + prev[ 3 ] - prevDY * CORNER_RADIUS );
              path.quadraticCurveTo( -0.5 + prev[ 2 ], -0.5 + prev[ 3 ], -0.5 + edge[ 0 ] + nextDX * CORNER_RADIUS, -0.5 + edge[ 1 ] + nextDY * CORNER_RADIUS );
            }
          }
        }

        path.closePath();
      }
  
      return path;
    } );

    const ROAD_LINE_WIDTH = 0.15, ROAD_LINE_LEN = 0.5;

    for ( let row = 0; row < level.rows; row ++ ) {
      for ( let col = 0; col < level.cols; col ++ ) {

        const index = col + row * level.cols;
        const tileInfoKey = level.tileInfoKeys[ level.tiles[ index ] ];
        const dir = level.directions[ index ];

        if ( tileInfoKey == 'Road' && dir > 0 ) {
          if ( row > 0 ) {
            const nIndex = col + ( row - 1 ) * level.cols;
            const nTileInfoKey = level.tileInfoKeys[ level.tiles[ nIndex ] ];
            const nTileDir = level.directions[ nIndex ];

            if ( nTileInfoKey == 'Road' && dir != Direction.Up && nTileDir && nTileDir != Direction.Down ) {
              this.#lanesPath.rect( col - ROAD_LINE_LEN / 2, row - 0.5 - ROAD_LINE_WIDTH / 2, ROAD_LINE_LEN, ROAD_LINE_WIDTH );
            }
          }
          
          if ( col > 0 ) {
            const wIndex = ( col - 1 ) + row * level.cols;
            const wTileInfoKey = level.tileInfoKeys[ level.tiles[ wIndex ] ];
            const wTileDir = level.directions[ wIndex ];

            if ( wTileInfoKey == 'Road' && dir != Direction.Left && wTileDir && wTileDir != Direction.Right ) {
              this.#lanesPath.rect( col - 0.5 - ROAD_LINE_WIDTH / 2, row - ROAD_LINE_LEN / 2, ROAD_LINE_WIDTH, ROAD_LINE_LEN );
            }
          }
        }
        else if ( tileInfoKey == 'Sidewalk' ) {
          this.#sidewalkSquares.rect( col - 0.4, row - 0.4, 0.8, 0.8 );
        }
        else if ( tileInfoKey == 'Bush' ) {
          Tiles.Bush.drawPaths.forEach( ( pathInfo, index ) => {
            const transform = new DOMMatrix();    // TODO: re-use same one for perf?
            transform.translateSelf( col, row );

            if ( pathInfo.scale ) {
              transform.scaleSelf( pathInfo.scale );
            }
        
            this.#bushPaths[ index ].addPath( pathInfo.path, transform );
          } );
        }
        else if ( tileInfoKey == 'Lilypad' ) {
          Tiles.Lilypad.drawPaths.forEach( ( pathInfo, index ) => {
            const transform = new DOMMatrix();    // TODO: re-use same one for perf?
            transform.translateSelf( col, row );

            if ( pathInfo.scale ) {
              transform.scaleSelf( pathInfo.scale );
            }
        
            this.#lilypadPaths[ index ].addPath( pathInfo.path, transform );
          } );
        }
      }
    }
  }

  draw( ctx ) {
    LAYERS.forEach( ( _, index ) => {
      ctx.fillStyle = COLORS[ index ];
      ctx.fill( this.#layerPaths[ index ], 'evenodd' );
    } );

    ctx.fillStyle = 'yellow';
    ctx.fill( this.#lanesPath );

    ctx.fillStyle = 'gray';
    ctx.fill( this.#sidewalkSquares );

    Tiles.Bush.drawPaths.forEach( ( pathInfo, index ) => {
      if ( pathInfo.fillStyle ) {
        ctx.fillStyle = pathInfo.fillStyle;
        ctx.fill( this.#bushPaths[ index ] );
      }
      if ( pathInfo.strokeStyle ) {
        ctx.strokeStyle = pathInfo.strokeStyle;
        ctx.stroke( this.#bushPaths[ index ] );
      }
    } );

    Tiles.Lilypad.drawPaths.forEach( ( pathInfo, index ) => {
      if ( pathInfo.fillStyle ) {
        ctx.fillStyle = pathInfo.fillStyle;
        ctx.fill( this.#lilypadPaths[ index ] );
      }
      if ( pathInfo.strokeStyle ) {
        ctx.strokeStyle = pathInfo.strokeStyle;
        ctx.stroke( this.#lilypadPaths[ index ] );
      }
    } );
  }
}
