import TopBanner from "@components/topBanner/TopBanner";
import ScrollEffect from "@components/home-page/scrollEffect/ScrollEffect";
import ImmersiveShowroom from "@components/home-page/immersiveShowroom/ImmersiveShowroom";
import BrandPillars from "@components/home-page/brandPillars/BrandPillars";
import Lumex91 from "@components/home-page/lumex91/Lumex91";
// import UniverseSection from "@components/home-page/universeSection/MirrorExp";
import UniverseSection from "@components/home-page/universeSectionFixed/MirrorExp";
import FutureDiamond from "@components/home-page/futureDiamond/FutureDiamond";
import HoverExpandSection from "@components/home-page/hoverExpandSection/HoverExpandSection";
import ContactUs from "@components/contactUs/ContactUs";

export default function HomePage() {
  return (
    <>
      {/* <TopBanner /> */}

      <ScrollEffect />

      <FutureDiamond />

      <Lumex91 />

      <BrandPillars />

      <UniverseSection />

      <ImmersiveShowroom />

      <HoverExpandSection />

      <ContactUs />
    </>
  );
}
