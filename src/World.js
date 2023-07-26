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

function drawDashedArrow( ctx, x1, y1, x2, y2 ) {
  ctx.beginPath();
  ctx.moveTo( x1, y1 );
  ctx.lineTo( x2, y2 );
  ctx.setLineDash( [ 0.1, 0.1 ] );
  ctx.stroke();
  ctx.setLineDash( [] );

  const HEAD = 0.5;
  const angle = Math.atan2( y1 - y2, x1 - x2 );
  ctx.beginPath();
  ctx.moveTo( x2, y2 );
  ctx.arc( x2, y2, 0.1, angle - HEAD, angle + HEAD );
  ctx.closePath();
  ctx.fill();
}

import { Direction } from '../src/Entity.js';
import { Tiles } from '../src/Tiles.js';
import { Frog } from '../src/Frog.js';
import { Turtle } from '../src/Turtle.js';
import { Log } from '../src/Log.js';
import { Car } from '../src/Car.js';
import { Player } from '../src/Player.js';

const DirMap = [
  Direction.Up,
  Direction.Left,
  Direction.Down,
  Direction.Right,
];

const FroggyColors = [ 'red', 'orange', 'yellow', 'lime', 'dodgerblue', 'blueviolet' ];

const RideType = {
  turtle:     ( vals ) => new Turtle( vals ),
  logStart:   ( vals ) => new Log( Object.assign( vals, { logType: 'start' } ) ),
  logMiddle:  ( vals ) => new Log( Object.assign( vals, { logType: 'middle' } ) ),
  logEnd:     ( vals ) => new Log( Object.assign( vals, { logType: 'end' } ) ),
}

export class World
{
  static DebugGrid = false;

  static async fromFile( path ) {
    const json = JSON.parse( await ( await fetch( path ) ).text() );    // TODO: error handling
    return new World( json );
  }

  // TODO: Lives is list of Players ready to go? 
  //       Use for UI initially, then pull out of list and add to world when spawn?
 
  entities = [];
  rescued = [];
  player;
  needsRespawn = true;
  tiles;
  crop;

  constructor( json ) {
    this.cols = json.cols;
    this.rows = json.rows;

    this.tiles = Array.from( 
      Array( json.cols ), () => Array.from( 
        Array( json.rows ), () => ( {} ) ) );

    this.crop = json.crop ? {
      minCol: json.crop[ 0 ],
      minRow: json.crop[ 1 ],
      maxCol: json.crop[ 2 ],
      maxRow: json.crop[ 3 ],
    } : {
      minCol: 0,
      minRow: 0,
      maxCol: json.cols - 1,
      maxRow: json.rows - 1,
    }

    json.tiles.forEach( ( tileIndex, index ) => {
      const col = index % json.cols;
      const row = Math.floor( index / json.cols );

      this.tiles[ col ][ row ].tileInfo = Tiles[ json.tilePalette[ tileIndex ] ]; // TODO: rename to tileInfo?
    } );

    json.directions.forEach( ( dirIndex, index ) => {
      if ( dirIndex > 0 ) {
        const col = index % json.cols;
        const row = Math.floor( index / json.cols );
        
        this.tiles[ col ][ row ].dir = DirMap[ dirIndex - 1 ]; // TODO: rename to tileInfo?
      }
    } );

    json.warps.forEach( coords => 
      this.tiles[ coords[ 0 ] ][ coords [ 1 ] ].warp = { c: coords[ 2 ], r: coords[ 3 ] }
    );

    this.entities = json.froggies.map( ( coords, index ) => 
      new Frog( { 
        x: coords[ 0 ], 
        y: coords[ 1 ],
        froggyIndex: index,
        color: FroggyColors[ index ],
        canRescue: true,
        size: 0.7, 
        dir: this.tiles[ coords[ 0 ] ][ coords[ 1 ] ].dir 
      } )
    );

    for ( const type in json.rides ) {
      json.rides[ type ].forEach( coords => this.entities.push( 
        RideType[ type ]( { 
          x: coords[ 0 ], 
          y: coords[ 1 ],
          dir: this.tiles[ coords[ 0 ] ][ coords[ 1 ] ].dir,
        } ) 
      ) );
    }

    for ( const color in json.cars ) {
      json.cars[ color ].forEach( coords => this.entities.push( 
        new Car( { 
          x: coords[ 0 ], 
          y: coords[ 1 ], 
          color: color,
          dir: this.tiles[ coords[ 0 ] ][ coords[ 1 ] ].dir,
        } ) 
      ) );
    }

    this.spawnCol = json.player[ 0 ];
    this.spawnRow = json.player[ 1 ];
    // this.respawnPlayer();
  }

