import MetaballBackground from "@components/specialEffect/MetaballBackground/MetaballBackground";
import StarlightEffect from "../universeSection/StarlightEffect";
import "./BrandPillars.css";

const BrandPillars = () => {
  return (
    <section className="brand-pillars">
      <MetaballBackground className="brand-pillars-background" />
      <div className="brand-pillars-gradient-overlay-top" />
      <div className="brand-pillars-gradient-overlay-bottom" />
      <div className="brand-pillars-content">
        <h1 className="brand-pillars-text">
          <div className="brand-group">
            <div className="brand-main-text">
              <span className="brand-line">PRECISION</span>
              <div className="brand-line-with-expand">
                <span className="brand-line">TECHNOLOGY</span>
                <div className="starlight-6-oclock-wrapper">
                  <StarlightEffect direction="falling" height={60} />
                </div>
                <div className="brand-expand-text">
                  <p className="bodytext-3--no-margin">
                    Where human craft meets cutting-edge technology.
                    <br />
                    We shape diamonds with the world's most advanced
                    <br />
                    cutting techniques — each one a fusion of human
                    <br />
                    artistry and scientific precision.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="brand-group">
            <div className="starlight-6-oclock-wrapper">
              <StarlightEffect direction="falling" height={60} />
            </div>
            <div className="brand-expand-text">
              <p className="bodytext-3--no-margin">
                Made for the planet, not taken from it.
                <br />
                We create with the future in mind —
                <br /> lab-grown brilliance that honors our
                <br />
                planet, not extracts from it.
              </p>
            </div>
            <div className="brand-main-text">
              <span className="brand-line">SUSTAINABILITY</span>
            </div>
          </div>
          <div className="brand-group">
            <div className="brand-main-text">
              <div className="brand-line-with-expand">
                <span className="brand-line">REDEFINING</span>
                <div className="starlight-6-oclock-wrapper">
                  <StarlightEffect direction="falling" height={60} />
                </div>
                <div className="brand-expand-text">
                  <p className="bodytext-3--no-margin">
                    True modern luxury is not in price tags.
                    <br />
                    You're not just buying a product — you're entering
                    <br /> a space of mindful beauty, crafted to awaken
                    <br />
                    your senses and reflect your story.
                  </p>
                </div>
              </div>
              <span className="brand-line">LUXURY</span>
            </div>
          </div>
        </h1>
      </div>
    </section>
  );
};

export default BrandPillars;
