import React from 'react';
import IntroBOD from '../components/about/introBOD/IntroBOD';
import BODMember from '../components/about/BODMember/BODMember';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <IntroBOD />
      <BODMember />
    </div>
  );
};

export default AboutPage;