// WebGi Ring Viewer - JavaScript version
import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSAOPlugin,
    GroundPlugin,
    FrameFadePlugin,
    DiamondPlugin,
    BloomPlugin,
    TemporalAAPlugin,
    RandomizedDirectionalLightPlugin,
    AssetImporter,
    Color
} from "../../node_modules/webgi/dist/index.js";

let viewer;
let ring;
let silver;
let gold;
let diamondObjects = [];
const ringModels = [
    '../../public/models/nhanAnhKhanhLam.glb',
    '../../public/models/nhanBac.glb',
    '../../public/models/nhanPremium.glb',
    '../../public/models/nhanVang.glb',
    '../../public/models/ring_webgi.glb'
];
let currentRingModel = 0;
let autoRotateEnabled = false;

const diamondsObjectNames = [
    'diamonds', 'diamonds001', 'diamonds002', 'diamonds003', 'diamonds004', 'diamonds005'
];

const diamondsObjectNames2 = ['Object'];

async function setupViewer() {
    const canvas = document.getElementById('webgi-canvas');
    viewer = new ViewerApp({
        canvas,
        useGBufferDepth: true,
        isAntialiased: false
    });

    viewer.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 2);

    const manager = await viewer.addPlugin(AssetManagerPlugin);
    const camera = viewer.scene.activeCamera;

    // Thêm plugins để tạo hiệu ứng đẹp
    await viewer.addPlugin(GBufferPlugin);
    await viewer.addPlugin(new ProgressivePlugin(32));
    await viewer.addPlugin(new TonemapPlugin(true, false,
        [
            `vec4 vignette(vec4 color, vec2 uv, float offset, float darkness){
                uv = ( uv - vec2( 0.5 ) ) * vec2( offset );
                return vec4( mix( color.rgb, vec3( 0.17, 0.00, 0.09 ) ), color.a );
            }`,
            `gl_FragColor = vignette(gl_FragColor, vUv, 1.1, 0.8);`
        ])
    );
    
    const ssao = await viewer.addPlugin(SSAOPlugin);
    await viewer.addPlugin(FrameFadePlugin);
    await viewer.addPlugin(GroundPlugin);
    const bloom = await viewer.addPlugin(BloomPlugin);
    await viewer.addPlugin(TemporalAAPlugin);
    await viewer.addPlugin(DiamondPlugin);
    await viewer.addPlugin(RandomizedDirectionalLightPlugin, false);

    // Thiết lập background đẹp với gradient
    viewer.setBackground(new Color('#EEB7B5').convertSRGBToLinear());

    // Cấu hình plugins để tạo hiệu ứng lấp lánh
    bloom.pass.passObject.bloomIterations = 2;
    bloom.pass.passObject.bloomRadius = 0.8;
    bloom.pass.passObject.bloomStrength = 1.2;
    ssao.passes.ssao.passObject.material.defines.NUM_SAMPLES = 4;

    // Loader events
    const importer = manager.importer;
    const loader = document.getElementById('loader');
    const progressBar = document.getElementById('progress-bar');

    importer.addEventListener("onProgress", (ev) => {
        const progressRatio = ev.loaded / ev.total;
        progressBar.style.transform = `scaleX(${progressRatio})`;
    });

    importer.addEventListener("onLoad", () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            startAnimation();
        }, 1000);
    });

    // Load mô hình nhẫn đầu tiên
    await loadRingModel(ringModels[4]); // Start with ring_webgi.glb

    // Thiết lập camera controls
    if (camera.controls) {
        camera.controls.enabled = true;
        camera.controls.enableDamping = true;
        camera.controls.dampingFactor = 0.1;
        camera.controls.minDistance = 3;
        camera.controls.maxDistance = 15;
        camera.controls.autoRotate = false;
        camera.controls.autoRotateSpeed = 1.0;
    }

    setupControls();
    viewer.renderer.refreshPipeline();
}

async function loadRingModel(path) {
    const manager = viewer.getPlugin(AssetManagerPlugin);
    
    // Xóa model cũ nếu có
    if (viewer.scene.modelRoot.children.length > 0) {
        viewer.scene.removeSceneModels();
    }
    
    await manager.addFromPath(path);

    // Tìm các object trong scene
    ring = viewer.scene.findObjectsByName('Scene')[0] || viewer.scene.findObjectsByName('Scene_1')[0];
    silver = viewer.scene.findObjectsByName('silver')[0] || viewer.scene.findObjectsByName('alliance')[0];
    gold = viewer.scene.findObjectsByName('gold')[0] || viewer.scene.findObjectsByName('entourage')[0];
    
    diamondObjects = [];
    for (const name of diamondsObjectNames) {
        const obj = viewer.scene.findObjectsByName(name)[0];
        if (obj) diamondObjects.push(obj);
    }

    // Fallback cho các tên object khác
    if (diamondObjects.length === 0) {
        for (const name of diamondsObjectNames2) {
            const obj = viewer.scene.findObjectsByName(name)[0];
            if (obj) diamondObjects.push(obj);
        }
    }

    // Log để debug
    console.log('🔍 Ring objects found:');
    console.log('Ring:', ring);
    console.log('Silver:', silver);
    console.log('Gold:', gold);
    console.log('Diamonds:', diamondObjects);

    // Tăng cường hiệu ứng cho kim cương
    enhanceDiamonds();
}

function enhanceDiamonds() {
    diamondObjects.forEach(diamond => {
        if (diamond && diamond.material) {
            diamond.material.metalness = 0.1;
            diamond.material.roughness = 0.02;
            diamond.material.clearcoat = 1.0;
            diamond.material.clearcoatRoughness = 0.0;
            diamond.userData.originalColor = diamond.material.color.clone();
        }
    });
}

