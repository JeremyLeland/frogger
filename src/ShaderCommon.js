export const CommonVertexShader = /*glsl*/`# version 300 es
  in vec4 vertexPosition;

  uniform mat4 mvp;

  out vec2 v_pos;

  void main() {
    gl_Position = mvp * vertexPosition;
    v_pos = vertexPosition.xy;
  }
`;

export const FragCommon = /*glsl*/ `# version 300 es
  precision mediump float;

  #define PI 3.14159265359

  in vec2 v_pos;

  uniform vec3 color;
  uniform float strokeWidth;    // TODO: Get this from mvp scale component

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