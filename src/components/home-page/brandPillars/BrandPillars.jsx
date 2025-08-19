import "./BrandPillars.css";

const BrandPillars = () => {
  return (
    <section className="brand-pillars">
      <div className="brand-pillars-content">
        <h1 className="brand-pillars-text">
          <div className="brand-group">
            <div className="brand-main-text">
              <span className="brand-line">PRECISION</span>
              <div className="brand-line-with-expand">
                <span className="brand-line">TECHNOLOGY</span>
                <div className="brand-expand-text">
                  <p className="bodytext-3--no-margin">
                    Where human craft meets cutting-edge technology.
                    <br />
                    We shape diamonds with the world's most advanced cutting
                    techniques —<br />
                    each one a fusion of human artistry and scientific
                    precision.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="brand-group">
            <div className="brand-expand-text">
              <p className="bodytext-3--no-margin">
                Made for the planet, not taken from it.
                <br />
                We create with the future in mind — lab-grown brilliance
                <br />
                that honors our planet, not extracts from it.
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
                <div className="brand-expand-text">
                  <p className="bodytext-3--no-margin">
                    True modern luxury is not in price tags.
                    <br />
                    You're not just buying a product — you're entering a space
                    of mindful beauty,
                    <br />
                    crafted to awaken your senses and reflect your story.
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
