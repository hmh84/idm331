// ===== General =====

const
	docQ = document.querySelector.bind(document),
	docQA = document.querySelectorAll.bind(document),
	vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
	vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
	canvas = document.getElementById('canvas');

// ===== Page Elements =====

const
	modal_wrap = docQ('#modal_wrap'),
	start_btn = docQ('#start_btn'),
	mute_btn = docQ('#mute_btn'),
	free_controls = docQ('#free_controls'),
	modal_close = docQ('#modal_close'),
	bulletSpeed_input = docQ('#bulletSpeed'),
	reloadSpeed_input = docQ('#reloadSpeed'),
	rowSpeed_input = docQ('#rowSpeed'),
	cheats_btn = docQ('#cheats_btn');

// ===== Imports =====

import * as THREE from '../node_modules/three/build/three.module.js';
// import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../node_modules/three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

const keyboard = new THREEx.KeyboardState();

// ===== Scene =====

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0095ff);

// Lighting

const ambLight = new THREE.AmbientLight(0x101010, 50);
scene.add(ambLight);

// Camera

const camera = new THREE.PerspectiveCamera(45, vw / vh, 1, 1000);
camera.position.set(0, 0, 50);
camera.rotation.set(0, 0, 0);
// camera.position.set(-70, -5, -120);
// camera.rotation.set(0, -1.2, 0);

// document.addEventListener('mousemove', (e) => {
// 	const x = e.screenX;
// 	const y = e.screenY;
// 	const p = camera.position;
// 	p.x += (x / vw) - .5;
// 	p.y -= (y / vh) - .5;
// });

// Renderer

const renderer = new THREE.WebGLRenderer({
	antialias: true,
	alpha: true
});

renderer.setSize(vw, vh);
canvas.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 0);

// ===== Environment =====

// Back Wall
const newWall = (props) => {
	const
		planeMaterial = new THREE.MeshBasicMaterial({ color: Number('0x' + props.color), side: THREE.DoubleSide }),
		planeGeometry = new THREE.PlaneGeometry(props.width, props.height, 1, 1),
		plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.position.set(props.px || 0, props.py || 0, props.pz || 0);
	plane.rotation.set(props.tx || 0, props.ty || 0, props.tz || 0);
	plane.receiveShadow = true;
	scene.add(plane);
	return plane;
}
let walls = [];
const wallCount = 9;
const wallWidth = 15;
const wallHeight = 80;
for (let i = 0; i < wallCount; i++) {
	let color, px;
	i == 0 ? px = -(((wallCount * wallWidth) / 2) - (wallWidth / 2)) : px = walls[i - 1].position.x + wallWidth;
	i % 2 == 0 ? color = 'd84b4b' : color = 'ffffff';
	walls.push(newWall({ color: color, width: wallWidth, height: wallHeight, px: px, pz: -150 }));
}

// Shelves
function newRect(props) {
	const geometry = new THREE.BoxGeometry(props.width || 5, props.height || 5, props.depth || 10);
	const material = new THREE.MeshBasicMaterial({ color: Number('0x' + props.color) || 0x774d02 });
	const rect = new THREE.Mesh(geometry, material);
	rect.castShadow = true;
	rect.receiveShadow = true;
	rect.position.set(props.px || 0, props.py || 0, props.pz || 0);
	rect.rotation.set(props.rx || 0, props.ry || 0, props.rz || 0);
	scene.add(rect);
	return rect;
}

// Shelves
const topShelf = newRect({ width: wallCount * wallWidth, py: wallHeight / 6, pz: -145 });
const btmShelf = newRect({ width: wallCount * wallWidth, py: -(wallHeight / 6), pz: -145 });

// Frame
const topFrame = newRect({ width: wallCount * wallWidth, py: (wallHeight / 2) - 2.5, pz: -145 });
const btmFrame = newRect({ width: wallCount * wallWidth, py: -((wallHeight / 2) - 2.5), pz: -145 });
const leftFrame = newRect({ width: wallHeight, px: -((wallWidth * wallCount) / 2) + 2.5, py: 0, pz: -145, rz: Math.PI / 2 });
const rightFrame = newRect({ width: wallHeight, px: (wallWidth * wallCount) / 2 - 2.5, py: 0, pz: -145, rz: Math.PI / 2 });