function startAnimation() {
    const camera = viewer.scene.activeCamera;
    
    const initialPosition = { x: 5, y: 2, z: 8 };
    const finalPosition = { x: 1.28, y: -1.7, z: 5.86 };
    const initialTarget = { x: 2.5, y: -0.07, z: -0.1 };
    const finalTarget = { x: 0.91, y: 0.03, z: -0.25 };
    
    camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
    camera.target.set(initialTarget.x, initialTarget.y, initialTarget.z);
    
    const duration = 4000;
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        
        camera.position.x = initialPosition.x + (finalPosition.x - initialPosition.x) * eased;
        camera.position.y = initialPosition.y + (finalPosition.y - initialPosition.y) * eased;
        camera.position.z = initialPosition.z + (finalPosition.z - initialPosition.z) * eased;
        
        camera.target.x = initialTarget.x + (finalTarget.x - initialTarget.x) * eased;
        camera.target.y = initialTarget.y + (finalTarget.y - initialTarget.y) * eased;
        camera.target.z = initialTarget.z + (finalTarget.z - initialTarget.z) * eased;
        
        camera.positionUpdated(false);
        camera.targetUpdated(true);
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    
    animateCamera();
}

function setupControls() {
    const camera = viewer.scene.activeCamera;

    // Auto rotate toggle
    document.getElementById('autoRotate')?.addEventListener('click', () => {
        autoRotateEnabled = !autoRotateEnabled;
        if (camera.controls) {
            camera.controls.autoRotate = autoRotateEnabled;
        }
        const btn = document.getElementById('autoRotate');
        btn.textContent = autoRotateEnabled ? '⏸️ Tắt tự động xoay' : '🔄 Tự động xoay';
    });

    // Reset view
    document.getElementById('resetView')?.addEventListener('click', () => {
        if (camera.controls) {
            camera.position.set(1.28, -1.7, 5.86);
            camera.target.set(0.91, 0.03, -0.25);
            camera.positionUpdated(false);
            camera.targetUpdated(true);
        }
    });

    // Change ring
    document.getElementById('changeRing')?.addEventListener('click', async () => {
        const loader = document.getElementById('loader');
        loader.classList.remove('hidden');
        
        currentRingModel = (currentRingModel + 1) % ringModels.length;
        const path = ringModels[currentRingModel];
        
        try {
            await loadRingModel(path);
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1000);
        } catch (error) {
            console.error('Error loading ring model:', error);
            loader.classList.add('hidden');
        }
    });

    // Gem colors
    document.querySelectorAll('.gem-color').forEach(colorBtn => {
        colorBtn.addEventListener('click', () => {
            const color = colorBtn.dataset.color;
            changeDiamondColor(new Color(color));
            
            document.querySelectorAll('.gem-color').forEach(btn => {
                btn.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            });
            colorBtn.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        });
    });

    // Material colors
    document.querySelectorAll('.material-btn').forEach(materialBtn => {
        materialBtn.addEventListener('click', () => {
            const material = materialBtn.dataset.material;
            changeMaterialColor(material);
            
            document.querySelectorAll('.material-btn').forEach(btn => {
                btn.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            materialBtn.style.background = 'rgba(255, 255, 255, 0.4)';
        });
    });
}

function changeDiamondColor(color) {
    diamondObjects.forEach(diamond => {
        if (diamond && diamond.material) {
            diamond.material.color = color.convertSRGBToLinear();
        }
    });
}

function changeMaterialColor(materialType) {
    if (!silver || !gold) return;

    switch (materialType) {
        case 'default':
            if (silver) silver.material.color = new Color(0xfefefe).convertSRGBToLinear();
            if (gold) gold.material.color = new Color(0xe2bf7f).convertSRGBToLinear();
            break;
        case 'gold':
            if (silver) silver.material.color = new Color(0xe2bf7f).convertSRGBToLinear();
            if (gold) gold.material.color = new Color(0xe2bf7f).convertSRGBToLinear();
            break;
        case 'silver':
            if (silver) silver.material.color = new Color(0xfefefe).convertSRGBToLinear();
            if (gold) gold.material.color = new Color(0xfefefe).convertSRGBToLinear();
            break;
        case 'rose':
            if (silver) silver.material.color = new Color(0xfa8787).convertSRGBToLinear();
            if (gold) gold.material.color = new Color(0xfa8787).convertSRGBToLinear();
            break;
    }
}

// Tạo hiệu ứng lấp lánh liên tục cho kim cương
function createSparkleEffect() {
    setInterval(() => {
        diamondObjects.forEach((diamond, index) => {
            if (diamond && diamond.material) {
                const time = Date.now() * 0.001;
                const sparkle = Math.sin(time * 3 + index * Math.PI / 3) * 0.5 + 0.5;
                diamond.material.emissiveIntensity = sparkle * 0.2;
                
                const brightness = 0.9 + sparkle * 0.1;
                diamond.material.color.multiplyScalar(brightness);
            }
        });
    }, 50);
}

// Khởi động ứng dụng
setupViewer().then(() => {
    createSparkleEffect();
}).catch(error => {
    console.error('Error setting up WebGL viewer:', error);
    document.getElementById('loader').innerHTML = `
        <div class="loader-text">❌ Lỗi tải WebGL viewer</div>
        <p style="max-width: 400px; text-align: center; margin-top: 20px;">
            ${error.message}
        </p>
    `;
});