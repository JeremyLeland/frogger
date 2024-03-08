import { mat4 } from '../lib/gl-matrix.js';
import * as ShaderCommon from '../src/ShaderCommon.js';

const LEG_L = 0.45, LEG_W = 0.12;
const HEAD_SIZE = 0.3;
const SHELL_SIZE = 0.6;

const bodyColor = new Float32Array( [ 0.0, 0.5, 0 ] );
const shellColor = new Float32Array( [ 0.25, 0.5, 0.25 ] );

const headMatrix = mat4.fromRotationTranslationScale( 
  mat4.create(), 
  [ 0, 0, 0, 0 ],
  [ 0.3, 0, 0 ],
  [ HEAD_SIZE, HEAD_SIZE, HEAD_SIZE ],
);

const shellMatrix = mat4.fromRotationTranslationScale( 
  mat4.create(), 
  [ 0, 0, 0, 0 ],
  [ -0.05, 0, 0 ],
  [ SHELL_SIZE, SHELL_SIZE, SHELL_SIZE ],
);

export function drawTurtle( gl, mvp, animationTime = 0 ) {
  // Legs
  const legAngleOffset = 0.3 * Math.sin( animationTime * 4 );

  [ -1, 1 ].forEach( side => {
    [ 0.4, 0.75 ].forEach( legAngle => {
      const angle = side * ( Math.PI * legAngle + legAngleOffset );

      // TODO: Avoid recreating these constantly? (for heap purposes)
      const legMatrix = mat4.fromRotationTranslationScale( 
        mat4.create(), 
        [ Math.cos( angle / 2 ), Math.sin( angle / 2 ), 0, 0 ],
        [ -0.05, 0, 0 ],
        [ LEG_L, LEG_W, 1.0 ],
      );

      ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.Triangle, {
        mvp: mat4.multiply( mat4.create(), mvp, legMatrix ),
        color: bodyColor,
        strokeWidth: 0.1,
      } );
    } );
  } );

  // Head
  ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.Circle, {
    mvp: mat4.multiply( mat4.create(), mvp, headMatrix ),
    color: bodyColor,
    strokeWidth: 0.1,
  } );

  // Shell
  ShaderCommon.drawShader( gl, ShaderCommon.ShaderInfo.Circle, {
    mvp: mat4.multiply( mat4.create(), mvp, shellMatrix ),
    color: shellColor,
    strokeWidth: 0.05,
  } );
}