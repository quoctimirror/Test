import React from 'react';
import '../css/ComparativeDebugDisplay.css'; // Sẽ tạo file CSS ngay sau đây

// Một cột dữ liệu nhỏ, có thể tái sử dụng
const DataColumn = ({ title, data }) => {
    // Hàm làm tròn số cho đẹp
    const formatPos = (num) => (num !== undefined ? num.toFixed(4) : 'N/A');
    const formatRot = (num) => (num !== undefined ? num.toFixed(1) : 'N/A');

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

// Component chính để hiển thị so sánh
const ComparativeDebugDisplay = ({ targetData, ringData }) => {
    return (
        <div className="debug-comparison-overlay">
            {/* Cột 1: Dữ liệu từ ngón tay */}
            <DataColumn title="Target (Hand)" data={targetData} />
            {/* Cột 2: Dữ liệu thực tế từ nhẫn 3D */}
            <DataColumn title="Actual (3D Ring)" data={ringData} />
        </div>
    );
};

export default ComparativeDebugDisplay;