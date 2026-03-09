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

// AJOUT : Stockage des objets pour la détection de collision et de clic
const objects = [];

for (let x = -10; x < 10; x++) {
    for (let z = -10; z < 10; z++) {
        // AJOUT : Génération de relief basique au lieu de tout mettre à Y=0
        const height = Math.floor(Math.sin(x / 3) * Math.cos(z / 3) * 2);
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, height, z); // Application du relief ici
        scene.add(cube);
        
        // AJOUT : On ajoute le cube à la liste des objets interactifs
        objects.push(cube); 
    }
}

camera.position.y = 5; // On démarre un peu plus haut pour ne pas être coincé dans le relief

// AJOUT : 4.5 Système de casse et pose de blocs
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0); // Toujours viser le centre de l'écran

document.addEventListener('mousedown', (event) => {
    if (!controls.isLocked) return;

    raycaster.setFromCamera(center, camera);
    const intersects = raycaster.intersectObjects(objects, false);

    if (intersects.length > 0) {
        const intersect = intersects[0];

        // Clic gauche (0) : Casser le bloc
        if (event.button === 0) {
            scene.remove(intersect.object);
            objects.splice(objects.indexOf(intersect.object), 1);
        }
        // Clic droit (2) : Poser un bloc
        else if (event.button === 2) {
            const voxel = new THREE.Mesh(geometry, material);
            // On se place sur la face touchée
            voxel.position.copy(intersect.point).add(intersect.face.normal);
            voxel.position.floor().addScalar(0.5); // On aligne sur la grille de cubes
            scene.add(voxel);
            objects.push(voxel);
        }
    }
});

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
        
        // AJOUT : Gravité pour simuler la chute
        velocity.y -= 9.8 * 10.0 * delta; 

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
        
        // AJOUT : Application de la vitesse Y et d'un sol invisible basique
        controls.getObject().position.y += (velocity.y * delta);
        if (controls.getObject().position.y < 2) {
            velocity.y = 0;
            controls.getObject().position.y = 2; // Bloque la chute à Y=2
        }

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
