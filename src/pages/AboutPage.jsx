import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SloganSection from "@components/about/sloganSection/SloganSection";
import StartingPlaceSection from "@components/about/startingPlaceSection/StartingPlaceSection";
import IntroBOD from "@components/about/introBOD/IntroBOD";
import BODMemberV3 from "@components/about/BODMemberV3/BODMemberV3";
import MirrorNetworkSection from "@components/about/mirrorNetworkSection/MirrorNetworkSection";
import MirrorverseSection from "@components/about/mirrorverseSection/MirrorverseSection";
import AtMirror from "@components/about/atMirror/AtMirror";
import SharedSection from "@components/about/sharedSection/SharedSection";
import DiscoverSection from "@components/about/discoverSection/DiscoverSection";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import "@components/home-page/scrollEffect/ScrollEffect.css"; // Import CSS for arrow styling
import "./AboutPage.css";

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '[data-section="shared-section"], .footer', // Check both SharedSection and global footer
  });

  const setupScrollTriggers = () => {
    // Kill existing triggers first
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    let panels = gsap.utils.toArray(".panel");

    panels.forEach((panel) => {
      ScrollTrigger.create({
        trigger: panel,
        start: () =>
          panel.offsetHeight < window.innerHeight ? "top top" : "bottom bottom",
        pin: true,
        pinSpacing: false,
        anticipatePin: 1, // Smooth pin when scrolling fast
        invalidateOnRefresh: true, // Recalculate on refresh
        fastScrollEnd: true, // Better fast scroll handling
      });
    });
  };

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      setupScrollTriggers();
    }, 100);

    const handlePageTransitionComplete = () => {
      setTimeout(() => {
        setupScrollTriggers();
      }, 150);
    };

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener(
      "pageTransitionComplete",
      handlePageTransitionComplete
    );
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(initTimeout);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.removeEventListener(
        "pageTransitionComplete",
        handlePageTransitionComplete
      );
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="about-page">
      <div data-section="slogan-section">
        <SloganSection />
      </div>

      <section className="panel" data-section="starting-place">
        <StartingPlaceSection />
      </section>

      <div data-section="intro-bod">
        <IntroBOD />
      </div>

      <div data-section="bod-member">
        <BODMemberV3 />
      </div>

      <section className="panel" data-section="at-mirror">
        <AtMirror />
      </section>

      <div data-section="mirrorverse">
        <MirrorverseSection />
      </div>

      <section className="panel" data-section="mirror-network">
        <MirrorNetworkSection />
      </section>

      <section className="panel" data-section="discover">
        <DiscoverSection />
      </section>

      <div data-section="shared-section">
        <SharedSection />
      </div>

      {/* Fixed Arrow Button */}
      {isArrowVisible && (
        <div className="fixed-arrow-container">
          <ScrollDownArrow onClick={handleArrowClick} />
        </div>
      )}
    </div>
  );
};

export default AboutPage;
