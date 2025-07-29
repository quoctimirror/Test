import React from "react";
import "./ComparativeDebugDisplay.css"; // Will create CSS file right after this

// A small, reusable data column
const DataColumn = ({ title, data }) => {
  // Function to round numbers for display
  const formatPos = (num) => (num !== undefined ? num.toFixed(4) : "N/A");
  const formatRot = (num) => (num !== undefined ? num.toFixed(1) : "N/A");

  return (
    <div className="debug-column">
      <h4>{title}</h4>
      {data ? (
        <>
          <div className="debug-section">
            <strong>Position</strong>
            <p>X: {formatPos(data.position.x)}</p>
            <p>Y: {formatPos(data.position.y)}</p>
            <p>Z: {formatPos(data.position.z)}</p>
          </div>
          <div className="debug-section">
            <strong>Rotation (Deg)</strong>
            <p>X: {formatRot(data.rotation.x)}</p>
            <p>Y: {formatRot(data.rotation.y)}</p>
            <p>Z: {formatRot(data.rotation.z)}</p>
          </div>
        </>
      ) : (
        <p>No data</p>
      )}
    </div>
  );
};

// Main component for comparison display
const ComparativeDebugDisplay = ({ targetData, ringData }) => {
  return (
    <div className="debug-comparison-overlay">
      {/* Column 1: Data from finger */}
      <DataColumn title="Target (Hand)" data={targetData} />
      {/* Column 2: Actual data from 3D ring */}
      <DataColumn title="Actual (3D Ring)" data={ringData} />
    </div>
  );
};

export default ComparativeDebugDisplay;
