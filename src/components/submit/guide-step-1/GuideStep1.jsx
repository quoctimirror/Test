import "./GuideStep1.css";
import DecorativeLine from "@components/common/decorative/DecorativeLine";

const GuideStep1 = () => {
  return (
    <div className="guide-step-1-wrapper">
      <section className="guide-step-1-section">
        <div className="guide-step-1-container">
          {/* Header Line */}
          <div className="guide-step-1-header-line">
            <DecorativeLine fillOpacity="0.75" />
            <DecorativeLine fillOpacity="0.1" />
            <DecorativeLine fillOpacity="0.1" />
            <DecorativeLine fillOpacity="0.1" />
          </div>

          {/* Header Text */}
          <p className="guide-step-1-header bodytext-3--no-margin">
            THE SPARK - YOUR CREATIVITY IS SACRED
          </p>

          {/* Main Title */}
          <h2 className="guide-step-1-title heading-2--no-margin">
            At Mirror, Your Work is Always Yours
          </h2>

          {/* Description */}
          <p className="guide-step-1-description bodytext-3--no-margin">
            Your creativity is sacred. Your work remains yours, your name is always
            credited, and we exist to amplify your artistry. Mirror is not a gatekeeper —
            we're a luxury stage designed to reflect your vision to the world.
          </p>

          {/* Opportunities Section */}
          <div className="guide-step-1-opportunities">
            <h3 className="guide-step-1-opportunities-title bodytext-3--no-margin">
              What We Love to See
            </h3>

            <div className="guide-step-1-grid">
              <div className="guide-step-1-column">
                <h4 className="column-title bodytext-5--no-margin">
                  Step into the Mirror Haus
                </h4>
                <p className="column-description bodytext-6--no-margin">
                  Have your designs showcased inside Mirror's Virtual Showroom,
                  where visitors experience the future of jewelry.
                </p>
              </div>

              <div className="guide-step-1-column">
                <h4 className="column-title bodytext-5--no-margin">
                  Be Part of the Story
                </h4>
                <p className="column-description bodytext-6--no-margin">
                  Featured in Mirror Journal and highlighted in our 2026 Global
                  Campaign as a voice of next-gen luxury.
                </p>
              </div>

              <div className="guide-step-1-column">
                <h4 className="column-title bodytext-5--no-margin">
                  Co-Create the Future
                </h4>
                <p className="column-description bodytext-6--no-margin">
                  Collaborate with Mirror on exclusive editions crafted for our
                  retail partners, bringing your vision to reality.
                </p>
              </div>

              <div className="guide-step-1-column">
                <h4 className="column-title bodytext-5--no-margin">
                  Shine Worldwide
                </h4>
                <p className="column-description bodytext-6--no-margin">
                  Gain exposure across international media, design networks, and
                  Mirror's global community of tastemakers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuideStep1;
