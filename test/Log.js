import { mat4 } from '../lib/gl-matrix.js';
import * as ShaderCommon from '../src/ShaderCommon.js';

const LOG_WIDTH = 0.4;

const LOG_COLOR = new Float32Array( [ 0.5, 0.25, 0.05 ] );


const logStartFrag = ShaderCommon.FragCommon + /*glsl*/`
  void main() {
    float distY = abs( v_pos.y );
    float leftDistX = -0.5 + v_pos.y * v_pos.y - v_pos.x;
    
    if ( distY < ${ LOG_WIDTH } && leftDistX < -strokeWidth ) {
      outColor = vec4( mix( BLACK, color, cos( PI * distY ) ), 1.0 );
    }
    else if ( distY < ${ LOG_WIDTH } + strokeWidth && leftDistX < 0.0 ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

const logMiddleFrag = ShaderCommon.FragCommon + /*glsl*/`
  void main() {
    float distY = abs( v_pos.y );
    
    if ( distY < ${ LOG_WIDTH } ) {
      outColor = vec4( mix( BLACK, color, cos( PI * distY ) ), 1.0 );
    }
    else if ( distY < ${ LOG_WIDTH } + strokeWidth ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

const logEndFrag = ShaderCommon.FragCommon + /*glsl*/`
  void main() {
    float distY = abs( v_pos.y );
    float rightDistX = 0.5 - v_pos.y * v_pos.y - v_pos.x;
    
    if ( distY < ${ LOG_WIDTH } && rightDistX > strokeWidth ) {
      outColor = vec4( mix( BLACK, color, cos( PI * distY ) ), 1.0 );
    }
    else if ( distY < ${ LOG_WIDTH } + strokeWidth && rightDistX > 0.0 ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

const ShaderInfo = {
  LogStart: {
    id: 'LogStart',
    vertexShader: ShaderCommon.CommonVertexShader,
    fragmentShader: logStartFrag,
    attributes: ShaderCommon.CommonAttributes,
    uniforms: ShaderCommon.CommonUniforms,
    points: ShaderCommon.SquarePoints,
  },
  LogMiddle: {
    id: 'LogMiddle',
    vertexShader: ShaderCommon.CommonVertexShader,
    fragmentShader: logMiddleFrag,
    attributes: ShaderCommon.CommonAttributes,
    uniforms: ShaderCommon.CommonUniforms,
    points: ShaderCommon.SquarePoints,
  },
  LogEnd: {
    id: 'LogEnd',
    vertexShader: ShaderCommon.CommonVertexShader,
    fragmentShader: logEndFrag,
    attributes: ShaderCommon.CommonAttributes,
    uniforms: ShaderCommon.CommonUniforms,
    points: ShaderCommon.SquarePoints,
  }
}

export function drawLogStart ( gl, mvp ) { drawLog( gl, mvp, ShaderInfo.LogStart  ) }
export function drawLogMiddle( gl, mvp ) { drawLog( gl, mvp, ShaderInfo.LogMiddle ) }
export function drawLogEnd   ( gl, mvp ) { drawLog( gl, mvp, ShaderInfo.LogEnd    ) }

function drawLog( gl, mvp, shaderInfo ) {
  ShaderCommon.drawShader( gl, shaderInfo, {
    mvp: mvp,
    color: LOG_COLOR,
    strokeWidth: 0.05
  } );
}