// ===== Objects =====

let loaderCount = 0;

function setObjColor(obj, color) {
	obj.traverse(function (child) {
		if (child instanceof THREE.Mesh) {
			child.material.color.setHex(color);
		}
	});
}

function getBounds(obj) {
	if (obj.type == 'Mesh') { // THREE JS Objects
		if (obj.geometry.type == 'SphereGeometry') { // Spheres
			const
				params = obj.geometry.parameters,
				pos = obj.position,
				radius = Number((params.radius).toFixed(2)),
				diameter = radius * 2 || null;
			return {
				height: diameter,
				width: diameter,
				depth: diameter,
				x: pos.x - radius,
				y: pos.y - radius,
				z: pos.z - radius,
				radius: radius,
			};
		}
	} else if (obj.type == 'Group') { // External 3D Models
		// Add geometry
		const
			bBox = new THREE.Box3().setFromObject(obj).getSize(),
			pos = obj.position;

		const returnObj = {
			height: bBox.y,
			width: bBox.x,
			depth: bBox.z,
			x: pos.x - (bBox.x / 2),
			y: pos.y,
			z: pos.z,
		};
		return returnObj;
	}
}

const topShelfHeight = (topShelf.position.y + 2.5);
const btmShelfHeight = -(topShelf.position.y) + 2.5;

// Duck OBJ
let duck;
let duck2;
const loaderObj = new OBJLoader();
loaderObj.load('./assets/duckie.obj', (obj) => {
	// Duck #1
	duck = obj;
	setObjColor(duck, 0xffff00);
	const scale = 4;
	duck.scale.set(scale, scale, scale);
	duck.position.x = 15;
	duck.position.y = btmShelfHeight;
	duck.position.z = -145;
	scene.add(duck);
},
	(xhr) => {
		const completion = Math.round(xhr.loaded / xhr.total * 100);
		completion >= 100 ? readySet() : console.log('Progress: ' + completion);
	},
	(error) => {
		console.error('loaderObj ERROR: ', error);
	}
);

// Target OBJ
let target;
loaderObj.load('./assets/target.obj', (obj) => {
	target = obj;

	defaultTargetColor();

	const scale = 6;
	obj.scale.set(scale, scale, scale);
	obj.position.x = -10;
	obj.position.y = btmShelfHeight;
	obj.position.z = -145;

	scene.add(obj);
},
	(xhr) => {
		const completion = Math.round(xhr.loaded / xhr.total * 100);
		completion >= 100 ? readySet() : console.log('Progress: ' + completion);
	},
	(error) => {
		console.error('loaderObj ERROR: ', error);
	}
);

function defaultTargetColor() {
	setObjColor(target.children[0], 0xff0000);
	setObjColor(target.children[1], 0xff0000);
	setObjColor(target.children[2], 0xffffff);
	setObjColor(target.children[3], 0xff0000);
}

// Bullet
let bullet;
(async () => {
	const geometry = new THREE.SphereGeometry(.5, 32, 32);
	const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
	bullet = new THREE.Mesh(geometry, material);
	bullet.position.z = -1000;
	scene.add(bullet);
})();
let gunPause = false; // Default
let reloadSpeed = 750; // milliseconds
function shootGun() {
	if (!gunPause) {
		gunPause = true;
		bullet.position.x = camera.position.x;
		bullet.position.y = camera.position.y;
		bullet.position.z = camera.position.z;
		playSound('gun.mp3');
		setTimeout(() => {
			gunPause = false;
		}, reloadSpeed);
	}
}

// ===== Animation =====

function readySet() {
	loaderCount++;
	if (loaderCount == 2) { // Every OBJ loaded...
		start_btn.innerText = 'Start';
		start_btn.disabled = false;
		start_btn.addEventListener('click', () => {
			modal_wrap.style.backgroundColor = '#00000070';
			toggleModal('close');
			modal_wrap.addEventListener('click', () => {
				toggleModal('close');
			});
			animate();
			playBgm();
		});
	}
}

