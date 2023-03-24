import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { LightShadow } from 'three/src/lights/LightShadow';
import Stats from 'three/examples/jsm/libs/stats.module';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min';

let container;
let renderer;
let scene;
let camera;
let model;
let run;
let mixer;
let mouse;
let planeNormal;
let intersectionPoint;
let plane;
let raycaster;
let objectMouse = [];
let personRun;
let personStop;
let tween;
let samurai;

async function init() {
  container = document.querySelector('#app');

  //create scene
  scene = new THREE.Scene();

  const fov = 10;
  const aspect = window.innerWidth / window.innerHeight;
  const near = 0.1;
  const far = 10000;

  //camera
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);



  scene.add( camera );


  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild(renderer.domElement);

  const size = 10;
  const divisions = 10;

  // const gridHelper = new THREE.GridHelper( size, divisions );
  // scene.add( gridHelper );

  // const axesHelper = new THREE.AxesHelper( 5 );
  // scene.add( axesHelper );  

  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader(); 

  dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
  loader.setDRACOLoader( dracoLoader );

  loader.load('3d/house/LowPoly_JapaneseHouse_PBR.gltf', function (gltf) {
    model = gltf.scene;
    scene.add(model);
    // gltf.scene.traverse( function( node ) {
    //   console.log(node);
    // } );
  })

  loader.load('3d/avatar/avata.gltf', function (gltf) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    personStop = gltf.animations[0];
    personRun = gltf.animations[1];
    mixer.clipAction(personStop).play();
    run = gltf.scene;
    scene.add(run);
  })

  function runAvatar() {
    mixer.clipAction(personRun).play();
  }

  function stopAvatar() {
    mixer &&  mixer.clipAction(personRun).stop();
  }

  // const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
  //   hemiLight.position.set( 0, 50, 0 );
  // // Add hemisphere light to scene   
  // scene.add( hemiLight );

  const light = new THREE.AmbientLight( 0xffffff, 3 ); // soft white light
  scene.add( light );

  const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    // dirLight.position.set( -8, 12, 8 );
    dirLight.castShadow = true;
    // dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    // Add directional Light to scene    
    scene.add( dirLight );

  const orbit = new OrbitControls( camera, renderer.domElement );

  camera.position.z = 20;

  // mouse click

  mouse = new THREE.Vector2();
  planeNormal = new THREE.Vector3();
  intersectionPoint = new THREE.Vector3();
  plane = new THREE.Plane();
  raycaster = new THREE.Raycaster();

  window.addEventListener('mousemove', function(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera( mouse.clone(), camera );   

    objectMouse = raycaster.intersectObjects(scene.children);
    // planeNormal.copy(camera.position).normalize();
    // plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
    // raycaster.setFromCamera(mouse, camera);
    // raycaster.ray.intersectPlane(plane, intersectionPoint);
  })

  window.addEventListener('click', carPosition)

  function carPosition(e) {
    if (!run) return;
    if (objectMouse.length === 0) return;
    console.log(objectMouse);
    const timer = Math.sqrt(Math.pow(run.position.x - objectMouse[0].point.x, 2) + Math.pow(run.position.z - objectMouse[0].point.z, 2));
    tween && tween.stop();
    runAvatar();
    run.lookAt(objectMouse[0].point.x, 0, objectMouse[0].point.z );
    //  diagonalLine = Math.abs(Math.sqrt(Math.pow(2, Math.abs(intersectionPoint.x)) + Math.pow(2, Math.abs(intersectionPoint.z))) - Math.sqrt(Math.pow(2, Math.abs(model.position.x)) + Math.pow(2, Math.abs(model.position.z))));
    tween = new TWEEN.Tween(run.position)
    .to({ x: objectMouse[0].point.x, y: 0, z: objectMouse[0].point.z }, timer * 100)
    .start()
    .onComplete(function() {
      stopAvatar();
    });
  }

  const clock = new THREE.Clock();
  // ADD FPS
  const stats = Stats();
  container.appendChild(stats.dom);

  function animate() {
    requestAnimationFrame( animate );
    const delta = clock.getDelta();
    mixer && mixer.update(delta);
    orbit.update();
    TWEEN.update();
    renderer.render(scene, camera);
    stats.update();
  }

  animate();

  scene.background = new THREE.Color('#b3e5fc');
}

init();
