import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  useEffect(() => {
    let panels = gsap.utils.toArray(".panel");

    panels.forEach((panel) => {
      ScrollTrigger.create({
        trigger: panel,
        start: () =>
          panel.offsetHeight < window.innerHeight ? "top top" : "bottom bottom",
        pin: true,
        pinSpacing: false,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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

      <section className="panel">
        <IntroBOD />
      </section>

      <section className="panel">
        <BODMember />
      </section>

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

      <section className="panel">
        <SharedSection />
      </section>
    </div>
  );
};

export default AboutPage;