let keyPause = false;
const animate = () => {
	requestAnimationFrame(animate);
	detectCollision();
	moveObjects();
	!keyPause && keyboardListener();
	renderer.render(scene, camera);
};

window.devMode = false; // Default
function keyboardListener() {
	const
		p = camera.position,
		r = camera.rotation,
		moveSpeed = .25,
		key = (name) => { return keyboard.pressed(name); };

	key('space') && shootGun();
	if (devMode) {
		// Vertical
		key('w') && (p.y += moveSpeed * 2);
		key('s') && (p.y -= moveSpeed * 2);
		key('a') && (p.x -= moveSpeed * 2);
		key('d') && (p.x += moveSpeed * 2);

		// Table plane
		(key('up')) && (p.z -= moveSpeed * 2);
		(key('down')) && (p.z += moveSpeed * 2);
		(key('left')) && (p.x -= moveSpeed * 2);
		(key('right')) && (p.x += moveSpeed * 2);
		// Rotate
		(key('a')) && (r.y += moveSpeed / 10);
		(key('d')) && (r.y -= moveSpeed / 10);
	} else {
		key('w') && (p.y += moveSpeed);
		key('s') && (p.y -= moveSpeed);
		key('a') && (p.x -= moveSpeed);
		key('d') && (p.x += moveSpeed);
	}
}

let bulletSpeed = 10; // Default
let rowSpeed = .9; // Default
function moveObjects() {
	const
		rowRadius = (wallCount * wallWidth) / 2;

	bullet.position.z > -1000 && (bullet.position.z -= bulletSpeed); // Bullet motion
	duck.position.x > -rowRadius - 5 ? (duck.position.x -= rowSpeed) : (duck.position.x = rowRadius + 5);
	target.position.x > -rowRadius - 5 ? (target.position.x -= rowSpeed) : (target.position.x = rowRadius + 5);
}

function detectCollision() {
	// Duck Collision
	const
		bulletBnd = getBounds(bullet),
		duckBnd = getBounds(duck);
	if (
		// XY
		(duckBnd.x < bulletBnd.x + bulletBnd.width) &&
		(duckBnd.x + duckBnd.width > bulletBnd.x) &&
		(duckBnd.y < bulletBnd.y + bulletBnd.height) &&
		(duckBnd.y + duckBnd.height > bulletBnd.y) &&
		// ZX
		(duckBnd.z < bulletBnd.z + bulletBnd.width) &&
		(duckBnd.z + duckBnd.width > bulletBnd.z) &&
		(duckBnd.x < bulletBnd.x + bulletBnd.height) &&
		(duckBnd.x + duckBnd.height > bulletBnd.x) &&
		// ZY
		(duckBnd.z < bulletBnd.z + bulletBnd.width) &&
		(duckBnd.z + duckBnd.width > bulletBnd.z) &&
		(duckBnd.y < bulletBnd.y + bulletBnd.height) &&
		(duckBnd.y + duckBnd.height > bulletBnd.y)
	) { // Hit
		updateScore(-1, 'quack.mp3');
		setObjColor(duck, 0xff0000);
	} else { // Default
		setObjColor(duck, 0xffff00);
	}

	// Target Collision
	const
		tBnd = getBounds(target);
	if (
		// XY
		(bulletBnd.x < tBnd.x + tBnd.width) &&
		(bulletBnd.x + bulletBnd.width > tBnd.x) &&
		(bulletBnd.y < tBnd.y + tBnd.height) &&
		(bulletBnd.y + bulletBnd.height > tBnd.y) &&
		// ZX
		(bulletBnd.z < tBnd.z + tBnd.width) &&
		(bulletBnd.z + bulletBnd.width > tBnd.z) &&
		(bulletBnd.x < tBnd.x + tBnd.height) &&
		(bulletBnd.x + bulletBnd.height > tBnd.x) &&
		// ZY
		(bulletBnd.z < tBnd.z + tBnd.width) &&
		(duckBnd.z + bulletBnd.width > tBnd.z) &&
		(bulletBnd.y < tBnd.y + tBnd.height) &&
		(bulletBnd.y + bulletBnd.height > tBnd.y)
	) { // Hit
		updateScore(1, 'ding.mp3');
		setObjColor(target, 0xffffff);
	} else { // Default
		defaultTargetColor();
	}
}

