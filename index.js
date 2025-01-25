import * as THREE from './three.js-master/build/three.module.js';
import { VRButton } from './three.js-master/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from './three.js-master/examples/jsm/loaders/EXRLoader.js';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up VR support with WebXR  
document.body.appendChild(VRButton.createButton(renderer));

// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White directional light
directionalLight.position.set(5, 5, 5); // Position the light to illuminate the scene
scene.add(directionalLight);

// Load the EXR sky background
const exrLoader = new EXRLoader();
exrLoader.load('assets/kloofendal_48d_partly_cloudy_puresky_4k.exr', (texture) => {
    texture.mapping = THREE.EquirectangularRefractionMapping;
    texture.encoding = THREE.RGBEEncoding; // Make sure the texture encoding is set correctly
    texture.needsUpdate = true; // Ensure the texture is updated

    // Optional: Apply a tone mapping or exposure correction
    const exposure = 1.0; // Adjust exposure if needed
    texture.exposure = exposure;

    scene.background = texture;
    scene.environment = texture;
});

// Load the GLTF model
const loader = new GLTFLoader();
let eagleModel;

loader.load(
    'assets/eagle.glb', // Path to the model
    (gltf) => {
        eagleModel = gltf.scene; // Store the loaded model
        scene.add(eagleModel); // Add the model to the scene

        // Center the model by adjusting its position (bring it closer)
        eagleModel.position.set(0, 0, -2); // Bring it closer (z = -2)

        // Scale the model if needed
        eagleModel.scale.set(0.5, 0.5, 0.5); // Scale the model

        // Optionally, you can adjust the rotation of the model if you want it facing a particular way
        eagleModel.rotation.set(0, Math.PI, 0); // This will face the model toward the camera (optional)
    },
    undefined, // Optional progress function
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);


// Animation loop
function animate() {
    renderer.setAnimationLoop(animate); // Use setAnimationLoop for VR
    if (eagleModel) {
        eagleModel.rotation.x += 0.01;
        eagleModel.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
