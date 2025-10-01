import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IntroSubmit from "@components/submit/intro-submit/IntroSubmit";
import GuideStep1 from "@components/submit/guide-step-1/GuideStep1";
import GuideStep2 from "@components/submit/guide-step-2/GuideStep2";
import GuideStep3 from "@components/submit/guide-step-3/GuideStep3";
import SubmitForm from "@components/submit/submit-form/SubmitForm";
import "./SubmitPage.css";

gsap.registerPlugin(ScrollTrigger);

const SubmitPage = () => {
  const progressBarRef = useRef(null);
  const setupScrollTriggers = () => {
    // Disable scroll snap on mobile and tablet
    const isMobileOrTablet = window.innerWidth <= 1023;

    if (isMobileOrTablet) {
      return; // Don't setup scroll triggers on mobile/tablet
    }

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
  };

  useEffect(() => {
    setupScrollTriggers();

    const handlePageTransitionComplete = () => {
      setTimeout(() => {
        setupScrollTriggers();
      }, 150);
    };

    const handleResize = () => {
      // Kill all triggers and re-setup on resize
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      setupScrollTriggers();
    };

    let ticking = false;

    const updateProgressBar = () => {
      if (progressBarRef.current) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBarRef.current.style.width = `${scrollPercent}%`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgressBar);
        ticking = true;
      }
    };

    window.addEventListener(
      "pageTransitionComplete",
      handlePageTransitionComplete
    );
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial update
    updateProgressBar();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.removeEventListener(
        "pageTransitionComplete",
        handlePageTransitionComplete
      );
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="submit-page">
      <div className="scroll-progress-bar" ref={progressBarRef}></div>

      <section className="panel">
        <IntroSubmit />
      </section>

      <GuideStep1 />

      <GuideStep2 />

      <GuideStep3 />

      <SubmitForm />
    </div>
  );
};

export default SubmitPage;
