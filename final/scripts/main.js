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
	mute_sfx_btn = docQ('#mute_sfx'),
	mute_bgm_btn = docQ('#mute_bgm'),
	free_controls = docQ('#free_controls'),
	modal_close = docQ('#modal_close'),
	bulletSpeed_input = docQ('#bulletSpeed'),
	reloadSpeed_input = docQ('#reloadSpeed'),
	moveSpeed_input = docQ('#moveSpeed'),
	rowSpeed_input = docQ('#rowSpeed'),
	intro_btn = docQ('#intro_btn'),
	cheats_btn = docQ('#cheats_btn');

// ===== Imports =====

import * as THREE from '../../node_modules/three/build/three.module.js';
import { OBJLoader } from '../../node_modules/three/examples/jsm/loaders/OBJLoader.js';

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
};
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

// Side Blinds
const leftBlind = newRect({ width: wallHeight, height: 20, px: -((wallWidth * wallCount) / 2) - 10, py: 0, pz: -145, rz: Math.PI / 2, color: '0095ff' });
const rightBlind = newRect({ width: wallHeight, height: 20, px: (wallWidth * wallCount) / 2 + 10, py: 0, pz: -145, rz: Math.PI / 2, color: '0095ff' });

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

// Ducks
let ducks = [];
const loaderObj = new OBJLoader();
for (let i = 0; i < 4; i++) {
	loaderObj.load('./assets/ducky.obj', (obj) => {
		setObjColor(obj, 0xffff00);
		const scale = 4;
		obj.scale.set(scale, scale, scale);
		obj.position.x = (35 * i) - 32;
		obj.position.y = btmShelfHeight;
		obj.position.z = -145;
		ducks[i] = obj;
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
}

// Target OBJ
let targets = [];
for (let i = 0; i < 4; i++) {
	loaderObj.load('./assets/target.obj', (obj) => {

		defaultTargetColor(obj);

		const scale = 6;
		obj.scale.set(scale, scale, scale);
		obj.position.x = (35 * i) - 50;
		obj.position.y = btmShelfHeight;
		obj.position.z = -145;

		targets[i] = obj;
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
}

function defaultTargetColor(obj) {
	setObjColor(obj.children[0], 0xffffff); // Center Ring, White
	setObjColor(obj.children[1], 0xff0000); // Wall, Red
}

function setCamDir(category) {
	const pLocal = new THREE.Vector3(0, 0, -1);
	const pWorld = pLocal.applyMatrix4(camera.matrixWorld);
	const dir = pWorld.sub(camera.position).normalize();
	camera[category] = dir;
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
		setCamDir('aimDir');
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
	if (loaderCount == 8) { // Every External OBJ loaded...
		start_btn.innerText = 'Start';
		start_btn.disabled = false;
		setCamDir('aimDir');
		start_btn.addEventListener('click', () => {
			start_btn.disabled = true;
			start_btn.hidden = true;
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
let evenFrame = true;
const animate = () => {
	requestAnimationFrame(animate);
	moveObjects();
	evenFrame = !evenFrame;
	evenFrame && detectCollision();
	!keyPause && keyboardListener();
	renderer.render(scene, camera);
};

let freeMove = false; // Default
let moveSpeed = .25;
function keyboardListener() {
	const
		p = camera.position,
		r = camera.rotation,
		key = (name) => { return keyboard.pressed(name); };

	// Space to Shoot
	key('space') && shootGun();

	// X and Y (Up, Down, Left, Right)
	key('w') && (p.y += moveSpeed * 2);
	key('a') && (p.x -= moveSpeed * 2);
	key('s') && (p.y -= moveSpeed * 2);
	key('d') && (p.x += moveSpeed * 2);

	// Rotate
	(key('left')) && (r.y += moveSpeed / 10);
	(key('right')) && (r.y -= moveSpeed / 10);

	if (freeMove) {
		// Z (Forward, Backwards)
		if (key('up')) {
			setCamDir('moveDir');
			for (let i = 0; i < moveSpeed; i++) {
				p.x += camera.moveDir.x;
				p.y += camera.moveDir.y;
				p.z += camera.moveDir.z;
			}
		}
		if (key('down')) {
			setCamDir('moveDir');
			for (let i = 0; i < moveSpeed; i++) {
				p.x -= camera.moveDir.x;
				p.y -= camera.moveDir.y;
				p.z -= camera.moveDir.z;
			}
		}
	}
}

let bulletSpeed = 8; // Default
let rowSpeed = .75; // Default
function moveObjects() {
	const
		rowRadius = (wallCount * wallWidth) / 2;

	for (let i = 0; i < bulletSpeed; i++) {
		bullet.position.x += camera.aimDir.x;
		bullet.position.y += camera.aimDir.y;
		bullet.position.z += camera.aimDir.z;
	}
	ducks.forEach(duck => {
		duck.position.x > -rowRadius - 3 ? (duck.position.x -= rowSpeed) : (duck.position.x = rowRadius + 3);
	});
	targets.forEach(target => {
		target.position.x > -rowRadius - 3 ? (target.position.x -= rowSpeed) : (target.position.x = rowRadius + 3);
	});
}

function detectCollision() {
	// The loop only works when there is the SAME amount of each category (ducks, targets)
	const bulletBnd = getBounds(bullet);
	for (let i = 0; i < ducks.length; i++) {
		// Duck Collision
		const duckBnd = getBounds(ducks[i]);
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
			// Flash red
			updateScore(-1, 'quack.mp3');
			setObjColor(ducks[i], 0xff0000);
		} else { // Default colors
			setObjColor(ducks[i], 0xffff00);
		}

		// Target Collision
		const
			tBnd = getBounds(targets[i]);
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
			// Invert colors
			setObjColor(targets[i].children[1], 0xffffff);
			setObjColor(targets[i].children[0], 0xff0000);
		} else { // Default colors
			defaultTargetColor(targets[i]);
		}
	}
}

// End Game
let endGameNotice = false; // Default (Hasn't shown yet)
function endGame() {
	!endGameNotice && toggleModal('#modal_endGame');
	endGameNotice = true;
}

// ===== Scoreboard =====

let score = 0; // Default
docQ('#score').innerText = 'Score: ' + score;
let scorePause = false; // Default
const updateScore = (n, sound) => {
	if (!scorePause) {
		scorePause = true;
		score < -6000 && endGame();
		sound && playSound(sound);
		score += n * 100;
		docQ('#score').innerText = 'Score: ' + score;
		setTimeout(() => {
			scorePause = false;
		}, reloadSpeed - 100); // reloadSpeed because that's how fast you can shoot = how fast u can score
	}
};

// ===== Sound =====

let mute_sfx = false; // Default
let mute_bgm = false; // Default
const
	storage = [],
	sounds = [
		'bgm.mp3',
		'quack.mp3',
		'ding.mp3',
		'gun.mp3',
	],
	playSound = (fileName) => {
		if (!mute_sfx) {
			const theSound = storage[sounds.indexOf(fileName)];
			const cloneSound = theSound.cloneNode();
			cloneSound.play();
		}
	},
	bgm = new Audio(`./assets/sounds/bgm.mp3`),
	playBgm = () => {
		bgm.loop = true;
		bgm.play();
	},
	toggleSfx = () => {
		mute_sfx = !mute_sfx;
	},
	toggleBgm = () => {
		mute_bgm = !mute_bgm;
		if (mute_bgm) {
			bgm.pause();
		} else {
			bgm.play();
		}
	};

sounds.forEach(sound => {
	// Store tracks
	storage.push(new Audio(`./assets/sounds/${sound}`));
});

mute_sfx_btn.addEventListener('click', toggleSfx);
mute_bgm_btn.addEventListener('click', toggleBgm);
free_controls && free_controls.addEventListener('click', () => {
	freeMove = !freeMove;
	if (freeMove) {
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

intro_btn.addEventListener('click', () => {
	toggleModal('#modal_intro');
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

// Walking Speed
moveSpeed_input.addEventListener('input', () => {
	moveSpeed_input.parentElement.querySelector('label[for="moveSpeed"]').innerText = moveSpeed_input.value + ' m/s';
	moveSpeed = moveSpeed_input.value;
});
moveSpeed_input.parentElement.querySelector('label[for="moveSpeed"]').innerText = moveSpeed + ' m/s';