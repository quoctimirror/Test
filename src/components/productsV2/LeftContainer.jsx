import React from 'react';
import './LeftContainer.css';
import Section1 from './Section1';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';
import OneImageLayout from './OneImageLayout';

const LeftContainer = ({ productConfig }) => {
    return (
        <div className="pv2-left-container">
            <Section1 productConfig={productConfig} />
            <Section2 />
            <Section3 />
            <OneImageLayout imageName="placeholder4.png" />
            <Section4 />
        </div>
    );
};

export default LeftContainer;