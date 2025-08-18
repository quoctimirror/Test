import React from "react";
import SloganSection from "../components/about/sloganSection/SloganSection";
import StartingPlaceSection from "../components/about/startingPlaceSection/StartingPlaceSection";
import IntroBOD from "../components/about/introBOD/IntroBOD";
import BODMember from "../components/about/BODMember/BODMember";
import MirrorNetworkSection from "../components/about/mirrorNetworkSection/MirrorNetworkSection";
import MirrorverseSection from "../components/about/mirrorverseSection/MirrorverseSection";
import AtMirror from "../components/about/atMirror/AtMirror";
import SharedSection from "../components/about/sharedSection/SharedSection";
import DiscoverSection from "../components/about/discoverSection/DiscoverSection";
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
      <MirrorNetworkSection />
      <DiscoverSection />
      <SharedSection />
    </div>
  );
};

export default AboutPage;
