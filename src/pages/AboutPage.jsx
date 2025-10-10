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
import "./AboutPage.css";

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
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
      {/* <section className="panel"> */}
      <SloganSection />
      {/* </section> */}

      <section className="panel">
        <StartingPlaceSection />
      </section>

      {/* <section className="panel"> */}
      <IntroBOD />
      {/* </section> */}

      {/* <section className="panel"> */}
      <BODMemberV3 />
      {/* </section> */}

      <section className="panel">
        <AtMirror />
      </section>

      <section className="panel">
        <MirrorverseSection />
      </section>

      <section className="panel">
        <MirrorNetworkSection />
      </section>

      <section className="panel">
        <DiscoverSection />
      </section>

      {/* <section className="panel"> */}
      <SharedSection />
      {/* </section> */}
    </div>
  );
};

export default AboutPage;
