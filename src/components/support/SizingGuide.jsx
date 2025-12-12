import React from "react";
import MediaImage from "@components/common/media/MediaImage";
import "./SizingGuide.css";

const SizingGuide = () => {
  return (
    <div className="sizing-guide">
      <section className="section ring-size-section">
        <h3 className="heading-3--no-margin">1. Ring size</h3>
        <p className="bodytext-4--no-margin">
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
                <p className="bodytext-4--no-margin">
                  Gently wrap the string around the base of your finger, close
                  to your knuckle (where a ring would sit comfortably).
                </p>
              </li>
            </ul>
          </div>

          <div className="step mark-step">
            <h5>
              <span className="bodytext-2">2. Mark</span>
            </h5>
            <ul>
              <li>
                <p className="bodytext-4--no-margin">
                  Mark the exact point where the string overlaps.
                </p>
              </li>
            </ul>
          </div>

          <div className="step measure-step">
            <h5>
              <span className="bodytext-2">3. Measure</span>
            </h5>
            <ul>
              <li>
                <p className="bodytext-4--no-margin">
                  Lay the string flat next to a ruler and measure the length in
                  millimeters (mm). This number is your finger's circumference.
                </p>
              </li>
            </ul>
          </div>

          <div className="step find-size-step">
            <h5>
              <span className="bodytext-2">4. Find Your Size</span>
            </h5>
            <ul>
              <li>
                <p className="bodytext-4--no-margin">
                  Enter the measured length into our Ring Sizer tool to discover
                  your ideal Mirror ring size.
                </p>
              </li>
            </ul>
          </div>
        </div>

        <div className="tip-section">
          <p className="tip-text bodytext-6--no-margin">
            Tip: For the most accurate results, measure your finger at the end
            of the day when it's at its largest, and avoid measuring when your
            hands are cold.
          </p>
        </div>

        <div className="size-chart">
          <MediaImage
            src="support/support.webp"
            alt="Ring Size Chart"
            className="chart-image"
          />
        </div>
      </section>

      <section className="section necklace-section">
        <h3 className="heading-3--no-margin">2. Necklace</h3>
        <p className="bodytext-4--no-margin">
          Choose the perfect necklace length for your style:
        </p>
        <ul>
          <li>
            <p className="bodytext-4--no-margin">
              14-16 inches: Choker length, sits close to the neck
            </p>
          </li>
          <li>
            <p className="bodytext-4--no-margin">
              18 inches: Princess length, sits at the collarbone
            </p>
          </li>
          <li>
            <p className="bodytext-4--no-margin">
              20-24 inches: Matinee length, sits between collarbone and bust
            </p>
          </li>
          <li>
            <p className="bodytext-4--no-margin">
              28-36 inches: Opera length, sits at the bust or below
            </p>
          </li>
          <li>
            <p className="bodytext-4--no-margin">
              Over 36 inches: Rope length, can be doubled or tripled
            </p>
          </li>
        </ul>
      </section>

      <section className="section bracelet-section">
        <h3 className="heading-3--no-margin">3. Bracelet</h3>
        <p className="bodytext-4--no-margin">To measure your bracelet size:</p>
        <ul>
          <li>
            <p className="bodytext-4--no-margin">
              Measure your wrist with a flexible tape measure
            </p>
          </li>
          <li>
            <p className="bodytext-4--no-margin">
              Add 0.5-1 inch for a comfortable fit
            </p>
          </li>
          <li>
            <p className="bodytext-4--no-margin">
              Standard sizes range from 6.5 to 8 inches
            </p>
          </li>
          <li>
            <p className="bodytext-4--no-margin">
              Consider the bracelet style - bangles need more room
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default SizingGuide;
