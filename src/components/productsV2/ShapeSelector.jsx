import { useState } from 'react';
import { MediaImage } from '@components/common/media';
import './SizeSelector.css'; // Reuse same styling
import { AVAILABLE_SHAPES, getShapeConfig } from './shapeConfig';
import ShineGlassButton from '@components/common/button/ShineGlassButton';

const ShapeSelector = ({ onClose, onSelectShape, selectedShape }) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, 300);
    };

    const handleShapeSelect = (shapeName) => {
        const shapeConfig = getShapeConfig(shapeName);
        if (onSelectShape) {
            onSelectShape(shapeConfig);
        }
        handleClose();
    };

    return (
        <div
            className={`pv2-size-selector-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleClose}
        >

            <div className="pv2-size-selector-modal" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <div className="pv2-shape-selector-close-button">
                    <ShineGlassButton
                        onClick={handleClose}
                        theme="footer"
                        width={32}
                        height={32}
                        className="pv2-shape-selector-close-btn"
                    >
                        <MediaImage
                            src="universeSection/close-x-icon.svg"
                            alt="Close"
                            width="14"
                            height="14"
                        />
                    </ShineGlassButton>
                </div>

                {/* Header */}
                <div className="pv2-size-selector-header">
                    <button
                        className="pv2-size-tab bodytext-4--no-margin active"
                        style={{ cursor: 'default' }}
                    >
                        <span className="pv2-tab-text">Select your shape</span>
                    </button>
                </div>

                {/* Shape Table */}
                <div className="pv2-size-table-container">
                    <table className="pv2-size-table">
                        <tbody>
                            {AVAILABLE_SHAPES.map((shapeName) => {
                                const shapeConfig = getShapeConfig(shapeName);
                                const isSelected = selectedShape && shapeConfig.shape === selectedShape;

                                return (
                                    <tr
                                        key={shapeName}
                                        className={`pv2-size-row ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleShapeSelect(shapeName)}
                                    >
                                        <td className="pv2-size-cell">{shapeConfig.shape}</td>
                                        <td className="pv2-size-cell pv2-size-cell-secondary">
                                            {shapeConfig.metal} | {shapeConfig.band}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ShapeSelector;
