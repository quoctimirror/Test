import { useState } from "react";
import TopBanner from "@components/topBanner/TopBanner";
import ScrollEffect from "@components/home-page/scrollEffect/ScrollEffect";
import ImmersiveShowroom from "@components/home-page/immersiveShowroom/ImmersiveShowroom";
import BrandPillars from "@components/home-page/brandPillars/BrandPillars";
// import UniverseSection from "@components/home-page/universeSection/MirrorExp";
import UniverseSection from "@components/home-page/universeSection/MirrorExp";
import FutureDiamond from "@components/home-page/futureDiamond/FutureDiamond";
import HoverExpandSection from "@components/home-page/hoverExpandSection/HoverExpandSection";
import ContactUs from "@components/contactUs/ContactUs";
import MirrorQuote from "@components/home-page/mirrorQuote/MirrorQuote";

export default function HomePage() {
  // Overlay state management - lifted up from MirrorExp
  const [showSenseOverlay, setShowSenseOverlay] = useState(false);
  const [showPresenceOverlay, setShowPresenceOverlay] = useState(false);
  const [showSpaceOverlay, setShowSpaceOverlay] = useState(false);
  const [showTimeOverlay, setShowTimeOverlay] = useState(false);

  // Check if any overlay is open
  const isAnyOverlayOpen = showSenseOverlay || showPresenceOverlay || showSpaceOverlay || showTimeOverlay;

  return (
    <>
      {/* <TopBanner /> */}

      <div data-section="scroll-effect">
        <ScrollEffect isAnyOverlayOpen={isAnyOverlayOpen} />
      </div>

      <div data-section="future-diamond">
        <FutureDiamond />
      </div>

      {/* <div data-section="mirror-quote">
        <MirrorQuote />
      </div> */}

      <div data-section="brand-pillars">
        <BrandPillars />
      </div>

      <div data-section="universe-section">
        <UniverseSection
          showSenseOverlay={showSenseOverlay}
          setShowSenseOverlay={setShowSenseOverlay}
          showPresenceOverlay={showPresenceOverlay}
          setShowPresenceOverlay={setShowPresenceOverlay}
          showSpaceOverlay={showSpaceOverlay}
          setShowSpaceOverlay={setShowSpaceOverlay}
          showTimeOverlay={showTimeOverlay}
          setShowTimeOverlay={setShowTimeOverlay}
        />
      </div>

      <div data-section="immersive-showroom">
        <ImmersiveShowroom />
      </div>

      <div data-section="hover-expand">
        <HoverExpandSection />
      </div>

      <div data-section="contact-us">
        <ContactUs />
      </div>
    </>
  );
}
