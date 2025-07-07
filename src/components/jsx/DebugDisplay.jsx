import React from 'react';
import '../css/DebugDisplay.css';

const DebugDisplay = ({ data }) => {
    if (!data) return null;

    const { position, rotation } = data;
    const format = (num) => (num !== undefined ? num.toFixed(3) : 'N/A');
    const formatDegrees = (num) => (num !== undefined ? num.toFixed(1) : 'N/A');

    return (
        <div className="debug-screen-overlay">
            <h4>Target Observer</h4>
            <div className="debug-section">
                <strong>Position (Normalized)</strong>
                <p>X: {format(position.x)}</p>
                <p>Y: {format(position.y)}</p>
                <p>Z: {format(position.z)}</p>
            </div>
            <div className="debug-section">
                <strong>Rotation (Degrees)</strong>
                <p>X: {formatDegrees(rotation.x)}</p>
                <p>Y: {formatDegrees(rotation.y)}</p>
                <p>Z: {formatDegrees(rotation.z)}</p>
            </div>
        </div>
    );
};

export default DebugDisplay;