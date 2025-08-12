import React from "react";
import "./Section1.css";

const Section1 = () => {
  return (
    <section className="services-section1">
      <div className="section1-background-overlay"></div>
      <div className="section1-container">
        <div className="section1-content">
          <h1 className="section1-title heading-1--no-margin">MIRROR SERVICES</h1>
          <p className="section1-description bodytext-3--no-margin">
            To honour the personal story behind every Mirror creation, we are{" "}
            <br />
            committed to accompanying each piece through time — with thoughtful
            <br />
            care and services that preserve its brilliance, meaning, and
            emotional
            <br /> connection.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Section1;
