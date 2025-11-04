import React from "react";
import "./Section2.css";

const Section2 = () => {
  return (
    <section className="pv2-section2-container">
      <div className="pv2-section2-wrapper">
        <div className="pv2-section2-content">
          <div className="pv2-section2-header">
            <p className="pv2-section2-collection">THE FIRST COLLECTION</p>
            <h2 className="pv2-section2-title heading-1--no-margin">
              LUMINA RING
            </h2>
            <p className="pv2-section2-subtitle">
              The LUMINA Band features five perfectly calibrated future diamonds
              round brilliant diamonds, each 0.5ct, symbolizing five
              transformative chapters of your journey. Set in a shared-prong
              aerial band, this ring captures light from every angle - soft,
              luminous, and unmistakably personal.
            </p>
          </div>

          {/* Configuration Details */}
          <div className="pv2-section2-config-details">
            <div className="pv2-section2-config-row">
              <span className="pv2-section2-config-label bodytext-6--no-margin">Shape</span>
              <span className="pv2-section2-config-value bodytext-3--no-margin">Pear</span>
            </div>
            <div className="pv2-section2-config-row">
              <span className="pv2-section2-config-label bodytext-6--no-margin">Metal</span>
              <span className="pv2-section2-config-value bodytext-3--no-margin">18k Yellow Gold</span>
            </div>
            <div className="pv2-section2-config-row">
              <span className="pv2-section2-config-label bodytext-6--no-margin">Band</span>
              <span className="pv2-section2-config-value bodytext-3--no-margin">Single band</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section2;
