import React from 'react';
import './OneImageLayout.css';

const OneImageLayout = ({ imageName }) => {
    return (
        <section className="pv2-one-image-layout-container">
            <div className="pv2-one-image-layout-wrapper">
                <div className="pv2-one-image-layout-image">
                    <img src={`products/${imageName}`} alt="Image" />
                </div>
            </div>
        </section>
    );
};

export default OneImageLayout;