  getTile( col, row ) {
    if ( this.crop.minCol <= col && col <= this.crop.maxCol && 
         this.crop.minRow <= row && row <= this.crop.maxRow ) {
      return this.tiles[ col ][ row ];
    }
  }

  killPlayer() {
    this.player.isAlive = false;
    this.needsRespawn = true;
  }

  respawnPlayer() {
    this.needsRespawn = false;

    this.player = new Player( {
      x: this.spawnCol, 
      y: this.spawnRow, 
      color: 'green',
      dir: this.tiles[ this.spawnCol ][ this.spawnRow ].dir
    } );
  }

  rescue( entity ) {
    entity.x = entity.froggyIndex;
    entity.y = 0;
    entity.dir = Direction.Up;
    this.rescued.push( entity );

    this.entities = this.entities.filter( e => e != entity );

    this.needsRespawn = true;
  }

  update( dt ) {
    this.entities.forEach( entity => entity.update( dt, this ) );
    this.player?.update( dt, this );
  }

  draw( ctx ) {
    ctx.translate( 0.5 - this.crop.minCol, 0.5 - this.crop.minRow );

    for ( let r = this.crop.minRow; r <= this.crop.maxRow; r ++ ) {
      for ( let c = this.crop.minCol; c <= this.crop.maxCol; c ++ ) {
        const tile = this.tiles[ c ][ r ];
        const nTile = r > 0 ? this.tiles[ c ][ r - 1 ] : null;
        const wTile = c > 0 ? this.tiles[ c - 1 ][ r ] : null;

        if ( tile.tileInfo ) {
          ctx.save();
          ctx.translate( c, r );
          tile.tileInfo.draw( ctx, tile, nTile, wTile );
          ctx.restore();
        }
      }
    }

    // TODO: store z-index in object or class?
    
    this.entities.forEach( entity => entity.draw( ctx ) );
    this.player?.draw( ctx );

    if ( World.DebugGrid ) {
      ctx.fillStyle = ctx.strokeStyle = ARROW_COLOR;
      ctx.lineWidth = TILE_BORDER;
      ctx.textAlign = 'center';
      ctx.font = '0.2px Arial';
      
      for ( let r = 0; r < this.tiles[ 0 ].length; r ++ ) {
        for ( let c = 0; c < this.tiles.length; c ++ ) {
          const tile = this.tiles[ c ][ r ];
          
          if ( tile.dir ) {
            ctx.save();
            ctx.translate( c, r );
            ctx.rotate( tile.dir.angle );
            ctx.fill( arrow );
            ctx.restore();
          }
          else if ( tile.warp ) {
            drawDashedArrow( ctx, c, r, tile.warp.c, tile.warp.r );
          }
          
          ctx.strokeRect( c - 0.5, r - 0.5, 1, 1 );
          ctx.fillText( `(${ c },${ r })`, c, r + 0.4 );
        }
      }
    }
  }

  drawUI( ctx ) {
    ctx.fillStyle = 'gray';
    ctx.fillRect( 0, 0, 6, 1 );

    ctx.translate( 0.5, 0.5 );

    this.rescued.forEach( froggy => froggy.draw( ctx ) );

  }
}