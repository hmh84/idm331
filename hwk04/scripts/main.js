const
  docQ = document.querySelector.bind(document),
  docQA = document.querySelectorAll.bind(document);

import * as THREE from '../node_modules/three/build/three.module.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
const myWorldObj = document.getElementById('myWorld');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00b7ff);

// Load background texture
// const loader = new THREE.TextureLoader();
// loader.load('https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg', function (texture) {
//   scene.background = texture;
// });

// Lighting
const ambLight = new THREE.AmbientLight(0x101010, 50);
scene.add(ambLight);

// Camera
const camera = new THREE.PerspectiveCamera(45, myWorldObj.scrollWidth / myWorldObj.scrollHeight, 1, 1000);
camera.position.z = -50;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});

renderer.setSize(myWorldObj.scrollWidth, myWorldObj.scrollHeight);
myWorldObj.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 0);

// Orbit Controls
function controlsRender() {
  renderer.render(scene, camera);
}

let controlsObj = new OrbitControls(camera, myWorldObj);
controlsObj.addEventListener('change', controlsRender);

// ===== Objects & Animation =====

const staticObjects = [
  {
    name: 'sun',
    x: 0,
    y: 0,
    z: 30
  }
]

function createSphere() {
  const geometry = new THREE.SphereGeometry(5, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xFF1111 });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
}

const planes = [
  // 1st row
  {
    name: '1_rightPlane',
    startPosZ: 775,
    startPosX: -30,
  },
  {
    name: '1_midLeftPlane',
    startPosZ: 750,
    startPosX: -15,
  },
  {
    name: '1_centerPlane',
    startPosZ: 725,
    startPosX: 0,
  },
  {
    name: '1_midRightPlane',
    startPosZ: 750,
    startPosX: 15,
  },
  {
    name: '1_rightPlane',
    startPosZ: 775,
    startPosX: 30,
  },
  // 2nd row
  {
    name: '2_midLeftPlane',
    startPosZ: 850,
    startPosX: -15,
  },
  {
    name: '2_centerPlane',
    startPosZ: 825,
    startPosX: 0,
  },
  {
    name: '2_midRightPlane',
    startPosZ: 850,
    startPosX: 15,
  },
]

let animateReady = false;
let i = 0;
planes.forEach(plane => {
  i++;
  let objRef;

  // Load a glTF resource
  const loaderObj = new GLTFLoader().setPath('./media/plane/');
  loaderObj.load(
    'scene.gltf',
    function (gltf) {
      objRef = gltf.scene;
      plane.ref = objRef;
      objRef.position.z = plane.startPosZ;
      objRef.position.x = plane.startPosX;
      objRef.position.y = 15; // Standard
      objRef.rotation.y = -45.5; // Standard
      scene.add(objRef);
    },
    // While loading is processing
    function (xhr) {
      const completion = Math.round(xhr.loaded / xhr.total * 100);
      completion >= 100 ? plane.complete = true : plane.complete = false;
      // Check if done
      if (i >= planes.length) {
        let cRate = 0;
        planes.forEach(plane => {
          plane.complete && cRate++;
          if (cRate == planes.length) {
            animateReady = true;
            return;
          }
        });
      }
    },
    // called if loading error
    function (error) {
      console.log('loaderObj ERROR: ', error);
    }
  );
});

let paused = true;
let mute = true;
const loadingModal = docQ('#loading');
const controlsModal = docQ('#controls');
const beginAnimBtn = docQ('#beginAnimBtn')

beginAnimBtn.addEventListener('click', () => {
  paused = false;
  loadingModal.hidden = true;
  controlsModal.hidden = false;
  mute = false;
  bgm.play();
});

const toggleAnimBtn = docQ('.toggleAnim');
toggleAnimBtn.addEventListener('click', () => {
  paused = !paused;
});

const animate = function () {
  requestAnimationFrame(animate);
  if (animateReady) {
    loadingModal.classList.add('ready');
    if (!paused) {
      planes.forEach(plane => {
        const objRef = plane.ref;
        if (objRef) {
          objRef.position.z <= (-1 * (plane.startPosZ / 2)) ? objRef.position.z = plane.startPosZ : objRef.position.z -= 1;
        }
      });
    }
    renderer.render(scene, camera);
  }
};
animate();

// Music

const bgm = new Audio(`../media/bgm.mp3`);
const toggleMusic = docQ('.toggleMusic');
toggleMusic.addEventListener('click', () => {
  mute ? bgm.play() : bgm.pause();
  mute = !mute;
});
