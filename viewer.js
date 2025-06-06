import * as THREE from 'https://unpkg.com/three@0.159.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.159.0/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'https://unpkg.com/three@0.159.0/examples/jsm/loaders/MTLLoader.js';

let scene, camera, renderer, controls, currentModel;

// Initialize the scene
function init() {
    try {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Create camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight - 80); // Account for controls height
        document.getElementById('viewer').appendChild(renderer.domElement);

        // Add orbit controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        // Start animation loop
        animate();

        console.log('3D viewer initialized successfully');
    } catch (error) {
        console.error('Error initializing 3D viewer:', error);
    }
}

// Load OBJ model with materials
async function loadModel(modelPath) {
    // Remove current model if exists
    if (currentModel) {
        scene.remove(currentModel);
    }

    try {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();
        const mtlPath = modelPath.replace('.obj', '.mtl');

        // Load materials first
        try {
            const materials = await mtlLoader.loadAsync(mtlPath);
            materials.preload();
            objLoader.setMaterials(materials);
        } catch (error) {
            console.warn('Failed to load materials, falling back to basic model:', error);
        }

        // Load the model
        const object = await objLoader.loadAsync(modelPath);
        currentModel = object;
        
        // Center the model
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        // Scale the model to fit the view
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        object.scale.multiplyScalar(scale);

        scene.add(object);
        console.log('Model loaded successfully');
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight - 80);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight - 80);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Initialize the viewer when the script loads
init();

// Handle model selection
document.getElementById('model-select').addEventListener('change', function(e) {
    if (e.target.value) {
        loadModel(e.target.value);
    }
}); 