import React from 'react';
import SloganSection from '../components/about/sloganSection/SloganSection';
import StartingPlaceSection from '../components/about/startingPlaceSection/StartingPlaceSection';
import IntroBOD from '../components/about/introBOD/IntroBOD';
import BODMember from '../components/about/BODMember/BODMember';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <SloganSection />
      <StartingPlaceSection />
      <IntroBOD />
      <BODMember />
    </div>
  );
};

export default AboutPage;