import React from 'react';
import './LeftContainer.css';
import Section1_v2 from './Section1_v2';
import Section2 from './Section2';
import TwoSideImageLayout from './TwoSideImageLayout';
import OneImageLayout from './OneImageLayout';

const LeftContainer_v2 = () => {
    return (
        <div className="pv2-left-container">
            <Section1_v2 />
            <Section2 />
            <TwoSideImageLayout leftImage="placeholder1.png" rightImage="placeholder2.png" />
            <OneImageLayout imageName="placeholder3.png" />
            <OneImageLayout imageName="placeholder4.png" />
        </div>
    );
};

export default LeftContainer_v2;
