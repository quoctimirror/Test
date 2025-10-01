import "./GuideStep3.css";
import DecorativeLine from "@components/common/decorative/DecorativeLine";

const GuideStep3 = () => {
  return (
    <div className="guide-step-3-wrapper">
      <section className="guide-step-3-section">
        <div className="guide-step-3-container">
          {/* Header Line */}
          <div className="guide-step-3-header-line">
            <DecorativeLine fillOpacity="0.75" />
            <DecorativeLine fillOpacity="0.75" />
            <DecorativeLine fillOpacity="0.75" />
            <DecorativeLine fillOpacity="0.1" />
          </div>

          {/* Main Title */}
          <h2 className="guide-step-3-title heading-2--no-margin">
            What Inspires Us
          </h2>

          {/* Description */}
          <p className="guide-step-3-description bodytext-3--no-margin">
            We're drawn to artistry that reflects light, emotion, and craftsmanship.
            Your work doesn't need to be perfect — it needs to be yours.
          </p>

          {/* We Value Section */}
          <div className="guide-step-3-values">
            <h3 className="values-title bodytext-3--no-margin">What We Love to See</h3>

            <div className="values-grid">
              <div className="value-item">
                <p className="value-description bodytext-6--no-margin">
                  Original creations that reflect your unique voice,
                  craftsmanship, and vision.
                </p>
              </div>

              <div className="value-item">
                <p className="value-description bodytext-6--no-margin">
                  A curated selection of your work — quality always
                  outshines quantity.
                </p>
              </div>

              <div className="value-item">
                <p className="value-description bodytext-6--no-margin">
                  Clear images that let your pieces speak
                  (no need for studio-grade photography).
                </p>
              </div>

              <div className="value-item">
                <p className="value-description bodytext-6--no-margin">
                  If you'd like, a few words about what inspires you
                  and the story behind your creations.
                </p>
              </div>
            </div>
          </div>

          {/* Eligibility Section */}
          <div className="guide-step-3-eligibility">
            <h3 className="eligibility-title heading-2--no-margin">
              Who We Welcome
            </h3>

            <div className="eligibility-grid">
              <div className="eligibility-item">
                <p className="eligibility-description bodytext-6--no-margin">
                  Emerging and established designers who dare to
                  reimagine luxury through artistry.
                </p>
              </div>

              <div className="eligibility-item">
                <p className="eligibility-description bodytext-6--no-margin">
                  Creatives working in jewelry, wearable art,
                  or sculptural adornment.
                </p>
              </div>

              <div className="eligibility-item">
                <p className="eligibility-description bodytext-6--no-margin">
                  Visionaries who believe luxury should awaken
                  the senses, not just adorn the body.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuideStep3;
