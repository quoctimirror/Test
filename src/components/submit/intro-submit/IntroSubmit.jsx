import "./IntroSubmit.css";
import { useEffect, useRef, useState } from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import UnderlineButton from "@components/common/button/UnderlineButton";
import ArrowDown from "@components/common/decorative/ArrowDown";
import { useNavigate, useLocation } from "react-router-dom";

const IntroSubmit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const arrowRef = useRef(null);
  const [heroImage, setHeroImage] = useState(
    "/submit/kv-milan-on-website-Desktop.jpg"
  );

  // Update hero image based on screen size
  useEffect(() => {
    const updateHeroImage = () => {
      const isMobile = window.innerWidth <= 480;
      setHeroImage(
        isMobile
          ? "/submit/kv-milan-on-website-mobile2.png"
          : "/submit/kv MILAN.png"
      );
    };

    // Set initial image
    updateHeroImage();

    // Listen to resize
    window.addEventListener("resize", updateHeroImage);

    return () => {
      window.removeEventListener("resize", updateHeroImage);
    };
  }, []);

  const handleSubmitPortfolioClick = () => {
    // Check if we're already on the submit page
    if (location.pathname === "/mirror-in-milan-digital-jewelry-week") {
      const submitFormSection = document.querySelector(".submit-form-section");
      if (submitFormSection) {
        const rect = submitFormSection.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
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
          const rect = submitFormSection.getBoundingClientRect();
          const scrollTop =
            window.scrollY || document.documentElement.scrollTop;
          const targetPosition = rect.top + scrollTop;
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
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
        const rect = guideStep1Section.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop + 20; // Offset for better positioning
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
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
          const rect = guideStep1Section.getBoundingClientRect();
          const scrollTop =
            window.scrollY || document.documentElement.scrollTop;
          const targetPosition = rect.top + scrollTop - 100; // Offset for better positioning
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

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
                  Share your vision
                </ShineGlassButton>
                <UnderlineButton
                  className="intro-submit-btn-secondary"
                  textClassName="bodytext-4--no-margin"
                  onClick={handleViewGuidelinesClick}
                >
                  Learn More
                </UnderlineButton>
              </div>
            </div>
            <p className="intro-submit-hero-description bodytext-5--no-margin">
              Your art deserves to shine in Milan. MIRROR exists to amplify your
              artistry and reflect it to the world. We'd love to see your
              creations and explore how we can shape the future of luxury
              together.
            </p>
          </div>
          <div className="intro-submit-hero-image">
            <img src={heroImage} alt="Submit Hero" />
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
