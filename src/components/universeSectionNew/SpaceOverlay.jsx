import React, { useState, useEffect } from 'react';
import './SpaceOverlay.css';
import StarlightEffect from './StarlightEffect';

const SpaceOverlay = () => {
    const [starlightHeight, setStarlightHeight] = useState(100);

    useEffect(() => {
        const calculateHeight = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Tính height dựa trên kích thước màn hình
            let height;
            
            if (viewportWidth >= 1920) {
                // Desktop lớn
                height = 120;
            } else if (viewportWidth >= 1200) {
                // Desktop trung bình
                height = 110;
            } else if (viewportWidth >= 1024) {
                // Laptop
                height = 100;
            } else if (viewportWidth >= 768) {
                // Tablet landscape
                height = 90;
            } else if (viewportWidth >= 481) {
                // Tablet portrait
                height = 80;
            } else if (viewportWidth >= 376) {
                // Mobile landscape
                height = 70;
            } else if (viewportWidth >= 320) {
                // Mobile portrait
                height = 60;
            } else {
                // Mobile rất nhỏ
                height = 50;
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
        <div className="rect-container">
            <div className="starlight-12-oclock">
                <StarlightEffect direction="falling" height={starlightHeight} />
            </div>
            <div className="starlight-6-oclock">
                <StarlightEffect direction="falling" height={starlightHeight} />
            </div>
        </div>
    );
};

export default SpaceOverlay;