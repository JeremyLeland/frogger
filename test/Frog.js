import { mat4 } from '../lib/gl-matrix.js';
import * as ShaderCommon from '../src/ShaderCommon.js';

const FROGGY_SIZE = 0.75;

const FOOT_X = 0.4, FOOT_Y = 0.4, FOOT_SIZE = 0.07;
const LEG_X = 0.05, LEG_Y = 0.1, LEG_SIZE = 0.14;

const BODY_SIZE = 0.8;

const EYE_OFFSET_X = 0.18, EYE_OFFSET_Y = 0.17;
const EYE_SIZE = 0.2;

const PUPIL_OFFSET_X = 0.23, PUPIL_OFFSET_Y = 0.17;
const PUPIL_W = 0.1, PUPIL_H = 0.16;

const RED    = new Float32Array( [ 1.0,  0.0,  0.0  ] );
const ORANGE = new Float32Array( [ 1.0,  0.65, 0.0  ] );
const YELLOW = new Float32Array( [ 1.0,  1.0,  0.0  ] );
const GREEN  = new Float32Array( [ 0.0,  1.0,  0.0  ] );
const BLUE   = new Float32Array( [ 0.12, 0.56, 1.0  ] );
const PURPLE = new Float32Array( [ 0.54, 0.17, 0.88 ] );

const eyeColor = new Float32Array( [ 1, 1, 1 ] );
const pupilColor = new Float32Array( [ 0, 0, 0 ] );

const froggyScaleMatrix = mat4.fromScaling( 
  mat4.create(), 
  [ FROGGY_SIZE, FROGGY_SIZE, 1 ],
);

const legMatrices = Array.from( Array( 2 ), ( _, xIndex ) => 
  Array.from( Array( 2 ), ( _, yIndex ) => 
    mat4.fromRotationTranslationScale( 
      mat4.create(),
      [ 0, 0, 0, 0 ],
      [ 0.5 * ( xIndex - 0.5 ), 0.5 * ( yIndex - 0.5 ), 0 ],
      [ 0.5, 0.5, 1 ],
    )
  )
);

const bodyMatrix = mat4.fromRotationTranslationScale( 
  mat4.create(), 
  [ 0, 0, 0, 0 ],
  [ 0, 0, 0 ],
  [ BODY_SIZE, BODY_SIZE, 1 ],
);

const eyeMatrices = [ -1, 1 ].map( offsetY => 
  mat4.fromRotationTranslationScale( 
    mat4.create(), 
    [ 0, 0, 0, 0 ],
    [ EYE_OFFSET_X, offsetY * EYE_OFFSET_Y, 0 ],
    [ EYE_SIZE, EYE_SIZE, 1 ],
  )
);

const pupilMatrices = [ -1, 1 ].map( offsetY => 
  mat4.fromRotationTranslationScale( 
    mat4.create(), 
    [ 0, 0, 0, 0 ],
    [ PUPIL_OFFSET_X, offsetY * PUPIL_OFFSET_Y, 0 ],
    [ PUPIL_W, PUPIL_H, 1 ],
  )
);

export function drawFroggy1( gl, mvp, animationTime ) { drawFroggy( gl, mvp, animationTime, RED    ) }
export function drawFroggy2( gl, mvp, animationTime ) { drawFroggy( gl, mvp, animationTime, ORANGE ) }
export function drawFroggy3( gl, mvp, animationTime ) { drawFroggy( gl, mvp, animationTime, YELLOW ) }
export function drawFroggy4( gl, mvp, animationTime ) { drawFroggy( gl, mvp, animationTime, GREEN  ) }
export function drawFroggy5( gl, mvp, animationTime ) { drawFroggy( gl, mvp, animationTime, BLUE   ) }
export function drawFroggy6( gl, mvp, animationTime ) { drawFroggy( gl, mvp, animationTime, PURPLE ) }

export function drawFroggy( gl, mvp, animationTime, color ) {
  drawFrog( gl, 
    mat4.multiply( mat4.create(), mvp, froggyScaleMatrix ),
    0,
    color,
  );
}

export function drawFrog( gl, mvp, animationTime = 0, color ) {

  const shader = ShaderCommon.getShader( gl, ShaderCommon.ShaderInfo.QuadraticBezierFrag );
  gl.useProgram( shader.program );

  for ( let xIndex = 0; xIndex < 2; xIndex ++ ) {
    for ( let yIndex = 0; yIndex < 2; yIndex ++ ) {

      const xOffset = 2 * xIndex - 1;
      const yOffset = 2 * yIndex - 1;
      
      gl.uniformMatrix4fv( shader.uniformLocations.mvp, false, 
        mat4.multiply( mat4.create(), mvp, legMatrices[ xIndex ][ yIndex ] )
      );
      gl.uniform2fv( shader.uniformLocations.P0, new Float32Array( [ FOOT_X * ( 1 - 2 * xIndex ), FOOT_Y * ( 1 - 2 * yIndex ) ] ) );
      gl.uniform2fv( shader.uniformLocations.P1, new Float32Array( [ FOOT_X * ( 1 - 2 * xIndex ), FOOT_Y * ( 2 * yIndex - 1 ) ] ) );
      gl.uniform2fv( shader.uniformLocations.P2, new Float32Array( [ FOOT_X * ( 2 * xIndex - 1 ), FOOT_Y * ( 2 * yIndex - 1 ) ] ) );
      gl.uniform1f( shader.uniformLocations.startWidth, LEG_SIZE );
      gl.uniform1f( shader.uniformLocations.endWidth, FOOT_SIZE );
      
      gl.uniform3fv( shader.uniformLocations.color, color );
      gl.uniform1f( shader.uniformLocations.strokeWidth, 0.02 );
    
      ShaderCommon.drawPoints( gl, shader );
    }
  }

  // TODO2: Have uniforms list track locations as well as setter function


  // Body
  ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.Circle, {
    mvp: mat4.multiply( mat4.create(), mvp, bodyMatrix ),
    color: color,
    strokeWidth: 0.02,
  } );

  // Eyes
  eyeMatrices.forEach( eyeMatrix => {
    ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.Circle, {
      mvp: mat4.multiply( mat4.create(), mvp, eyeMatrix ),
      color: eyeColor,
      strokeWidth: 0.1,
    } );
  } );

  // Pupil
  pupilMatrices.forEach( pupilMatrix => {
    ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.Circle, {
      mvp: mat4.multiply( mat4.create(), mvp, pupilMatrix ),
      color: pupilColor,
      strokeWidth: 0.1,
    } );
  } );
}

// MeshDemo.meshDemo( 
//   group, 
//   ( dt ) => {
//     animationTime += dt / 100;

//     frontLeftUniforms.P2.value.x = FOOT_X - 0.05 + 0.05 * Math.sin( animationTime );
//     frontRightUniforms.P2.value.x = FOOT_X - 0.05 + 0.05 * Math.sin( animationTime );
//     backLeftUniforms.P2.value.x = backRightUniforms.P2.value.x = -FOOT_X - 0.05 + 0.05 * Math.sin( animationTime );
//   }
// ); 