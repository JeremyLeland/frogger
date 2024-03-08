import { mat4 } from '../lib/gl-matrix.js';
import * as ShaderCommon from '../src/ShaderCommon.js';

const carColor = new Float32Array( [ 0.75, 0.1, 0 ] );
const windowColor = new Float32Array( [ 0.5, 0.5, 0.5 ] );

const CAR_WIDTH = 0.7;
const BODY_SIZE = 1.0;
const WINDOW_SIZE = 0.7, WINDOW_OFFSET = -0.04;
const ROOF_SIZE = 0.5, ROOF_WIDTH = 0.65, ROOF_OFFSET = -0.06;

const RED    = new Float32Array( [ 1.0, 0.0, 0.0 ] );
const YELLOW = new Float32Array( [ 1.0, 1.0, 0.0 ] );
const GREEN  = new Float32Array( [ 0.0, 1.0, 0.0 ] );
const BLUE   = new Float32Array( [ 0.0, 0.5, 1.0 ] );

export function drawRedCar   ( gl, mvp ) { drawCar( gl, mvp, RED )    }
export function drawYellowCar( gl, mvp ) { drawCar( gl, mvp, YELLOW ) }
export function drawGreenCar ( gl, mvp ) { drawCar( gl, mvp, GREEN )  }
export function drawBlueCar  ( gl, mvp ) { drawCar( gl, mvp, BLUE )   }

function drawCar( gl, mvp, color ) {
  // Body
  const bodyMatrix = mat4.fromRotationTranslationScale( 
    mat4.create(), 
    [ 0, 0, 0, 0 ],
    [ 0, 0, 0 ],
    [ BODY_SIZE, CAR_WIDTH, 1 ],
  );

  ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.RoundRect, {
    mvp: mat4.multiply( mat4.create(), mvp, bodyMatrix ),
    color: color,
    strokeWidth: 0.05,
  } );

  // Windows
  const windowMatrix = mat4.fromRotationTranslationScale( 
    mat4.create(), 
    [ 0, 0, 0, 0 ],
    [ WINDOW_OFFSET, 0, 0 ],
    [ WINDOW_SIZE, ROOF_WIDTH, 1 ],
  );

  ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.RoundRect, {
    mvp: mat4.multiply( mat4.create(), mvp, windowMatrix ),
    color: windowColor,
    strokeWidth: 0.05,
  } );

  // Roof
  const roofMatrix = mat4.fromRotationTranslationScale( 
    mat4.create(), 
    [ 0, 0, 0, 0 ],
    [ ROOF_OFFSET, 0, 0 ],
    [ ROOF_SIZE, ROOF_WIDTH, ROOF_SIZE ],
  );

  ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.RoundRect, {
    mvp: mat4.multiply( mat4.create(), mvp, roofMatrix ),
    color: color,
    strokeWidth: 0.05,
  } );
}