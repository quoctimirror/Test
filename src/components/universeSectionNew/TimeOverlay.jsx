import React, { useState, useEffect } from 'react';
import './TimeOverlay.css';
import StarlightEffect from './StarlightEffect';

const TimeOverlay = () => {
    const [starlightHeight, setStarlightHeight] = useState(110);

    useEffect(() => {
        const calculateHeight = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Tính height dựa trên kích thước màn hình
            let height;
            
            if (viewportWidth >= 1920) {
                // Desktop lớn
                height = 80;
            } else if (viewportWidth >= 1200) {
                // Desktop trung bình
                height = 75;
            } else if (viewportWidth >= 1024) {
                // Laptop
                height = 70;
            } else if (viewportWidth >= 768) {
                // Tablet landscape
                height = 65;
            } else if (viewportWidth >= 481) {
                // Tablet portrait
                height = 60;
            } else if (viewportWidth >= 376) {
                // Mobile landscape
                height = 55;
            } else if (viewportWidth >= 320) {
                // Mobile portrait
                height = 50;
            } else {
                // Mobile rất nhỏ
                height = 45;
            }
            
            // Điều chỉnh theo chiều cao màn hình
            if (viewportHeight < 600) {
                height = height * 0.8;
            }
            
            setStarlightHeight(Math.round(height));
        };

        // Tính height ban đầu
        calculateHeight();

        // Cập nhật khi resize
        window.addEventListener('resize', calculateHeight);
        
        return () => {
            window.removeEventListener('resize', calculateHeight);
        };
    }, []);

    return (
        <div className="droplet-container">
            {/* Chỉ có 1 thanh sáng hướng 6 giờ */}
            <div className="starlight-6-oclock">
                <StarlightEffect direction="falling" height={starlightHeight} />
            </div>
        </div>
    );
};

export default TimeOverlay;