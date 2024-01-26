import * as THREE from '../lib/three.module.js';

const LEG_L = 0.45, LEG_W = 0.16;
const HEAD_SIZE = 0.3;
const SHELL_SIZE = 0.6;

const uniforms = {
};

const head = new THREE.Mesh(
  new THREE.PlaneGeometry( 1, 1 ),
  new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: /* glsl */ `
      out vec3 v_pos;

      void main() {
        v_pos = position;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: /* glsl */ `
      in vec3 v_pos;

      out vec3 outColor;

      void main() {
        float dist = distance( vec2( 0.0, 0.0 ), v_pos.xy );

        outColor = dist < 0.45 ? mix( vec3( 0.0, 0.5, 0.0 ), vec3( 0.0, 0.1, 0.0 ), dist / 0.5 ) : vec3( 0.0, 0.0, 0.0 );
        if ( dist > 0.5 ) {
          discard;
        }
      }
    `,
    glslVersion: THREE.GLSL3,
  } )
);

head.position.x = SHELL_SIZE / 2 + HEAD_SIZE / 3;
head.scale.set( HEAD_SIZE, HEAD_SIZE, 1 );

const legGeometry = new THREE.BufferGeometry().setFromPoints( [
  new THREE.Vector3( 0, 0, 0 ),
  new THREE.Vector3( 1, -0.5, 0 ),
  new THREE.Vector3( 1, 0.5, 0 ),
] );

const legMaterial = new THREE.ShaderMaterial( {
  uniforms: uniforms,
  vertexShader: /* glsl */ `
    out vec3 v_pos;

    void main() {
      v_pos = position;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: /* glsl */ `
    in vec3 v_pos;

    out vec3 outColor;

    void main() {
      float dist = 1.0 - v_pos.x + abs( v_pos.y * 2.0 );

      outColor = ( dist < 0.9 && v_pos.x < 0.96 ) ? mix( vec3( 0.0, 0.5, 0.0 ), vec3( 0.0, 0.1, 0.0 ), dist ) : vec3( 0.0, 0.0, 0.0 );
    }
  `,
  glslVersion: THREE.GLSL3,
} );

const legs = Array.from( Array( 4 ), _ => new THREE.Mesh( legGeometry, legMaterial ) );

legs[ 0 ].rotation.z = 0.25 * Math.PI;
legs[ 1 ].rotation.z = 0.75 * Math.PI;
legs[ 2 ].rotation.z = -0.25 * Math.PI;
legs[ 3 ].rotation.z = -0.75 * Math.PI;

legs.forEach( leg => leg.scale.set( LEG_L, LEG_W, 1 ) );

const shell = new THREE.Mesh(
  new THREE.PlaneGeometry( 1, 1 ),
  new THREE.ShaderMaterial( {
    uniforms: uniforms,
    vertexShader: /* glsl */ `
      out vec3 v_pos;

      void main() {
        v_pos = position;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    fragmentShader: /* glsl */ `
      in vec3 v_pos;

      out vec3 outColor;

      void main() {
        float dist = distance( vec2( 0.0, 0.0 ), v_pos.xy );

        outColor = dist < 0.45 ? mix( vec3( 0.4, 0.7, 0.4 ), vec3( 0.0, 0.2, 0.0 ), dist / 0.5 ) : vec3( 0.0, 0.0, 0.0 );
        if ( dist > 0.5 ) {
          discard;
        }
      }
    `,
    glslVersion: THREE.GLSL3,
  } )
);

shell.scale.set( SHELL_SIZE, SHELL_SIZE, 1 );

export const TurtleGroup = new THREE.Group();
TurtleGroup.add( head, ...legs, shell );
