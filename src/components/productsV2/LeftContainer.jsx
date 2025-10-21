import React from 'react';
import './LeftContainer.css';
import Section1 from './Section1';
import Section2 from './Section2';
import TwoSideImageLayout from './TwoSideImageLayout';
import OneImageLayout from './OneImageLayout';

const LeftContainer = ({ productConfig }) => {
    return (
        <div className="pv2-left-container">
            <Section1 productConfig={productConfig} />
            <Section2 />
            <TwoSideImageLayout leftImage="placeholder1.png" rightImage="placeholder2.png" />
            <OneImageLayout imageName="placeholder3.png" />
            <OneImageLayout imageName="placeholder4.png" />
        </div>
    );
};

export default LeftContainer;