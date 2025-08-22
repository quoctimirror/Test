import React, { useState, useEffect } from 'react';
import './SensesOverlay2.css';
import StarlightEffect from './StarlightEffect';

const SensesOverlay2 = () => {
    const [starlightHeight, setStarlightHeight] = useState(40);

    useEffect(() => {
        const calculateHeight = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Tính height dựa trên kích thước màn hình
            let height;

            if (viewportWidth >= 1920) {
                // Desktop lớn
                height = 40;
            } else if (viewportWidth >= 1200) {
                // Desktop trung bình
                height = 35;
            } else if (viewportWidth >= 1024) {
                // Laptop
                height = 30;
            } else if (viewportWidth >= 768) {
                // Tablet landscape
                height = 25;
            } else if (viewportWidth >= 481) {
                // Tablet portrait
                height = 20;
            } else if (viewportWidth >= 376) {
                // Mobile landscape
                height = 15;
            } else if (viewportWidth >= 320) {
                // Mobile portrait
                height = 10;
            } else {
                // Mobile rất nhỏ
                height = 5;
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
        <div className="heart-container">
            {/* 🕚 THANH SÁNG 11 GIỜ - SIGHT (Thị giác) */}
            <div className="starlight-11-oclock">
                <StarlightEffect direction="falling" height={starlightHeight} />
            </div>

            {/* 🕐 THANH SÁNG 1 GIỜ - TOUCH (Xúc giác) */}
            <div className="starlight-1-oclock">
                <StarlightEffect direction="falling" height={starlightHeight} />
            </div>

            {/* 🕓 THANH SÁNG 4 GIỜ - TASTE (Vị giác) */}
            <div className="starlight-4-oclock">
                <StarlightEffect direction="falling" height={starlightHeight + 5} />
            </div>

            {/* 🕕 THANH SÁNG 6 GIỜ - SOUND (Thính giác) - ĐÃ DỊCH XUỐNG 52% */}
            <div className="starlight-6-oclock-senses">
                <StarlightEffect direction="falling" height={starlightHeight} />
            </div>

            {/* 🕗 THANH SÁNG 8 GIỜ - SCENT (Khứu giác) */}
            <div className="starlight-8-oclock">
                <StarlightEffect direction="falling" height={starlightHeight + 5} />
            </div>
        </div>
    );
};

export default SensesOverlay2;