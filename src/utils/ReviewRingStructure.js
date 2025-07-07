import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('ring_model_test.glb', (gltf) => {
    console.log('Model structure:', gltf.scene);
    
    // Duyệt qua tất cả mesh để tìm band và head
    gltf.scene.traverse((child) => {
        if (child.isMesh) {
            console.log('Mesh name:', child.name);
            console.log('Geometry:', child.geometry);
        }
    });
});