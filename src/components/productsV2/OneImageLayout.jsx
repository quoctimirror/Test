import React from 'react';
import { MediaImage } from '@components/common/media';
import './OneImageLayout.css';

const OneImageLayout = ({ imageName }) => {
    return (
        <section className="pv2-one-image-layout-container">
            <div className="pv2-one-image-layout-wrapper">
                <div className="pv2-one-image-layout-image">
                    <MediaImage src={`products/${imageName}`} alt="Image" />
                </div>
            </div>
        </section>
    );
};

export default OneImageLayout;