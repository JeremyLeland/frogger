import * as THREE from '../lib/three.module.js';

export function meshDemo( mesh, updateFunc ) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000088 );

  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.set( 0, 0, 5 );

  scene.add( mesh );

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );

  const render = () => {
    camera.updateMatrixWorld();

    renderer.render( scene, camera );
  }

  document.body.appendChild( renderer.domElement );
  window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
  }
  window.onresize();

  if ( updateFunc ) {
    let lastTime;
    const animate = ( now ) => {
      lastTime ??= now;  // for first call only
      updateFunc( now - lastTime );
      lastTime = now;
  
      render();
  
      requestAnimationFrame( animate );
    };

    requestAnimationFrame( animate );
  }

  return render;
}