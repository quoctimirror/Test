import "./IntroSubmit.css";
import { useRef } from "react";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import UnderlineButton from "@components/common/button/UnderlineButton";
import { getImageUrl } from "@utils/cloudflareMediaUtil";

const IntroSubmit = () => {
  const arrowRef = useRef(null);

  const handleSubmitPortfolioClick = () => {
    const submitFormSection = document.querySelector(".submit-form-section");
    if (submitFormSection) {
      const rect = submitFormSection.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  };

  const handleViewGuidelinesClick = () => {
    const guideStep1Section = document.querySelector(".guide-step-1-section");
    if (guideStep1Section) {
      const rect = guideStep1Section.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetPosition = rect.top + scrollTop + 20;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="intro-submit-wrapper intro-submit-section">
      {/* Hero Section */}
      <section className="intro-submit-hero-section">
        <div className="intro-submit-hero-content">
          <div className="intro-submit-hero-text">
            <div className="intro-submit-hero-text-main">
              <span className="intro-submit-hero-subtitle bodytext-4--no-margin">
                Milan Digital Jewelry Week | October 6-12, 2025
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
                  textClassName="bodytext-6--no-margin"
                  onClick={handleViewGuidelinesClick}
                >
                  Learn More
                </UnderlineButton>
              </div>
            </div>
            <p className="intro-submit-hero-description bodytext-5--no-margin">
              Your art deserves to shine in Milan. MIRROR exists to amplify your
              artistry and reflect it to the world. We would love to see your
              creations and explore how we can shape the future of luxury
              together.
            </p>
          </div>
          <div className="intro-submit-hero-image">
            <picture>
              <source
                media="(max-width: 1024px)"
                srcSet={getImageUrl("submit/kv-milan-on-website-mobile2.webp")}
              />
              <img src={getImageUrl("submit/kv MILAN.webp")} alt="Submit Hero" />
            </picture>
            {/* <h3 className="intro-submit-hero-image-caption heading-3--no-margin">
              Collaborate, Innovate, Awaken luxury
            </h3> */}
          </div>
        </div>

      </section>
    </div>
  );
};

export default IntroSubmit;
