import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// 1. Initialisation de la Scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Ciel bleu
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 3. Contrôles (PointerLock)
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

// 4. Création du Monde (Grille de cubes)
const boxSize = 1;
const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
const material = new THREE.MeshLambertMaterial({ color: 0x44aa44 }); // Vert herbe

for (let x = -10; x < 10; x++) {
    for (let z = -10; z < 10; z++) {
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, 0, z);
        scene.add(cube);
    }
}

camera.position.y = 2; // Hauteur des yeux

// 5. Gestion des mouvements
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

const onKeyDown = (event) => {
    switch (event.code) {
        case 'KeyW': case 'ArrowUp': moveForward = true; break;
        case 'KeyA': case 'ArrowLeft': moveLeft = true; break;
        case 'KeyS': case 'ArrowDown': moveBackward = true; break;
        case 'KeyD': case 'ArrowRight': moveRight = true; break;
    }
};

const onKeyUp = (event) => {
    switch (event.code) {
        case 'KeyW': case 'ArrowUp': moveForward = false; break;
        case 'KeyA': case 'ArrowLeft': moveLeft = false; break;
        case 'KeyS': case 'ArrowDown': moveBackward = false; break;
        case 'KeyD': case 'ArrowRight': moveRight = false; break;
    }
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// 6. Boucle d'animation
let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        prevTime = time;
    }

    renderer.render(scene, camera);
}

animate();

// Ajustement fenêtre
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});