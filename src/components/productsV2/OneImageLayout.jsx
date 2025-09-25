import React from 'react';
import './OneImageLayout.css';

const OneImageLayout = ({ imageName }) => {
    return (
        <section className="one-image-layout-container">
            <div className="one-image-layout-wrapper">
                <div className="one-image-layout-image">
                    <img src={`products/${imageName}`} alt="Image" />
                </div>
            </div>
        </section>
    );
};

export default OneImageLayout;