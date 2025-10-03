import "./GuideStep2.css";
import StarlightEffect from "@components/home-page/universeSection/StarlightEffect";

const GuideStep2 = () => {
  return (
    <div className="guide-step-2-wrapper">
      <section className="guide-step-2-section">
        <div className="guide-step-2-container">
          {/* Header Text */}
          <p className="guide-step-2-header bodytext-3--no-margin">
            THE JOURNEY
          </p>

          {/* Main Title */}
          <h2 className="guide-step-2-title heading-2--no-margin">
            This Is Just the First Hello
          </h2>

          {/* Process Steps */}
          <div className="guide-step-2-process">
            {/* Submit Step */}
            <div className="guide-step-2-step">
              <h3 className="step-title bodytext-1--no-margin">Share</h3>
              <p className="step-description bodytext-4--no-margin">
                Send us your portfolio and if you'd like,
                <br />
                share a few words about your inspirations.
                <br />
                This is a conversation, not an interrogation.
              </p>
              <div className="step-line">
                <StarlightEffect direction="falling" height={36} />
              </div>
            </div>

            {/* Curate Step */}
            <div className="guide-step-2-step">
              <h3 className="step-title bodytext-1--no-margin">Connect</h3>
              <p className="step-description bodytext-4--no-margin">
                Our team will review your work with care
                <br />
                and reach out to explore collaborations
                <br />
                that honor your vision.
              </p>
              <div className="step-line">
                <StarlightEffect direction="falling" height={36} />
              </div>
            </div>

            {/* Collaborate Step */}
            <div className="guide-step-2-step">
              <h3 className="step-title bodytext-1--no-margin">
                Create Together
              </h3>
              <p className="step-description bodytext-4--no-margin">
                We'll follow up to discuss opportunities
                <br />
                in more depth — on your terms, at your pace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuideStep2;
