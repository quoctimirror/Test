import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import './IJewelTryOn.css';

const IJewelTryOn = () => {
    const { ringId } = useParams();
    const canvasRef = useRef(null);
    const viewerRef = useRef(null);
    const tryonRef = useRef(null);
    const [isARRunning, setIsARRunning] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Kiểm tra xem iJewel SDK đã được load chưa
        if (!window.webgi || !window.ij_vto) {
            setError('iJewel SDK chưa được load. Vui lòng kiểm tra lại script tags trong index.html');
            setLoading(false);
            return;
        }

        let viewer = null;
        let tryon = null;

        const init = async () => {
            try {
                setLoading(true);
                console.log('🚀 Initializing iJewel TryOn...');

                // Initialize the viewer
                viewer = new window.ViewerApp({
                    canvas: canvasRef.current
                });

                // Set the canvas scaling to 1.5 for sharper rendering
                viewer.renderer.displayCanvasScaling = 1.5;

                // Add and setup all necessary plugins
                await window.addBasePlugins(viewer);

                const diamondPlugin = await viewer.addPlugin(window.DiamondPlugin);
                diamondPlugin.setKey("LICENSE_KEY_FOR_IJEWEL_SDK");

                // Add the Ring Try-On Plugin
                tryon = await viewer.addPlugin(window.ij_vto.RingTryonPlugin);
                tryon.setKey("LICENSE_KEY_FOR_TRYON_SDK");

                // Add the Ring Try-On UI Plugin
                await viewer.addPlugin(window.ij_vto.RingTryonUIPlugin);

                viewer.renderEnabled = false;

                // Load HDR environment for proper lighting
                await viewer.setEnvironmentMap("/hdr/studio_small_03_4k.hdr");

                // Load the ring model and config
                await viewer.load("/models/rings/mirror-fiston.glb");
                await viewer.load("/fiston.json");

                // Setup scene lighting and materials
                const scene = viewer.scene;

                // Enhance environment lighting
                if (scene.environment) {
                    scene.environment.intensity = 1.5;
                }

                // Setup materials for all meshes in the model
                scene.traverse((object) => {
                    if (object.material) {
                        // Configure material properties for metal/gems
                        object.material.metalness = 0.9;
                        object.material.roughness = 0.1;
                        object.material.envMapIntensity = 1.5;

                        // If material has a color, ensure it's not pure black
                        if (object.material.color && object.material.color.r === 0 && object.material.color.g === 0 && object.material.color.b === 0) {
                            object.material.color.setRGB(0.8, 0.8, 0.8); // Set to light gray instead of black
                        }

                        object.material.needsUpdate = true;
                    }
                });

                viewer.renderEnabled = true;

                // Save references
                viewerRef.current = viewer;
                tryonRef.current = tryon;

                setLoading(false);
                console.log('✅ iJewel SDK initialized successfully');

            } catch (err) {
                console.error('❌ Initialization error:', err);
                setError(`Lỗi khởi tạo: ${err.message}`);
                setLoading(false);
            }
        };

        init();

        // Cleanup
        return () => {
            if (tryonRef.current && tryonRef.current.running) {
                tryonRef.current.stop();
            }
            if (viewerRef.current) {
                viewerRef.current.dispose?.();
            }
        };
    }, [ringId]);

    // Toggle AR
    const handleToggleAR = async () => {
        if (!tryonRef.current) return;

        try {
            if (tryonRef.current.running) {
                await tryonRef.current.stop();
                setIsARRunning(false);
            } else {
                await tryonRef.current.start();
                setIsARRunning(true);
            }
        } catch (err) {
            console.error('❌ Toggle AR error:', err);
            setError(`Lỗi: ${err.message}`);
        }
    };

    // Flip camera
    const handleFlipCamera = () => {
        if (tryonRef.current && tryonRef.current.running) {
            tryonRef.current.flipCamera();
        }
    };

    // Switch finger (0-4: Thumb, Index, Middle, Ring, Pinky)
    const handleSwitchFinger = () => {
        if (tryonRef.current && tryonRef.current.running) {
            tryonRef.current.finger = (tryonRef.current.finger + 1) % 5;
        }
    };

    // Save image
    const handleSaveImage = () => {
        if (tryonRef.current && tryonRef.current.running) {
            tryonRef.current.saveImage();
        }
    };

    return (
        <div className="ijewel-tryon-container">
            {/* Canvas container */}
            <div className="canvas-container">
                <div className="header-text">
                    iJewel Ring Try-On
                </div>
                <canvas
                    ref={canvasRef}
                    className="webgi-canvas"
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        touchAction: 'none'
                    }}
                />
            </div>

            {/* Start/Stop button */}
            <button
                className="start-tryon-btn"
                onClick={handleToggleAR}
                disabled={loading || !!error}
            >
                {isARRunning ? 'Stop Try-On' : 'Start Try-On'}
            </button>

            {/* TryOn options (show when AR is running) */}
            {isARRunning && (
                <div className="tryon-options">
                    <button className="control-btn" onClick={handleFlipCamera}>
                        Flip Camera
                    </button>
                    <button className="control-btn" onClick={handleSwitchFinger}>
                        Switch Finger
                    </button>
                    <button className="control-btn" onClick={handleSaveImage}>
                        Save Image
                    </button>
                </div>
            )}

            {/* Loading overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading...</p>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="error-overlay">
                    <div className="error-message">
                        <h3>Error</h3>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>
                            Reload
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IJewelTryOn;
