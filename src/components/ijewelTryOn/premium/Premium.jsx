import { useEffect, useRef, useState } from 'react';
import styles from './premium.module.css';

const FILE_ID = 'bTfEBf0fSHaflMHTd4scxw';
const BASENAME = 'drive';

const Premium = () => {
    const containerRef = useRef(null);
    const viewerAppRef = useRef(null);
    const arPluginRef = useRef(null);
    const fileConfigRef = useRef(null);

    const [inAR, setInAR] = useState(false);

    useEffect(() => {
        const initViewer = async () => {
            if (!containerRef.current) return;

            window.addEventListener('ijewel-file-data', (event) => {
                const fileData = event.detail.iJewelFileData?.config;
                fileConfigRef.current = JSON.parse(fileData);
            });

            await window.ijewelViewer.loadModelById(FILE_ID, BASENAME, containerRef.current, {
                showUiButtons: false,
                hideTryOn: true
            });

            window.addEventListener('ijewel-viewer-ready', (event) => {
                viewerAppRef.current = event.detail.viewer;
                console.log('Viewer ready');
            });
        };

        initViewer();
    }, []);

    const startAR = async () => {
        if (!window.ij_vto) {
            console.error('WebVTO is not loaded');
            return;
        }

        const arPlugin = await viewerAppRef.current.addPlugin(window.ij_vto.RingTryonPlugin);
        arPluginRef.current = arPlugin;

        if (fileConfigRef.current?.tryonConfig) {
            fileConfigRef.current.tryonConfig.type = 'RingTryonPlugin';
            arPlugin.fromJSON(fileConfigRef.current?.tryonConfig);
        }

        await arPlugin.start();
    };

    const handleARClick = async () => {
        if (inAR) {
            await arPluginRef.current.stop();
            setInAR(false);
            return;
        }

        try {
            await startAR();
            setInAR(true);
        } catch (error) {
            console.error('AR error:', error);
        }
    };

    const handleFlipClick = async () => {
        if (!arPluginRef.current || !inAR) return;

        try {
            await arPluginRef.current.flipCamera();
        } catch (error) {
            console.error('Flip camera error:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div ref={containerRef} className={styles.viewerContainer}></div>

            <div className={styles.controls}>
                <button onClick={handleARClick} className={styles.button}>
                    {inAR ? 'Exit AR' : 'Start AR'}
                </button>
                {inAR && (
                    <button onClick={handleFlipClick} className={styles.button}>
                        Flip Camera
                    </button>
                )}
            </div>
        </div>
    );
};

export default Premium;