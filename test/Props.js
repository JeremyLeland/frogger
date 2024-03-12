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

const BUSH_COLOR = new Float32Array( [ 0.0, 0.35, 0.0 ] );

const bushFrag = ShaderCommon.FragCommon + /*glsl*/`
  const int BUSH_SIDES = 7;
  const float OFFSET = 0.25, SIZE = 0.18;

  void main() {

    float fromCenter = distance( vec2( 0.0 ), v_pos );
   
    float fromEdge = 0.0;

    // if ( distance( vec2( 0.0 ), v_pos ) < SIZE ) {
    //   // dist = ( SIZE - distance( vec2( 0.0 ), v_pos ) ) / SIZE;
    //   dist = 1.0;
    // }

    // else {
      
      
      // TODO: Do another one of these for the middle, but smaller? Fewer sides?
      for ( int i = 0; i < BUSH_SIDES; i ++ ) {
        float angle = PI * 2.0 * float( i ) / float( BUSH_SIDES );
        vec2 point = vec2( cos( angle ), sin( angle ) ) * OFFSET;

        // dist = min( dist, max( 0.0, SIZE - distance( point, v_pos ) ) );
        fromEdge = max( fromEdge, ( SIZE - distance( point, v_pos ) ) / SIZE );
      }
    // }

    // dist = max( dist, ( SIZE - distance( vec2( 0.0 ), v_pos ) ) / SIZE );

    // outColor = vec4( dist, 0.0, 0.0, 1.0 );

    if ( fromCenter < OFFSET || fromEdge > strokeWidth / SIZE ) {
      // outColor = vec4( mix( BLACK, color, sin( PI / 2.0 * dist ) ), 1.0 );
      outColor = vec4( mix( BLACK, color, cos( PI * fromCenter ) ), 1.0 );
    }
    else if ( fromEdge > 0.0 ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

const ShaderInfo = {
  Bush: {
    id: 'Bush',
    vertexShader: ShaderCommon.CommonVertexShader,
    fragmentShader: bushFrag,
    attributes: ShaderCommon.CommonAttributes,
    uniforms: ShaderCommon.CommonUniforms,
    points: ShaderCommon.SquarePoints,
  },
  Lilypad: {
    id: 'Lilypad',
    vertexShader: ShaderCommon.CommonVertexShader,
    fragmentShader: lilypadFrag,
    attributes: ShaderCommon.CommonAttributes,
    uniforms: ShaderCommon.CommonUniforms,
    points: ShaderCommon.SquarePoints,
  },
}

export function drawBush( gl, mvp ) {
  ShaderCommon.drawShader( gl, ShaderInfo.Bush, {
    mvp: mvp,
    color: BUSH_COLOR,
    strokeWidth: 0.03
  } );
}

export function drawLilypad( gl, mvp ) {
  ShaderCommon.drawShader( gl, ShaderInfo.Lilypad, {
    mvp: mvp,
    color: LILYPAD_COLOR,
    strokeWidth: 0.03
  } );
}
