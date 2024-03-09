import * as ShaderCommon from '../src/ShaderCommon.js';

const LILYPAD_COLOR = new Float32Array( [ 0.0, 0.5, 0.0 ] );

const lilypadFrag = ShaderCommon.FragCommon + /*glsl*/`
  const float LILYPAD_SIZE = 0.4, LILYPAD_ANGLE = 0.3, LILYPAD_OFFSET = 0.15;

  void main() {
    float angle = atan( v_pos.y, v_pos.x - LILYPAD_OFFSET );
    float dist = distance( vec2( 0.0 ), v_pos );

    // TODO: Mostly flat, with a quick curve off at edges

    // TODO: Fix stroke at notch

    if ( dist < LILYPAD_SIZE - strokeWidth && abs( angle ) > LILYPAD_ANGLE + strokeWidth ) {
      outColor = vec4( color, 1.0 );
    }
    else if ( dist < LILYPAD_SIZE && abs( angle ) > LILYPAD_ANGLE ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

const ShaderInfo = {
  Lilypad: {
    id: 'Lilypad',
    vertexShader: ShaderCommon.CommonVertexShader,
    fragmentShader: lilypadFrag,
    attributes: ShaderCommon.CommonAttributes,
    uniforms: ShaderCommon.CommonUniforms,
    points: ShaderCommon.SquarePoints,
  },
}

export function drawLilypad( gl, mvp ) {
  ShaderCommon.drawShader( gl, ShaderInfo.Lilypad, {
    mvp: mvp,
    color: LILYPAD_COLOR,
    strokeWidth: 0.05
  } );
}
