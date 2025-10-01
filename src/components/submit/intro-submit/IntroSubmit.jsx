import "./IntroSubmit.css";
import { useEffect, useRef } from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import ArrowDown from "@components/common/decorative/ArrowDown";
import { useNavigate, useLocation } from "react-router-dom";

const IntroSubmit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const arrowRef = useRef(null);

  const handleSubmitPortfolioClick = () => {
    // Check if we're already on the submit page
    if (location.pathname === "/mirror-in-milan-digital-jewelry-week") {
      const submitFormSection = document.querySelector(".submit-form-section");
      if (submitFormSection) {
        submitFormSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      // Navigate to submit page and scroll to form
      navigate("/mirror-in-milan-digital-jewelry-week");
      // Use setTimeout to ensure page has loaded before scrolling
      setTimeout(() => {
        const submitFormSection = document.querySelector(
          ".submit-form-section"
        );
        if (submitFormSection) {
          submitFormSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  const handleViewGuidelinesClick = () => {
    // Check if we're already on the submit page
    if (location.pathname === "/mirror-in-milan-digital-jewelry-week") {
      const guideStep1Section = document.querySelector(".guide-step-1-section");
      if (guideStep1Section) {
        guideStep1Section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      // Navigate to submit page and scroll to guidelines
      navigate("/mirror-in-milan-digital-jewelry-week");
      // Use setTimeout to ensure page has loaded before scrolling
      setTimeout(() => {
        const guideStep1Section = document.querySelector(
          ".guide-step-1-section"
        );
        if (guideStep1Section) {
          guideStep1Section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  // Handle arrow movement on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Disable arrow movement on mobile and tablet
      if (window.innerWidth <= 1023) return;

      const arrow = arrowRef.current;
      const guideStep1 = document.querySelector(".guide-step-1-section");

      if (!arrow || !guideStep1) return;

      const guideRect = guideStep1.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Distance from bottom of guide-step-1 to arrow (fixed gap)
      const gapFromGuide = 24;

      // When guide-step-1 starts overlapping intro
      if (guideRect.top < windowHeight) {
        // Calculate position: guide top - gap
        const newBottom = windowHeight - guideRect.top + gapFromGuide;
        arrow.style.bottom = `${newBottom}px`;
      } else {
        // Reset to original position when guide is below viewport
        arrow.style.bottom = "24px";
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="intro-submit-wrapper">
      {/* Hero Section */}
      <section className="intro-submit-hero-section">
        <div className="intro-submit-hero-content">
          <div className="intro-submit-hero-text">
            <div className="intro-submit-hero-text-main">
              <span className="intro-submit-hero-subtitle bodytext-4--no-margin">
                Milan Digital Jewelry Week | October 11
              </span>
              <h1 className="intro-submit-hero-title heading-1--no-margin">
                We're Here to Celebrate Creativity
              </h1>
              <h2 className="intro-submit-hero-subtitle-large heading-2--no-margin">
                and Awaken Luxury with You
              </h2>
              <div className="intro-submit-hero-buttons">
                <ShineGlassButton
                  theme="light"
                  onClick={handleSubmitPortfolioClick}
                >
                  Share Your Vision
                </ShineGlassButton>
                <button
                  className="intro-submit-btn-secondary bodytext-4--no-margin"
                  onClick={handleViewGuidelinesClick}
                >
                  Learn More
                </button>
              </div>
            </div>
            <p className="intro-submit-hero-description bodytext-5--no-margin">
              Your art deserves to shine in Milan. Mirror exists to amplify your
              artistry and reflect it to the world. We'd love to see your
              creations and explore how we can shape the future of luxury
              together.
            </p>
          </div>
          <div className="intro-submit-hero-image">
            <img
              src="/submit/kv-website-final@5000x-100.jpg"
              alt="Submit Hero"
            />
            <h3 className="intro-submit-hero-image-caption heading-3--no-margin">
              Collaborate, Innovate, Awaken luxury
            </h3>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="intro-submit-arrow-down" ref={arrowRef}>
          <ArrowDown width={20} height={20} fill="black" />
        </div>
      </section>
    </div>
  );
};

export default IntroSubmit;
