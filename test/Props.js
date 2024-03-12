import * as ShaderCommon from '../src/ShaderCommon.js';

const LILYPAD_COLOR = new Float32Array( [ 0.0, 0.5, 0.0 ] );

const lilypadFrag = ShaderCommon.FragCommon + /*glsl*/`
  const float LILYPAD_SIZE = 0.4, LILYPAD_ANGLE = 0.3, LILYPAD_OFFSET = 0.25;

  void main() {
    float fromEdge = LILYPAD_SIZE - distance( vec2( 0.0 ), v_pos );

    // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line#Line_defined_by_point_and_angle
    float lower = -cos( LILYPAD_ANGLE ) * ( 0.0 - v_pos.y ) + sin( LILYPAD_ANGLE ) * ( LILYPAD_OFFSET - v_pos.x );
    float upper = cos( -LILYPAD_ANGLE ) * ( 0.0 - v_pos.y ) - sin( -LILYPAD_ANGLE ) * ( LILYPAD_OFFSET - v_pos.x );

    float dist = min( fromEdge, max( lower, upper ) );

    if ( dist > strokeWidth ) {
      outColor = vec4( mix( BLACK, color, sin( PI / 2.0 * min( 1.0, dist * 9.0 ) ) ), 1.0 );
    }
    else if ( dist > 0.0 ) {
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
    strokeWidth: 0.03
  } );
}