// ===== Scoreboard =====

let score = 0; // Default
docQ('#score').innerText = 'Score: ' + score;
let scorePause = false; // Default
const updateScore = (n, sound) => {
	if (!scorePause) {
		sound && playSound(sound);
		scorePause = true;
		score += n * 100;
		docQ('#score').innerText = 'Score: ' + score;
		setTimeout(() => {
			scorePause = false;
		}, reloadSpeed - 100); // reloadSpeed because that's how fast you can shoot = how fast u can score
	}
}

// ===== Sound =====

let mute = false; // Default
const
	storage = [],
	sounds = [
		'bgm.mp3',
		'quack.mp3',
		'ding.mp3',
		'gun.mp3',
	],
	playSound = (fileName) => {
		if (!mute) {
			const theSound = storage[sounds.indexOf(fileName)];
			const cloneSound = theSound.cloneNode();
			cloneSound.play();
		}
	},
	bgm = new Audio(`./assets/sounds/bgm.mp3`),
	playBgm = () => {
		bgm.play();
	},
	toggleMute = () => {
		mute = !mute;
		if (mute) {
			mute_btn.innerText = 'Unmute';
			bgm.pause();
		} else {
			mute_btn.innerText = 'Mute';
			bgm.play();
		}
	};

sounds.forEach(sound => {
	// Store tracks
	storage.push(new Audio(`./assets/sounds/${sound}`));
});

mute_btn.addEventListener('click', toggleMute);
free_controls && free_controls.addEventListener('click', () => {
	devMode = !devMode;
	if (devMode) {
		free_controls.innerText = 'Normal Movement';
	} else {
		free_controls.innerText = 'Free Movement';
	}
});

// Prevent space key button presses
const allBtns = docQA('button');
allBtns.forEach(btn => {
	btn.addEventListener('focus', () => {
		btn.blur();
	});
});

// ===== Controls =====

const allModals = docQA('.modal');
function toggleModal(modalSelector) {
	if (modalSelector != 'close') {
		keyPause = true;
		modal_close.hidden = false;
		modal_wrap.hidden = false;
		allModals.forEach(modal => {
			modal != docQ(modalSelector) ? modal.hidden = true : modal.hidden = false;
		});
	} else {
		keyPause = false;
		modal_wrap.hidden = true;
		allModals.forEach(modal => {
			modal.hidden = true;
		});
	}
}

allModals.forEach(modal => {
	modal.addEventListener('click', (e) => {
		e.stopPropagation();
	});
});

modal_close.addEventListener('click', () => {
	toggleModal('close');
});

cheats_btn.addEventListener('click', () => {
	toggleModal('#modal_cheats');
});

// ===== Cheats =====

// Bullet Speed
bulletSpeed_input.addEventListener('input', () => {
	bulletSpeed_input.parentElement.querySelector('label[for="bulletSpeed"]').innerText = bulletSpeed_input.value + ' m/s';
	bulletSpeed = bulletSpeed_input.value;
});
bulletSpeed_input.parentElement.querySelector('label[for="bulletSpeed"]').innerText = bulletSpeed + ' m/s';

// Reload Speed
reloadSpeed_input.addEventListener('input', () => {
	reloadSpeed_input.parentElement.querySelector('label[for="reloadSpeed"]').innerText = reloadSpeed_input.value + ' ms';
	reloadSpeed = reloadSpeed_input.value;
});
reloadSpeed_input.parentElement.querySelector('label[for="reloadSpeed"]').innerText = reloadSpeed + ' ms';

// Row Speed
rowSpeed_input.addEventListener('input', () => {
	rowSpeed_input.parentElement.querySelector('label[for="rowSpeed"]').innerText = rowSpeed_input.value + ' m/s';
	rowSpeed = rowSpeed_input.value;
});
rowSpeed_input.parentElement.querySelector('label[for="rowSpeed"]').innerText = rowSpeed + ' m/s';