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
    Color,
    Mesh,
    BufferGeometry,
    MeshStandardMaterial2
} from "webgi";

let viewer: ViewerApp;
let ring: Mesh<BufferGeometry, MeshStandardMaterial2>;
let silver: Mesh<BufferGeometry, MeshStandardMaterial2>;
let gold: Mesh<BufferGeometry, MeshStandardMaterial2>;
let diamondObjects: any[] = [];
const ringModels = [
    './assets/nhanAnhKhanhLam.glb',
    './assets/nhanBacFloor.glb',
    './assets/nhanDaVuong.glb',
    './assets/nhanVang.glb'
];
let currentRingModel = 0;
let autoRotateEnabled = false;

const diamondsObjectNames = [
    'diamonds', 'diamonds001', 'diamonds002', 'diamonds003', 'diamonds004', 'diamonds005'
];

const diamondsObjectNames2 = ['Object'];

async function setupViewer() {
    const canvas = document.getElementById('webgi-canvas') as HTMLCanvasElement;
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
                return vec4( mix( color.rgb, vec3( 0.17, 0.00, 0.09 ), dot( uv, uv ) ), color.a );
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
    bloom!.pass!.passObject.bloomIterations = 2;
    bloom!.pass!.passObject.bloomRadius = 0.8;
    bloom!.pass!.passObject.bloomStrength = 1.2;
    ssao.passes.ssao.passObject.material.defines.NUM_SAMPLES = 4;

    // Loader events
    const importer = manager.importer as AssetImporter;
    const loader = document.getElementById('loader')!;
    const progressBar = document.getElementById('progress-bar')!;

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
    await loadRingModel("./assets/ring2_webgi3.glb");

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

async function loadRingModel(path: string) {
    const manager = viewer.getPlugin(AssetManagerPlugin)!;
    
    // Xóa model cũ nếu có
    if (viewer.scene.modelRoot.children.length > 0) {
        viewer.scene.removeSceneModels();
    }
    
    await manager.addFromPath(path);

    if (currentRingModel === 0) {
        ring = viewer.scene.findObjectsByName('Scene')[0] as any;
        silver = viewer.scene.findObjectsByName('silver')[0] as any;
        gold = viewer.scene.findObjectsByName('gold')[0] as any;
        
        diamondObjects = [];
        for (const name of diamondsObjectNames) {
            const obj = viewer.scene.findObjectsByName(name)[0];
            if (obj) diamondObjects.push(obj);
        }
    } else {
        ring = viewer.scene.findObjectsByName('Scene_1')[0] as any;
        silver = viewer.scene.findObjectsByName('alliance')[0] as any;
        gold = viewer.scene.findObjectsByName('entourage')[0] as any;
        
        diamondObjects = [];
        for (const name of diamondsObjectNames2) {
            const obj = viewer.scene.findObjectsByName(name)[0];
            if (obj) diamondObjects.push(obj);
        }
        
        if (ring) {
            ring.rotation.set(Math.PI/2, 0.92, 0);
        }
    }

    // Tăng cường hiệu ứng cho kim cương
    enhanceDiamonds();
}

function enhanceDiamonds() {
    diamondObjects.forEach(diamond => {
        if (diamond && diamond.material) {
            // Tăng độ phản xạ và giảm độ nhám để tạo hiệu ứng lấp lánh
            diamond.material.metalness = 0.1;
            diamond.material.roughness = 0.02;
            diamond.material.clearcoat = 1.0;
            diamond.material.clearcoatRoughness = 0.0;
            
            // Lưu màu gốc
            diamond.userData.originalColor = diamond.material.color.clone();
        }
    });
}

function startAnimation() {
    const camera = viewer.scene.activeCamera;
    
    // Thiết lập vị trí camera ban đầu cho animation đẹp
    const initialPosition = { x: 5, y: 2, z: 8 };
    const finalPosition = { x: 1.28, y: -1.7, z: 5.86 };
    const initialTarget = { x: 2.5, y: -0.07, z: -0.1 };
    const finalTarget = { x: 0.91, y: 0.03, z: -0.25 };
    
    camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
    camera.target.set(initialTarget.x, initialTarget.y, initialTarget.z);
    
    // Animation mượt mà với easing
    const duration = 4000;
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        // Animate position
        camera.position.x = initialPosition.x + (finalPosition.x - initialPosition.x) * eased;
        camera.position.y = initialPosition.y + (finalPosition.y - initialPosition.y) * eased;
        camera.position.z = initialPosition.z + (finalPosition.z - initialPosition.z) * eased;
        
        // Animate target
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
        const btn = document.getElementById('autoRotate')!;
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
        const loader = document.getElementById('loader')!;
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
            const color = (colorBtn as HTMLElement).dataset.color!;
            changeDiamondColor(new Color(color));
            
            // Visual feedback
            document.querySelectorAll('.gem-color').forEach(btn => {
                (btn as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.3)';
            });
            (colorBtn as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.8)';
        });
    });

    // Material colors
    document.querySelectorAll('.material-btn').forEach(materialBtn => {
        materialBtn.addEventListener('click', () => {
            const material = (materialBtn as HTMLElement).dataset.material!;
            changeMaterialColor(material);
            
            // Visual feedback
            document.querySelectorAll('.material-btn').forEach(btn => {
                (btn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
            });
            (materialBtn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.4)';
        });
    });
}

function changeDiamondColor(color: Color) {
    diamondObjects.forEach(diamond => {
        if (diamond && diamond.material) {
            diamond.material.color = color.convertSRGBToLinear();
        }
    });
}

function changeMaterialColor(materialType: string) {
    if (!silver || !gold) return;

    switch (materialType) {
        case 'default':
            silver.material.color = new Color(0xfefefe).convertSRGBToLinear();
            gold.material.color = new Color(0xe2bf7f).convertSRGBToLinear();
            break;
        case 'gold':
            silver.material.color = new Color(0xe2bf7f).convertSRGBToLinear();
            gold.material.color = new Color(0xe2bf7f).convertSRGBToLinear();
            break;
        case 'silver':
            silver.material.color = new Color(0xfefefe).convertSRGBToLinear();
            gold.material.color = new Color(0xfefefe).convertSRGBToLinear();
            break;
        case 'rose':
            silver.material.color = new Color(0xfa8787).convertSRGBToLinear();
            gold.material.color = new Color(0xfa8787).convertSRGBToLinear();
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
                
                // Tạo hiệu ứng thay đổi nhẹ về độ sáng
                const brightness = 0.9 + sparkle * 0.1;
                diamond.material.color.multiplyScalar(brightness);
            }
        });
    }, 50);
}

// Khởi động ứng dụng
setupViewer().then(() => {
    createSparkleEffect();
}).catch(console.error);