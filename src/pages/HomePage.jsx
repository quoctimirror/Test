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
  return (
    <>
      {/* <TopBanner /> */}

      <div data-section="scroll-effect">
        <ScrollEffect />
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
        <UniverseSection />
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
