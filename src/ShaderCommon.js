export const CommonVertexShader = /*glsl*/`# version 300 es
  in vec4 vertexPosition;

  uniform mat4 mvp;

  out vec2 v_pos;
  // out float strokeWidth;

  void main() {
    gl_Position = mvp * vertexPosition;
    v_pos = vertexPosition.xy;

    // Modified from https://math.stackexchange.com/questions/13150/extracting-rotation-scale-values-from-2d-transformation-matrix/13165#13165
    // float sx = sign( mvp[ 0 ][ 0 ] ) * length( vec2( mvp[ 0 ][ 0 ], mvp[ 0 ][ 1 ] ) );
    // float sx = sign( mvp[ 0 ][ 0 ] ) * length( vec2( mvp[ 0 ][ 0 ], mvp[ 0 ][ 1 ] ) );

    // See https://math.stackexchange.com/questions/237369/given-this-transformation-matrix-how-do-i-decompose-it-into-translation-rotati
    // float a = mvp[ 0 ][ 0 ], b = mvp[ 1 ][ 0 ], c = mvp[ 2 ][ 0 ];
    // float e = mvp[ 0 ][ 1 ], f = mvp[ 1 ][ 1 ], g = mvp[ 2 ][ 1 ];
    // float i = mvp[ 0 ][ 2 ], j = mvp[ 1 ][ 2 ], k = mvp[ 2 ][ 2 ];

    // float sx = length( a, e, i );
    // float sy = length( b, f, j );
    // float sz = length( c, g, k );

    // float sx = length( mvp[ 0 ] );
    // float sy = length( mvp[ 1 ] );
    // float sz = length( mvp[ 2 ] );

    // vec3 s = normalize( vec3( sx, sy, sz ) );
    
    // strokeWidth = 0.1 / max( s.x, max( s.y, s.z ) );  // min? max?
  }
`;

export const FragCommon = /*glsl*/ `# version 300 es
  precision mediump float;

  #define PI 3.14159265359

  in vec2 v_pos;
  // in float strokeWidth;    // TODO: Get this from mvp scale component

  uniform vec3 color;
  uniform float strokeWidth;

  const vec3 BLACK = vec3( 0.0 );

  out vec4 outColor;
`;

