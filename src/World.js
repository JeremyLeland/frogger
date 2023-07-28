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

import { Direction } from './Entity.js';
import { Tiles } from './Tiles.js';
import { Entity } from './Entity.js';
import { Froggy } from './Froggy.js';
import { Entities } from './Entities.js';
import { Player } from './Player.js';

const DirMap = [
  Direction.Up,
  Direction.Left,
  Direction.Down,
  Direction.Right,
];

export class World
{
  static DebugGrid = false;

  static async fromFile( path ) {
    const json = JSON.parse( await ( await fetch( path ) ).text() );    // TODO: error handling
    return new World( json );
  }
 
  entities = [];
  rescued = [];
  player;
  needsRespawn = false;
  tiles;
  crop;
  maxTime;
  timeLeft = 0;

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

      this.tiles[ col ][ row ].tileInfo = Tiles[ json.tilePalette[ tileIndex ] ];
    } );

    json.directions.forEach( ( dirIndex, index ) => {
      if ( dirIndex > 0 ) {
        const col = index % json.cols;
        const row = Math.floor( index / json.cols );
        
        this.tiles[ col ][ row ].dir = DirMap[ dirIndex - 1 ];
      }
    } );

    json.warps.forEach( coords => 
      this.tiles[ coords[ 0 ] ][ coords [ 1 ] ].warp = { c: coords[ 2 ], r: coords[ 3 ] }
    );

    this.entities = json.froggies.map( ( coords, index ) => 
      new Froggy( { 
        x: coords[ 0 ], 
        y: coords[ 1 ],
        froggyIndex: index,
        dir: this.tiles[ coords[ 0 ] ][ coords[ 1 ] ].dir 
      } )
    );

    for ( const type in json.entities ) {
      json.entities[ type ].forEach( coords => 
        this.addEntity( type, coords[ 0 ], coords[ 1 ] ) 
      );
    }

    this.maxTime = json.time;
    
    this.lives = Array.from( Array( 4 ), () => new Player( { color: 'green', dir: Direction.Up } ) );
    
    this.spawnCol = json.player[ 0 ];
    this.spawnRow = json.player[ 1 ];
    this.respawnPlayer();
  }

  getTile( col, row ) {
    if ( this.crop.minCol <= col && col <= this.crop.maxCol && 
         this.crop.minRow <= row && row <= this.crop.maxRow ) {
      return this.tiles[ col ][ row ];
    }
  }

  setDirection( dir, col, row ) {
    this.tiles[ col ][ row ].dir = dir;

    let affected = this.entities.find( e => e.x == col && e.y == row );
    
    // TODO: affected ?= froggies.find (if we ever make these separate)

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
      Object.assign( 
        new Entity( { 
          type: type,
          x: col,
          y: row,
          dir: this.tiles[ col ][ row ].dir,
        } ), 
        Entities[ type ]
      )
    );
  }

  removeEntity( col, row ) {
    this.entities = this.entities.filter( e => e.x != col || e.y != row );
  }

  // TODO: Fix warps when adding/removing!

  addColumn( col ) {
    this.tiles.splice( col, 0, 
      Array.from( this.tiles[ col ], e => ( { tileInfo: e.tileInfo, dir: e.dir } ) ) 
    );

    this.entities.filter( e => e.x > col ).forEach( e => e.x ++ );
    if ( this.player.x > col ) {
      this.player.x ++;
    }

    this.cols ++;
    this.crop.maxCol ++;
  }

  removeColumn( col ) {
    this.tiles.splice( col, 1 );

    this.entities.filter( e => e.x > col ).forEach( e => e.x -- );
    if ( this.player.x > col ) {
      this.player.x --;
    }

    this.cols --;
    this.crop.maxCol --;
  }

  addRow( row ) {
    for ( let col = 0; col < this.cols; col ++ ) {
      const toCopy = this.tiles[ col ][ row ];
      this.tiles[ col ].splice( row, 0, ( { tileInfo: toCopy.tileInfo, dir: toCopy.dir } ) );
    }

    this.entities.filter( e => e.y > row ).forEach( e => e.y ++ );
    if ( this.player.y > row ) {
      this.player.y ++;
    }

    this.rows ++;
    this.crop.maxRow ++;
  }

  removeRow( row ) {
    for ( let col = 0; col < this.cols; col ++ ) {
      this.tiles[ col ].splice( row, 1 );
    }

    this.entities.filter( e => e.y > row ).forEach( e => e.y -- );
    if ( this.player.y > row ) {
      this.player.y --;
    }

    this.rows --;
    this.crop.maxRow --;
  }

  killPlayer() {
    this.player.kill();
    this.needsRespawn = true;
    
    this.lives.pop();
  }

  respawnPlayer() {
    this.needsRespawn = false;

    this.timeLeft = this.maxTime;

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

    if ( !this.needsRespawn ) {
      this.timeLeft = Math.max( 0, this.timeLeft - dt );
      
      if ( this.timeLeft == 0 ) {
        this.killPlayer();
      }
    }
  }

  draw( ctx ) {
    ctx.save();
    ctx.translate( 0.5, 0.5 );

    // TODO: Maybe explicitly leave out cropped tiles sometime?
    // for ( let r = this.crop.minRow; r <= this.crop.maxRow; r ++ ) {
    //   for ( let c = this.crop.minCol; c <= this.crop.maxCol; c ++ ) {
    for ( let r = 0; r < this.tiles[ 0 ].length; r ++ ) {
      for ( let c = 0; c < this.tiles.length; c ++ ) {
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
      ctx.font = '10px Arial';      // work around https://bugzilla.mozilla.org/show_bug.cgi?id=1845828
      
      for ( let r = 0; r < this.tiles[ 0 ].length; r ++ ) {
        for ( let c = 0; c < this.tiles.length; c ++ ) {
          const tile = this.tiles[ c ][ r ];

          ctx.save();
          ctx.translate( c, r );

          ctx.strokeRect( -0.5, -0.5, 1, 1 );

          if ( tile.dir ) {
            ctx.save();
            ctx.rotate( tile.dir.angle );
            ctx.fill( arrow );
            ctx.restore();
          }

          ctx.scale( 0.02, 0.02 );    // work around https://bugzilla.mozilla.org/show_bug.cgi?id=1845828
          ctx.fillText( `(${ c },${ r })`, 0, 20 );

          ctx.restore();
          
          if ( tile.warp ) {
            drawDashedArrow( ctx, c, r, tile.warp.c, tile.warp.r );
          }
        }
      }
    }

    ctx.restore();
  }

  drawUI( ctx ) {
    ctx.fillStyle = 'gray';
    ctx.fillRect( 0, 0, 14, 1 );

    ctx.translate( 0.5, 0.5 );
    
    this.rescued.forEach( froggy => froggy.draw( ctx ) );
    
    ctx.translate( 6, 0 );
    
    const timerGrad = ctx.createLinearGradient( 0, 0, 3, 0 );
    timerGrad.addColorStop( 0, 'red' );
    timerGrad.addColorStop( 0.5, 'yellow' );
    timerGrad.addColorStop( 1, 'green' );

    ctx.fillStyle = timerGrad;
    ctx.fillRect( 0, -0.15, 3 * ( this.timeLeft / this.maxTime ), 0.3 );
    ctx.lineWidth = 0.02;
    ctx.strokeRect( 0, -0.15, 3, 0.3 );

    ctx.translate( 3 + 4, 0 );
    this.lives.forEach( frog => {
      frog.draw( ctx );
      ctx.translate( -1, 0 );
    } );
  }
}