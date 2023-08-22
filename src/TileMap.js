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
  'blue',
  '#333',
  'dimgray',
  'green',
];

export class TileMap {
  #layerPaths;
  #layerEdges = [];

  constructor( tiles ) {
    const cols = tiles.length;
    const rows = tiles[ 0 ].length;

    this.#layerPaths = LAYERS.map( layerName => {
      // Store the edges coming from each corner, indexed by direction
      const edges = Array.from( 
        Array( cols + 1 ), _ => Array.from( 
          Array( rows + 1 ), _ => 
            Array( 4 ) ) );
      
      this.#layerEdges.push( edges );
  
      for ( let row = 0; row < rows; row ++ ) {
        for ( let col = 0; col < cols; col ++ ) {
          const current = tiles[ col ][ row ].tileInfoKey;   // TODO: Account for bush, lilypad
          
          if ( current == layerName ) {
            // Left edge (going down)
            if ( 0 == col || current != tiles[ col - 1 ][ row ].tileInfoKey ) {
              edges[ col ][ row ][ DirIndex.Down ] = [ col, row, col, row + 1 ];
            }
            
            // Top edge (going left)
            if ( 0 == row || current != tiles[ col ][ row - 1 ].tileInfoKey ) {
              edges[ col + 1 ][ row ][ DirIndex.Left ] = [ col + 1, row, col, row ];
            }
            
            // Right edge (going up)
            if ( cols == col + 1 || current != tiles[ col + 1 ][ row ].tileInfoKey ) {
              edges[ col + 1 ][ row + 1 ][ DirIndex.Up ] = [ col + 1, row + 1, col + 1, row ];
            }
            
            // Bottom edge (going right)
            if ( rows == row + 1 || current != tiles[ col ][ row + 1 ].tileInfoKey ) {
              edges[ col ][ row + 1 ][ DirIndex.Right ] = [ col, row + 1, col + 1, row + 1 ];
            }
          }
        }
      }
  
      const nextEdge = new Map();
  
      for ( let row = 0; row <= rows; row ++ ) {
        for ( let col = 0; col <= cols; col ++ ) {
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
  
      for ( let row = 0; row <= rows; row ++ ) {
        for ( let col = 0; col <= cols; col ++ ) {
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
        path.moveTo( edge[ 0 ] + startDX * CORNER_RADIUS, edge[ 1 ] + startDY * CORNER_RADIUS );
  
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
            if ( 0 == prev[ 2 ] || 0 == prev[ 3 ] || prev[ 2 ] == cols || prev[ 3 ] == rows ) {
              path.lineTo( prev[ 2 ], prev[ 3 ] );  
            }
            else {
              path.lineTo( prev[ 2 ] - prevDX * CORNER_RADIUS, prev[ 3 ] - prevDY * CORNER_RADIUS );
              path.quadraticCurveTo( prev[ 2 ], prev[ 3 ], edge[ 0 ] + nextDX * CORNER_RADIUS, edge[ 1 ] + nextDY * CORNER_RADIUS );
            }
          }
        }

        path.closePath();
      }
  
      return path;
    } );
  }

  draw( ctx ) {
    LAYERS.forEach( ( layerName, index ) => {
      ctx.fillStyle = COLORS[ index ];
      ctx.fill( this.#layerPaths[ index ], 'evenodd' );

      // ctx.fillStyle = ctx.strokeStyle = 'white';

      // for ( let row = 0; row < this.#layerEdges[ index ][ 0 ].length; row ++ ) {
      //   for ( let col = 0; col < this.#layerEdges[ index ].length; col ++ ) {
      //     this.#layerEdges[ index ][ col ][ row ].forEach( edge => {
      //       if ( edge ) {
      //         Utility.drawArrow( ctx, ...edge );
      //       }
      //     } );
      //   }
      // }
    } );
  }
}