const circleFrag = FragCommon + /*glsl*/ `
  const float FIX_SHADING = 0.7;

  void main() {
    float dist = distance( vec2( 0.0, 0.0 ), v_pos.xy );

    if ( dist < 0.5 - strokeWidth ) {
      outColor = vec4( mix( BLACK, color, cos( PI * dist * FIX_SHADING ) ), 1.0 );
    }
    else if ( dist < 0.5 ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

const roundRectFrag = FragCommon + /*glsl*/ `
  // uniform float radius;
  const float radius = 0.3;

  const float FIX_SHADING = 0.7;

  void main() {

    float dist = 0.0;

    float innerEdge = 0.5 - radius;

    if ( abs( v_pos.x ) < innerEdge ) {
      dist = max( 0.0, 0.5 * ( abs( v_pos.y ) - innerEdge ) / radius );
    }
    else if ( abs( v_pos.y ) < innerEdge ) {
      dist = max( 0.0, 0.5 * ( abs( v_pos.x ) - innerEdge ) / radius );
    }
    else {
      dist = 0.5 * distance( vec2( innerEdge ), abs( v_pos.xy ) ) / radius;
    }

    if ( dist < 0.5 - strokeWidth ) {
      outColor = vec4( mix( BLACK, color, cos( PI * dist * FIX_SHADING ) ), 1.0 );
    }
    else if ( dist < 0.5 ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

const triangleFrag = FragCommon + /*glsl*/ `
  void main() {
    float dist = v_pos.x - abs( v_pos.y );

    if ( dist > strokeWidth && v_pos.x < 1.0 - strokeWidth / 2.0 ) {
      outColor = vec4( mix( vec3( 0.0 ), color, sin( PI / 2.0 * dist ) ), 1.0 );
    }
    else {
      outColor = vec4( 0.0, 0.0, 0.0, 1.0 );
    }
  }
`;

const quadraticBezierFrag = FragCommon + /* glsl */ `
  uniform vec2 P0, P1, P2;
  uniform float startWidth, endWidth;
  
  float cubeRoot( float val ) {
    float fixNeg = val < 0.0 ? -1.0 : 1.0;
    return fixNeg * pow( fixNeg * val, 1.0 / 3.0 );
  }

  vec2 getPos( float t ) {
    float a = ( 1.0 - t ) * ( 1.0 - t );
    float b = 2.0 * t * ( 1.0 - t );
    float c = t * t;

    return a * P0 + b * P1 + c * P2;
  }

  // See: https://blog.gludion.com/2009/08/distance-to-quadratic-bezier-curve.html
  void main() {
    vec2 A = P1 - P0;
    vec2 B = P2 - P1 - A;

    vec2 MP = P0 - v_pos;

    float a1 = dot( B, B );
    float b = 3.0 * dot( A, B );
    float c = 2.0 * dot( A, A ) + dot( MP, B );
    float d = dot( MP, A );

    float a = b / a1;
    b = c / a1;
    c = d / a1;

    float p = -( a * a / 3.0 ) + b;
    float q = ( 2.0 / 27.0 ) * a * a * a  - ( a * b / 3.0 ) + c;
    float disc = q * q + 4.0 * p * p * p / 27.0;
    float offset = -a / 3.0;
    
    float root = 0.0;
    float dist = 0.0;
    // vec3 color;


    if ( disc > 0.0 ) {
      float u = cubeRoot( ( -q + sqrt( disc ) ) / 2.0 );
      float v = cubeRoot( ( -q - sqrt( disc ) ) / 2.0 );

      root = clamp( u + v + offset, 0.0, 1.0 );

      dist = distance( getPos( root ), v_pos );
      // color = vec3( 1.0, 0.0, 0.0 );
    }

    else if ( disc == 0.0 ) {
      float u = cubeRoot( -q / 2.0 );

      root = clamp( 2.0 * u + offset, 0.0, 1.0 );
      
      // TODO: wait, another root here? Need to do dist check loop here too?
      //       seems like we never really hit this case anyway...
      root = clamp( -u + offset, 0.0, 1.0 );

      dist = distance( getPos( root ), v_pos );

      // color = vec3( 0.0, 1.0, 0.0 );
    }

    else {
      float u = 2.0 * sqrt( -p / 3.0 );
      float v = acos( -sqrt( -27.0 / ( p * p * p ) ) * q / 2.0 ) / 3.0;

      
      for ( float i = 0.0; i <= 4.0; i += 2.0 ) {
        float testRoot = clamp( u * cos( v + i * PI / 3.0 ) + offset, 0.0, 1.0 );
        float testDist = distance( getPos( testRoot ), v_pos );

        if ( i == 0.0 || testDist < dist ) {
          root = testRoot;
          dist = testDist;
        }
      }

      // color = vec3( 0.0, 0.0, 1.0 );
    }


    float width = endWidth + ( 1.0 - root ) * ( startWidth - endWidth );
    
    if ( dist < width ) {
      outColor = vec4( mix( vec3( 0.0 ), color, cos( PI / 2.0 * dist / width ) ), 1.0 );
    }
    else if ( dist < width + strokeWidth ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

export const CommonAttributes = [ 'vertexPosition' ];
export const CommonUniforms = [ 'mvp', 'color', 'strokeWidth' ];

export const SquarePoints = [
  0.5,  0.5, 
 -0.5,  0.5, 
  0.5, -0.5, 
 -0.5, -0.5,
];

export const ShaderInfo = {
  Circle: {
    id: 'Circle',
    vertexShader: CommonVertexShader,
    fragmentShader: circleFrag,
    attributes: CommonAttributes,
    uniforms: CommonUniforms,
    points: SquarePoints,
  },
  RoundRect: {
    id: 'RoundRect',
    vertexShader: CommonVertexShader,
    fragmentShader: roundRectFrag,
    attributes: CommonAttributes,
    uniforms: CommonUniforms,
    points: SquarePoints,
  },
  Triangle: {
    id: 'Triangle',
    vertexShader: CommonVertexShader,
    fragmentShader: triangleFrag,
    attributes: CommonAttributes,
    uniforms: CommonUniforms,
    points: [
      0,  0,
      1, -1,
      1,  1,
    ],
  },
  QuadraticBezierFrag: {
    id: 'QuadraticBezierFrag',
    vertexShader: CommonVertexShader,
    fragmentShader: quadraticBezierFrag,
    attributes: CommonAttributes,
    uniforms: CommonUniforms.concat( 'P0', 'P1', 'P2', 'startWidth', 'endWidth' ),
    points: SquarePoints,     // NOTE: If we do this, need to put everything in terms of -0.5 - 0.5
  }
};

// TODO: Make file for Frog drawing code, do everything non-bezier for now just to get it running
//       For limbs, use SquarePoints and offset by 0.5,0.5 to get to each quadrent
//       Adjust the ABC points to be in -0.5 - 0.5 range

export function getShader( gl, shaderInfo ) {
  gl.shaders ??= new Map();

  if ( !gl.shaders.has( shaderInfo.id ) )
  {
    const program = initShaderProgram( gl, shaderInfo.vertexShader, shaderInfo.fragmentShader );
    
    const attribLocations = {};
    shaderInfo.attributes.forEach( attribName => 
      attribLocations[ attribName ] = gl.getAttribLocation( program, attribName ) 
    );
    
    const uniformLocations = {};
    shaderInfo.uniforms.forEach( uniformName => 
      uniformLocations[ uniformName ] = gl.getUniformLocation( program, uniformName ) 
    );
    
    gl.shaders.set( shaderInfo.id, {
      program: program,
      attribLocations: attribLocations,
      uniformLocations: uniformLocations,
      buffer: initBuffer( gl, shaderInfo.points ),
      bufferLength: shaderInfo.points.length / 2,
    } );
  }

  return gl.shaders.get( shaderInfo.id );
}

export function drawShader( gl, shaderInfo, uniforms ) {

  const shader = getShader( gl, shaderInfo );

  gl.useProgram( shader.program );

  gl.uniformMatrix4fv( shader.uniformLocations.mvp, false, uniforms.mvp );

  // const sx = Math.hypot( uniforms.mvp[ 0 ], uniforms.mvp[ 4 ], uniforms.mvp[ 8 ] );
  // const sy = Math.hypot( uniforms.mvp[ 1 ], uniforms.mvp[ 5 ], uniforms.mvp[ 9 ] );

  // console.log( 'sx = ' + sx );
  // console.log( 'sy = ' + sy );

  // gl.uniform1f( shader.uniformLocations.strokeWidth, 0.05 / Math.max( sx, sy ) );


  gl.uniform3fv( shader.uniformLocations.color, uniforms.color );
  gl.uniform1f( shader.uniformLocations.strokeWidth, uniforms.strokeWidth );

  drawPoints( gl, shader );
}

export function drawPoints( gl, shader ) {
  gl.bindBuffer( gl.ARRAY_BUFFER, shader.buffer );
  gl.vertexAttribPointer( shader.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( shader.attribLocations.vertexPosition );

  gl.drawArrays( gl.TRIANGLE_STRIP, 0, shader.bufferLength );
}

function initShaderProgram( gl, vsSource, fsSource ) {
  const vertexShader = loadShader( gl, gl.VERTEX_SHADER, vsSource );
  const fragmentShader = loadShader( gl, gl.FRAGMENT_SHADER, fsSource );

  const shaderProgram = gl.createProgram();
  gl.attachShader( shaderProgram, vertexShader );
  gl.attachShader( shaderProgram, fragmentShader );
  gl.linkProgram( shaderProgram );

  if ( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) ) {
    alert( `Unable to initialize the shader program: ${ gl.getProgramInfoLog( shaderProgram ) }` );
    return null;
  }
  else {
    return shaderProgram;
  }
}

function loadShader( gl, type, source ) {
  const shader = gl.createShader( type );

  gl.shaderSource( shader, source );
  gl.compileShader( shader );

  if ( !gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
    const errorMsg = gl.getShaderInfoLog( shader );

    const errorMatches = /ERROR: 0:(\d+)/.exec( errorMsg );
    if ( errorMatches ) {
      const errorLine = parseInt( errorMatches[ 1 ] );

      const sourceLines = gl.getShaderSource( shader ).split( '\n' );
      const outLines = [];

      const from = Math.max( errorLine - 3, 0 );
      const to   = Math.min( errorLine + 3, sourceLines.length );
      for ( let i = from; i < to; i ++ ) {
        const line = i + 1;
        outLines.push( `${ line == errorLine ? '>' : ' ' }${ line }: ${ sourceLines[ i ] }` );
      }

      alert( 'An error occurred compiling the shaders:\n' + errorMsg + '\n' + outLines.join( '\n' ) );
    }    

    gl.deleteShader( shader );
    return null;
  }
  else {
    return shader;
  }
}

function initBuffer( gl, positions ) {
  const buffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( positions ), gl.STATIC_DRAW );
  return buffer;
}