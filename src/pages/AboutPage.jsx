import React from 'react';
import InroBOD from '../components/about/introBOD/InroBOD';
import BODMember from '../components/about/BODMember/BODMember';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <InroBOD />
      <BODMember />
    </div>
  );
};

export default AboutPage;