// TODO: Move to entities folder

const FOOT_OFFSET_X = 0.4, FOOT_OFFSET_Y = 0.4;
const FOOT_SIZE = 0.1, TOE_LENGTH = 0.1;
const FOOT_SHIFT = -0.1;

export function FootFunc( animationAction, animationTime = 0 ) {
  const footOffset = -0.1 * Math.sin( animationTime * Math.PI );

  const feet = new Path2D();
  
  [ -1, 1 ].forEach( dir => {
    [ -1, 1 ].forEach( side => {
      const x = dir * ( FOOT_OFFSET_X + ( animationAction == Frog.Status.SquishedHorizontal ? 0.1 : 0 ) ) + FOOT_SHIFT + footOffset;
      const y = side * ( FOOT_OFFSET_Y + ( animationAction == Frog.Status.SquishedVertical ? 0.1 : 0 ) );

      feet.moveTo( x,             y - FOOT_SIZE / 2 );
      feet.lineTo( x + FOOT_SIZE, y - FOOT_SIZE     );
      feet.quadraticCurveTo( 
        x + FOOT_SIZE + TOE_LENGTH, y, 
        x + FOOT_SIZE,              y + FOOT_SIZE
      );
      feet.lineTo( x, y + FOOT_SIZE / 2 );
      feet.lineTo( x, y - FOOT_SIZE / 2 );
    } );
  } );

  return feet;
}

export function LegFunc( animationAction, animationTime = 0 ) {
  const footOffset = -0.1 * Math.sin( animationTime * Math.PI );

  const legs = new Path2D();
  
  [ -1, 1 ].forEach( dir => {
    [ -1, 1 ].forEach( side => {
      const footX = dir * ( FOOT_OFFSET_X + ( animationAction == Frog.Status.SquishedHorizontal ? 0.1 : 0 ) ) + FOOT_SHIFT + footOffset;
      const footY = FOOT_OFFSET_Y + ( animationAction == Frog.Status.SquishedVertical ? 0.1 : 0 );

      // TODO: Change magic numbers to named constants
      legs.moveTo( 0, side * ( footY - 0.2 ) );
      legs.quadraticCurveTo(
        0, side * footY,
        footX, side * ( footY + FOOT_SIZE / 2 ), 
      );
      legs.lineTo( footX, side * ( footY - FOOT_SIZE / 2 ) );
      legs.quadraticCurveTo( 
        dir * 0.1, side * ( footY - 0.1 ), 
        dir * 0.2, side * ( footY - 0.2 ), 
      );
    } );
  } );

  return legs;
}

const BODY_SIZE = 0.4;

const body = new Path2D();
body.arc( 0, 0, BODY_SIZE, 0, Math.PI * 2 );

const bodySquishHoriz = new Path2D();
bodySquishHoriz.ellipse( 0, 0, BODY_SIZE + 0.1, BODY_SIZE, 0, 0, Math.PI * 2 );

const bodySquishVert = new Path2D();
bodySquishVert.ellipse( 0, 0, BODY_SIZE, BODY_SIZE + 0.1, 0, 0, Math.PI * 2 );

// TODO: Need these all separate for proper z-ordering, otherwise leg lines show through body

export function BodyFunc( animationAction, animationTime = 0 ) {
  if ( animationAction == Frog.Status.SquishedHorizontal ) {
    return bodySquishHoriz;
  }
  else if ( animationAction == Frog.Status.SquishedVertical ) {
    return bodySquishVert;
  }
  else {
    return body;
  }
}

const EYE_OFFSET_X = 0.18, EYE_OFFSET_Y = 0.17;
const EYE_SIZE = 0.1;

const PUPIL_OFFSET_X = 0.23, PUPIL_OFFSET_Y = 0.17;
const PUPIL_W = 0.05, PUPIL_H = 0.08;

const sclera = new Path2D();
sclera.arc( EYE_OFFSET_X, -EYE_OFFSET_Y, EYE_SIZE, 0, Math.PI * 2 );
sclera.moveTo( EYE_OFFSET_X, EYE_OFFSET_Y + EYE_SIZE );
sclera.arc( EYE_OFFSET_X,  EYE_OFFSET_Y, EYE_SIZE, 0, Math.PI * 2 );

const empty = new Path2D();

const pupils = new Path2D();
pupils.ellipse( PUPIL_OFFSET_X, -PUPIL_OFFSET_Y, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );
pupils.moveTo(  PUPIL_OFFSET_X, PUPIL_OFFSET_Y + PUPIL_H );
pupils.ellipse( PUPIL_OFFSET_X,  PUPIL_OFFSET_Y, PUPIL_W, PUPIL_H, 0, 0, Math.PI * 2 );

