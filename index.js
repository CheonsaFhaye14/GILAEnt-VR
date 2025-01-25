import * as THREE from './three.js-master/build/three.module.js';
import { VRButton } from './three.js-master/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from './three.js-master/examples/jsm/loaders/EXRLoader.js';

// Create the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
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
    texture.encoding = THREE.RGBEEncoding; // Ensure correct texture encoding
    texture.needsUpdate = true; // Update the texture

    scene.background = texture;
    scene.environment = texture;
});

// Load the GLTF model
const loader = new GLTFLoader();
let eagleModel;
let moveTowardsCamera = true; // Flag to control movement direction
let startPosition = { x: 0, y: 0, z: -5 }; // Initial position of the model

// Parameters for the circular motion
let radius = 5; // Radius for the circular motion
let angle = 0; // Angle for the circular motion
let speed = 0.02; // Speed of the circular motion

loader.load(
    'assets/eagle.glb', // Path to the model
    (gltf) => {
        eagleModel = gltf.scene; // Store the loaded model
        scene.add(eagleModel); // Add the model to the scene

        // Center the model and make it closer
        eagleModel.position.set(startPosition.x, startPosition.y, startPosition.z); // Initial position

        // Scale the model if needed
        eagleModel.scale.set(0.9, 0.9, 0.9); // Scale the model

        // Change the color of the eagle to red
        eagleModel.traverse((child) => {
            if (child.isMesh) {
                child.material.color.set(0xff0000); // Set the color to red (hex code)
            }
        });
    },
    undefined, // Optional progress function
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

// Animation loop
function animate() {
    renderer.setAnimationLoop(animate); // Use setAnimationLoop for VR (this enables VR interaction)

    if (eagleModel) {
        // Move the eagle model towards the camera
        if (moveTowardsCamera) {
            if (eagleModel.position.z < 0) { // Move towards the camera
                eagleModel.position.z += 0.05;
            } else {
                moveTowardsCamera = false; // Once it reaches the camera, change direction
            }
        }

        // Circular motion when moving behind the camera
        if (!moveTowardsCamera) {
            // Increment angle for circular motion
            angle += speed;
            if (angle > Math.PI * 2) {  // Once full circle is completed, reset the angle
                angle = 0;
            }

            // Update the model's position to circle around the camera
            eagleModel.position.x = radius * Math.cos(angle);  // X position in the circle
            eagleModel.position.z = radius * Math.sin(angle);  // Z position in the circle

            // Keep the model at the same height (no vertical motion)
            eagleModel.position.y = startPosition.y;

            // Make the eagle face the center (camera) while circling
            eagleModel.lookAt(camera.position);
        }
    }

    // WebXR camera movement handling (head tracking)
    if (renderer.xr.isPresenting) {
        // Adjust camera movement here if needed for VR mode
        // The camera automatically moves with the user's head, so you can focus on interactions
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
