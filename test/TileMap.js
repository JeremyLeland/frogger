import { mat4 } from '../lib/gl-matrix.js';
import * as ShaderCommon from '../src/ShaderCommon.js';

const mapFrag = /* glsl */ `# version 300 es
  precision mediump float;
  
  in vec2 v_pos;

  out vec4 outColor;

  const int SIZE = 15;

  uniform int tiles[ SIZE * SIZE ];
  uniform int layerIndex;

  const vec4[ 3 ] colors = vec4[ 3 ](
    vec4( 0.0, 0.0, 0.0, 1.0 ),
    vec4( 0.2, 0.2, 0.2, 1.0 ),
    vec4( 0.0, 0.5, 0.0, 1.0 )
  );

  void main() {

    vec2 mapPos = ( v_pos + 0.5 );

    int tile = tiles[ int( mapPos.x ) + int( mapPos.y ) * SIZE ];

    outColor = colors[ layerIndex ];

    vec2 fromCenter = fract( mapPos ) - vec2( 0.5 );
    vec2 neighborPos = mapPos + sign( fromCenter );

    if ( 0.0 < neighborPos.x && neighborPos.x < float( SIZE ) &&
          0.0 < neighborPos.y && neighborPos.y < float( SIZE ) ) {

      // TODO: Custom edges for grass?

      int neighbor_x = tiles[ int( neighborPos.x ) + int( mapPos.y ) * SIZE ];
      int neighbor_y = tiles[ int( mapPos.x ) + int( neighborPos.y ) * SIZE ];
      int neighbor_xy = tiles[ int( neighborPos.x ) + int( neighborPos.y ) * SIZE ];

      if ( tile >= layerIndex ) {
        if ( neighbor_x < layerIndex && neighbor_y < layerIndex && length( fromCenter ) > 0.5 ) {
          discard;
        }
      }
      else {
        if ( neighbor_x >= layerIndex && neighbor_y >= layerIndex && length( fromCenter ) < 0.5 ) {
          discard;
        }

        if ( neighbor_xy < layerIndex || neighbor_x < layerIndex || neighbor_y < layerIndex ) {
          discard;
        }
      }
    }
    else if ( tile < layerIndex ) {
      discard;
    }
  }
`;


const mapShaderInfo =  {
  vertexShader: ShaderCommon.CommonVertexShader,
  fragmentShader: mapFrag,
  attributes: ShaderCommon.CommonAttributes,
  uniforms: [ 'mvp', 'tiles', 'layerIndex' ],
  points: [
    14.5, 14.5, 
    -0.5, 14.5, 
    14.5, -0.5, 
    -0.5, -0.5,
  ],
};

export function drawTileMap( gl, mvp, tiles ) {
  const shader = ShaderCommon.getShader( gl, mapShaderInfo );
  gl.useProgram( shader.program );

  gl.uniformMatrix4fv( shader.uniformLocations.mvp, false, mvp );
  gl.uniform1iv( shader.uniformLocations.tiles, tiles );

  for ( let i = 1; i < 3; i ++ ) {
    gl.uniform1i( shader.uniformLocations.layerIndex, i );
    ShaderCommon.drawPoints( gl, shader );
  }
}