// TODO: Make this with rotated rects? (so we're not stroking it)
const exes = new Path2D();
exes.moveTo( EYE_OFFSET_X - EYE_SIZE, -EYE_OFFSET_Y - EYE_SIZE );
exes.lineTo( EYE_OFFSET_X + EYE_SIZE, -EYE_OFFSET_Y + EYE_SIZE );
exes.moveTo( EYE_OFFSET_X + EYE_SIZE, -EYE_OFFSET_Y - EYE_SIZE );
exes.lineTo( EYE_OFFSET_X - EYE_SIZE, -EYE_OFFSET_Y + EYE_SIZE );
exes.moveTo( EYE_OFFSET_X - EYE_SIZE, EYE_OFFSET_Y - EYE_SIZE );
exes.lineTo( EYE_OFFSET_X + EYE_SIZE, EYE_OFFSET_Y + EYE_SIZE );
exes.moveTo( EYE_OFFSET_X + EYE_SIZE, EYE_OFFSET_Y - EYE_SIZE );
exes.lineTo( EYE_OFFSET_X - EYE_SIZE, EYE_OFFSET_Y + EYE_SIZE );

export function ScleraFunc( animationAction, animationTime ) {
  if ( !animationAction || animationAction == Frog.Status.Alive ) {
    return sclera;
  }
  else {
    return empty;
  }
}

export function PupilFunc( animationAction, animationTime ) {
  if ( animationAction && animationAction != Frog.Status.Alive ) {
    return exes;
  }
  else {
    return pupils;
  }
}

export class Frog {
  static Status = {
    Alive: 'alive',
    Expired: 'expired',
    Drowned: 'drowned',
    SquishedHorizontal: 'squishedHorizontal',
    SquishedVertical: 'squishedVertical',
  };

  static getFrogGradient( ctx, color ) {
    const gradient = ctx.createRadialGradient( 0, 0, 0, 0, 0, 1.5 );
    gradient.addColorStop( 0, color );
    gradient.addColorStop( 1, 'black' );
    return gradient;
  }

  static drawFrog( ctx, bodyGradient, animationAction, animationTime = 0 ) {
    ctx.fillStyle = bodyGradient;
    
    const footOffset = -0.1 * Math.sin( animationTime * Math.PI );

    ctx.beginPath();

    [ -1, 1 ].forEach( dir => {
      [ -1, 1 ].forEach( side => {
        const x = dir * ( FOOT_OFFSET_X + ( animationAction == Frog.Status.SquishedHorizontal ? 0.1 : 0 ) ) + FOOT_SHIFT + footOffset;
        const y = side * ( FOOT_OFFSET_Y + ( animationAction == Frog.Status.SquishedVertical ? 0.1 : 0 ) );

        ctx.moveTo( x,             y - FOOT_SIZE / 2 );
        ctx.lineTo( x + FOOT_SIZE, y - FOOT_SIZE     );
        ctx.quadraticCurveTo( 
          x + FOOT_SIZE + TOE_LENGTH, y, 
          x + FOOT_SIZE,              y + FOOT_SIZE
        );
        ctx.lineTo( x, y + FOOT_SIZE / 2 );
        ctx.lineTo( x, y - FOOT_SIZE / 2 );
      } );
    } );

    ctx.fill();
    ctx.stroke();

    ctx.beginPath();

    [ -1, 1 ].forEach( dir => {
      [ -1, 1 ].forEach( side => {
        const footX = dir * ( FOOT_OFFSET_X + ( animationAction == Frog.Status.SquishedHorizontal ? 0.1 : 0 ) ) + FOOT_SHIFT + footOffset;
        const footY = FOOT_OFFSET_Y + ( animationAction == Frog.Status.SquishedVertical ? 0.1 : 0 );

        // TODO: Change magic numbers to named constants
        ctx.moveTo( 0, side * ( footY - 0.2 ) );
        ctx.quadraticCurveTo(
          0, side * footY,
          footX, side * ( footY + FOOT_SIZE / 2 ), 
        );
        ctx.lineTo( footX, side * ( footY - FOOT_SIZE / 2 ) );
        ctx.quadraticCurveTo( 
          dir * 0.1, side * ( footY - 0.1 ), 
          dir * 0.2, side * ( footY - 0.2 ), 
        );
      } );
    } );

    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    if ( animationAction == Frog.Status.SquishedHorizontal ) {
      ctx.fill( bodySquishHoriz );
      ctx.stroke( bodySquishHoriz );
    }
    else if ( animationAction == Frog.Status.SquishedVertical ) {
      ctx.fill( bodySquishVert );
      ctx.stroke( bodySquishVert );
    }
    else {
      ctx.fill( body );
      ctx.stroke( body );
    }
      
    if ( animationAction && animationAction != Frog.Status.Alive ) {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = EYE_SIZE / 2;
      ctx.stroke( exes );
    }
    else {
      ctx.fillStyle = 'white';
      ctx.fill( sclera );
      ctx.stroke( sclera );
      
      ctx.fillStyle = 'black';
      ctx.fill( pupils );
    }

    // TODO: This rectangle is obvious near edges of water
    //       Maybe change the colors instead of drawing a rectangle?
    if ( animationAction == Frog.Status.Drowned ) {
      ctx.fillStyle = '#000080aa';
      ctx.fillRect( -0.5, -0.5, 1, 1 );
    }
  }
}
