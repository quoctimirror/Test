import { useState } from 'react';
import './SizeSelector.css'; // Reuse same styling
import { AVAILABLE_SHAPES, getShapeConfig } from './shapeConfig';

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
                                const isSelected = selectedShape && shapeName === selectedShape;

                                return (
                                    <tr
                                        key={shapeName}
                                        className={`pv2-size-row ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleShapeSelect(shapeName)}
                                    >
                                        <td className="pv2-size-cell">{shapeConfig.shape}</td>
                                        <td className="pv2-size-cell" style={{ fontSize: '12px', color: '#999' }}>
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
