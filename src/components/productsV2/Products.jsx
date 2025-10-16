import { useEffect, useRef, useState } from 'react';
import './Products.css';
import LeftContainer from './LeftContainer';
import RightConfiguration from './RightConfiguration';
import MobileProductBar from './MobileProductBar';
import ViewAllProduct from '../viewAllProduct/ViewAllProduct';
import Contact from '../contactUs/ContactUs';
import OrderFormModal from './OrderFormModal';
import OrderSuccessModal from './OrderSuccessModal';


const Products = () => {
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentModelIndex, setCurrentModelIndex] = useState(0);
    const [showMobileBar, setShowMobileBar] = useState(true);
    const [models] = useState([
        { name: 'Ring WebGi', path: '/models/ring_webgi.glb' },
        { name: 'Ring WebGi 2', path: '/models/ring2_webgi.glb' },
        { name: 'Lumex Ring', path: '/models/lumex91.glb' },
        { name: 'Refine Mirror Ring', path: '/models/refine-mirror-ring.glb' },
        { name: 'Refine Mirror Ring 1', path: '/models/refine-mirror-ring-1.glb' },
        { name: 'Refine Mirror Ring 2', path: '/models/refine-mirror-ring-2.glb' }
    ]);

    // Modal states
    const [showOrderForm, setShowOrderForm] = useState(false);
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    // Product configuration state (shared with RightConfiguration)
    const [productConfig, setProductConfig] = useState({
        id: 'PRD000024', // Mirror Custom Ring product ID
        name: 'LUMINA OLIVIA 5',
        shape: 'Pear',
        metal: 'Yellow Gold',
        band: 'Single band',
        size: '6.0',
        quantity: 1,
        price: 15600
    });

    // useEffect(() => {
    //     const setupViewer = async () => {
    //         try {
    //             if (!canvasRef.current) return;

    //             // Wait a bit for canvas to be fully rendered
    //             await new Promise(resolve => setTimeout(resolve, 100));

    //             // Create WebGi viewer with proper configuration
    //             const viewer = new ViewerApp({
    //                 canvas: canvasRef.current,
    //                 useGBufferDepth: true,
    //                 isAntialiased: false
    //             });

    //             viewer.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 1);
    //             viewerRef.current = viewer;

    //             // Add asset manager
    //             const manager = await viewer.addPlugin(AssetManagerPlugin);
    //             const camera = viewer.scene.activeCamera;


    //             // Add all WebGi plugins
    //             await viewer.addPlugin(GBufferPlugin);
    //             await viewer.addPlugin(new ProgressivePlugin(32));
    //             await viewer.addPlugin(new TonemapPlugin(true));
    //             await viewer.addPlugin(SSAOPlugin);
    //             await viewer.addPlugin(FrameFadePlugin);
    //             await viewer.addPlugin(GroundPlugin);
    //             await viewer.addPlugin(BloomPlugin);
    //             await viewer.addPlugin(TemporalAAPlugin);

    //             // Set license key for DiamondPlugin (evaluation mode)
    //             try {
    //                 await viewer.addPlugin(DiamondPlugin);
    //                 console.log('✅ DiamondPlugin loaded successfully');
    //             } catch (error) {
    //                 console.warn('DiamondPlugin failed to load:', error);
    //             }

    //             await viewer.addPlugin(RandomizedDirectionalLightPlugin, false);

    //             // Set background
    //             viewer.setBackground(new Color('#ffffff').convertSRGBToLinear());


    //             const loadModel = async (modelIndex = 0) => {
    //                 if (modelIndex >= models.length) {
    //                     setError('All models failed to load');
    //                     setLoading(false);
    //                     return;
    //                 }

    //                 const currentModel = models[modelIndex];

    //                 try {
    //                     // Load the 3D model using WebGi
    //                     await manager.addFromPath(currentModel.path);


    //                     // Set current model index in state only for initial load
    //                     if (modelIndex === 0) {
    //                         setCurrentModelIndex(modelIndex);
    //                     }

    //                     // Setup jewelry camera controls
    //                     if (camera) {
    //                         camera.position.set(1.28, -1.7, 5.86);
    //                         camera.target.set(0.91, 0.03, -0.25);
    //                         camera.positionUpdated(false);
    //                         camera.targetUpdated(true);

    //                         // Setup controls for jewelry viewing
    //                         if (camera.controls) {
    //                             // Enable and configure basic controls
    //                             camera.controls.enabled = true;
    //                             camera.controls.enableDamping = true;
    //                             camera.controls.dampingFactor = 0.05;

    //                             // Zoom controls - prevent going behind background
    //                             camera.controls.enableZoom = true;
    //                             camera.controls.zoomSpeed = 0.8;
    //                             camera.controls.minDistance = 2.5;
    //                             camera.controls.maxDistance = 15;

    //                             // Rotation controls
    //                             camera.controls.enableRotate = true;
    //                             camera.controls.rotateSpeed = 0.5;
    //                             camera.controls.minPolarAngle = Math.PI * 0.1;
    //                             camera.controls.maxPolarAngle = Math.PI * 0.9;

    //                             // Pan controls - enable right-click drag
    //                             camera.controls.enablePan = true;
    //                             camera.controls.panSpeed = 1.0;

    //                             // Force update controls
    //                             camera.controls.update();
    //                         }

    //                         // Alternative: Set WebGi viewer controls directly
    //                         if (viewer.scene.cameraController) {
    //                             const controls = viewer.scene.cameraController;
    //                             controls.enabled = true;
    //                             controls.enableRotate = true;
    //                             controls.enablePan = true;
    //                             controls.enableZoom = true;
    //                             controls.minDistance = 2.5;
    //                             controls.maxDistance = 15;
    //                         }
    //                     }

    //                     // Refresh rendering pipeline
    //                     viewer.renderer.refreshPipeline();

    //                     setLoading(false);

    //                 } catch (err) {
    //                     await loadModel(modelIndex + 1);
    //                 }
    //             };

    //             await loadModel(0); // Always start with first model

    //         } catch (err) {
    //             console.error('❌ Error setting up viewer:', err);
    //             setError(err.message || 'Failed to load 3D model');
    //             setLoading(false);
    //         }
    //     };

    //     setupViewer();

    //     // Cleanup function
    //     return () => {
    //         if (viewerRef.current) {
    //             viewerRef.current.dispose();
    //             viewerRef.current = null;
    //         }
    //     };
    // }, []); // Only run once on mount

    // Handle scroll to show/hide MobileProductBar
    useEffect(() => {
        const handleScroll = () => {
            // Get products-container position
            const productsContainer = document.querySelector('.pv2-products-container');
            if (productsContainer) {
                const rect = productsContainer.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                // Show mobile bar if we're within products-container area
                // Hide mobile bar if we scrolled past products-container
                if (rect.bottom > 0 && rect.top < windowHeight) {
                    // We're within products-container viewport
                    setShowMobileBar(true);
                } else if (rect.bottom <= 0) {
                    // We've scrolled past products-container (into More Gems)
                    setShowMobileBar(false);
                } else {
                    // We're above products-container
                    setShowMobileBar(true);
                }
            }
        };

        // Call once on mount to check initial position
        handleScroll();

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Function to switch models
    // const switchModel = async (newModelIndex) => {
    //     if (newModelIndex === currentModelIndex || !viewerRef.current) return;

    //     setLoading(true);
    //     setError(null);

    //     try {
    //         const viewer = viewerRef.current;
    //         const manager = viewer.getPlugin(AssetManagerPlugin);
    //         const newModel = models[newModelIndex];


    //         // Clear previous models - remove all objects from scene
    //         if (viewer.scene && viewer.scene.children) {
    //             const modelsToRemove = [];
    //             viewer.scene.traverse((child) => {
    //                 if (child.isMesh || child.isGroup) {
    //                     modelsToRemove.push(child);
    //                 }
    //             });

    //             modelsToRemove.forEach((model) => {
    //                 if (model.parent) {
    //                     model.parent.remove(model);
    //                 }
    //                 if (model.geometry) {
    //                     model.geometry.dispose();
    //                 }
    //                 if (model.material) {
    //                     if (Array.isArray(model.material)) {
    //                         model.material.forEach(mat => mat.dispose());
    //                     } else {
    //                         model.material.dispose();
    //                     }
    //                 }
    //             });
    //         }

    //         // Alternative method: try manager's clear method as backup
    //         try {
    //             if (manager.models && manager.models.length > 0) {
    //                 await manager.clear();
    //             }
    //         } catch (managerClearError) {
    //             // Manager clear failed, continue
    //         }

    //         // Load new model
    //         await manager.addFromPath(newModel.path);


    //         // Update state
    //         setCurrentModelIndex(newModelIndex);
    //         setLoading(false);

    //         // Refresh rendering
    //         viewer.renderer.refreshPipeline();

    //     } catch (error) {
    //         setError(`Failed to load ${models[newModelIndex].name}`);
    //         setLoading(false);
    //     }
    // };

    // Order handlers
    const handleOrderNow = () => {
        setShowOrderForm(true);
    };

    const handleOrderSuccess = (order) => {
        setOrderDetails(order);
        setShowOrderForm(false);
        setShowOrderSuccess(true);
    };

    const handleCloseOrderForm = () => {
        setShowOrderForm(false);
    };

    const handleCloseOrderSuccess = () => {
        setShowOrderSuccess(false);
        setOrderDetails(null);
    };

    return (
        <>
            <div className="pv2-products-main-wrapper">
                <div className="pv2-products-container">
                    {/* Left side - LeftContainer chứa Section1 và Section2 */}
                    <LeftContainer />

                    {/* Right side - Configuration */}
                    <div className="pv2-products-right">
                        <RightConfiguration 
                            productConfig={productConfig}
                            setProductConfig={setProductConfig}
                            onOrderNow={handleOrderNow}
                        />
                    </div>
                </div>

                {/* View All Products Section */}
                <ViewAllProduct showViewProductButton={true} />

                {/* Contact Section */}
                <Contact />

                {/* Mobile Product Bar - Only visible on mobile */}
                <MobileProductBar isVisible={showMobileBar} />

                {/* Order Form Modal */}
                <OrderFormModal
                    isOpen={showOrderForm}
                    onClose={handleCloseOrderForm}
                    productDetails={productConfig}
                    onSuccess={handleOrderSuccess}
                />

                {/* Order Success Modal */}
                <OrderSuccessModal
                    isOpen={showOrderSuccess}
                    onClose={handleCloseOrderSuccess}
                    orderDetails={orderDetails}
                />
            </div>
        </>
    );
};

export default Products;