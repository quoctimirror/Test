import React from "react";
import "./SizingGuide.css";

const SizingGuide = () => {
  return (
    <div className="sizing-guide">
      <section className="section ring-size-section">
        <h3>1. Ring size</h3>
        <p>
          You can easily measure your ring size at home using just a string,
          thread, or ribbon and a ruler. Here's how:
        </p>

        <div className="step-by-step-guide">
          <h4>Step-by-Step Guide</h4>

          <div className="step wrap-step">
            <h5>
              <span className="bodytext-2">1. Wrap</span>
            </h5>
            <ul>
              <li>
                Gently wrap the string around the base of your finger, close to
                your knuckle (where a ring would sit comfortably).
              </li>
            </ul>
          </div>

          <div className="step mark-step">
            <h5>
              <span className="bodytext-2">2. Mark</span>
            </h5>
            <ul>
              <li>Mark the exact point where the string overlaps.</li>
            </ul>
          </div>

          <div className="step measure-step">
            <h5>
              <span className="bodytext-2">3. Measure</span>
            </h5>
            <ul>
              <li>
                Lay the string flat next to a ruler and measure the length in
                millimeters (mm). This number is your finger's circumference.
              </li>
            </ul>
          </div>

          <div className="step find-size-step">
            <h5>
              <span className="bodytext-2">4. Find Your Size</span>
            </h5>
            <ul>
              <li>
                Enter the measured length into our Ring Sizer tool to discover
                your ideal Mirror ring size.
              </li>
            </ul>
          </div>
        </div>

        <div className="tip-section">
          <p className="tip-text">
            Tip: For the most accurate results, measure your finger at the end
            of the day when it's at its largest, and avoid measuring when your
            hands are cold.
          </p>
        </div>

        <div className="size-chart">
          <img
            src="./support/support.png"
            alt="Ring Size Chart"
            className="chart-image"
          />
        </div>
      </section>

      <section className="section necklace-section">
        <h3>2. Necklace</h3>
        <p>
          Choose the perfect necklace length for your style:
        </p>
        <ul>
          <li>14-16 inches: Choker length, sits close to the neck</li>
          <li>18 inches: Princess length, sits at the collarbone</li>
          <li>20-24 inches: Matinee length, sits between collarbone and bust</li>
          <li>28-36 inches: Opera length, sits at the bust or below</li>
          <li>Over 36 inches: Rope length, can be doubled or tripled</li>
        </ul>
      </section>

      <section className="section bracelet-section">
        <h3>3. Bracelet</h3>
        <p>
          To measure your bracelet size:
        </p>
        <ul>
          <li>Measure your wrist with a flexible tape measure</li>
          <li>Add 0.5-1 inch for a comfortable fit</li>
          <li>Standard sizes range from 6.5 to 8 inches</li>
          <li>Consider the bracelet style - bangles need more room</li>
        </ul>
      </section>
    </div>
  );
};

export default SizingGuide;
