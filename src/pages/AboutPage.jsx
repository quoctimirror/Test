import React from "react";
import SloganSection from "../components/about/sloganSection/SloganSection";
import StartingPlaceSection from "../components/about/startingPlaceSection/StartingPlaceSection";
import IntroBOD from "../components/about/introBOD/IntroBOD";
import BODMember from "../components/about/BODMember/BODMember";
import MirrorverseSection from "../components/about/mirrorverseSection/MirrorverseSection";
import AtMirror from "../components/about/atMirror/AtMirror";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <div className="about-page">
      <SloganSection />
      <StartingPlaceSection />
      <IntroBOD />
      <BODMember />
      <AtMirror />
      <MirrorverseSection />
    </div>
  );
};

export default AboutPage;
