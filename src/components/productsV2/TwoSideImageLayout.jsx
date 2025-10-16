import React from 'react';
import './TwoSideImageLayout.css';

const TwoSideImageLayout = ({ leftImage, rightImage }) => {
    return (
        <section className="pv2-two-side-image-layout-container">
            <div className="pv2-two-side-image-layout-wrapper">
                <div className="pv2-two-side-image-layout-grid">
                    <div className="pv2-two-side-image-layout-left">
                        <img src={`products/${leftImage}`} alt="Left image" />
                    </div>
                    <div className="pv2-two-side-image-layout-right">
                        <img src={`products/${rightImage}`} alt="Right image" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TwoSideImageLayout;