export const CommonVertexShader = /*glsl*/`# version 300 es
  in vec4 vertexPosition;

  uniform mat4 mvp;

  out vec2 v_pos;
  out float strokeWidth;

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

    float sx = length( mvp[ 0 ] );
    float sy = length( mvp[ 1 ] );
    float sz = length( mvp[ 2 ] );

    vec3 s = normalize( vec3( sx, sy, sz ) );
    
    strokeWidth = 0.1 / max( s.x, max( s.y, s.z ) );  // min? max?
  }
`;

export const FragCommon = /*glsl*/ `# version 300 es
  precision mediump float;

  #define PI 3.14159265359

  in vec2 v_pos;
  in float strokeWidth;    // TODO: Get this from mvp scale component

  uniform vec3 color;

  const vec3 BLACK = vec3( 0.0 );

  out vec4 outColor;
`;

const circleFrag = FragCommon + /*glsl*/ `
  void main() {
    float dist = distance( vec2( 0.0, 0.0 ), v_pos.xy );

    if ( dist < 0.5 - strokeWidth ) {
      outColor = vec4( mix( BLACK, color, cos( PI * dist ) ), 1.0 );
    }
    else if ( dist < 0.5 ) {
      outColor = vec4( BLACK, 1.0 );
    }
    else {
      discard;
    }
  }
`;

// TODO: Round rect...how does this handle scaling? Is radius a percentage?

const roundRectFrag = FragCommon + /*glsl*/ `
  // uniform float radius;
  const float radius = 0.3;

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
      outColor = vec4( mix( BLACK, color, cos( /* 1.1 * */ PI * dist ) ), 1.0 );
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
    vertexShader: CommonVertexShader,
    fragmentShader: circleFrag,
    attributes: CommonAttributes,
    uniforms: CommonUniforms,
    points: SquarePoints,
  },
  RoundRect: {
    vertexShader: CommonVertexShader,
    fragmentShader: roundRectFrag,
    attributes: CommonAttributes,
    uniforms: CommonUniforms,
    points: SquarePoints,
  },
  Triangle: {
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
};

export function getShader( gl, shaderInfo ) {
  const program = initShaderProgram( gl, shaderInfo.vertexShader, shaderInfo.fragmentShader );
  
  const attribLocations = {};
  shaderInfo.attributes.forEach( attribName => 
    attribLocations[ attribName ] = gl.getAttribLocation( program, attribName ) 
    );
    
  const uniformLocations = {};
  shaderInfo.uniforms.forEach( uniformName => 
    uniformLocations[ uniformName ] = gl.getUniformLocation( program, uniformName ) 
  );

  return {
    program: program,
    attribLocations: attribLocations,
    uniformLocations: uniformLocations,
    buffer: initBuffer( gl, shaderInfo.points ),
    bufferLength: shaderInfo.points.length / 2,
  }
}

export function drawShader( gl, shader, uniforms ) {
  gl.useProgram( shader.program );

  gl.uniformMatrix4fv( shader.uniformLocations.mvp, false, uniforms.mvp );

  const sx = Math.hypot( uniforms.mvp[ 0 ], uniforms.mvp[ 4 ], uniforms.mvp[ 8 ] );
  const sy = Math.hypot( uniforms.mvp[ 1 ], uniforms.mvp[ 5 ], uniforms.mvp[ 9 ] );

  console.log( 'sx = ' + sx );
  console.log( 'sy = ' + sy );

  gl.uniform3fv( shader.uniformLocations.color, uniforms.color );
  // gl.uniform1f( shader.uniformLocations.strokeWidth, uniforms.strokeWidth );

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
    alert( `An error occurred compiling the shaders: ${ gl.getShaderInfoLog( shader ) }` );
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