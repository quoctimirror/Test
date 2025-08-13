import React from "react";
import GlassButton from "../common/GlassButton";

const TradeInUpgrade = () => {
  return (
    <div className="trade-in-upgrade">
      <div className="intro-section">
        <h2>Trade-In & Upgrade Programs</h2>
        <p>
          Mirror's "Reclaim & Renew" program allows you to trade in eligible
          pieces in the future toward upgraded designs— a promise of continuous
          evolution in your jewelry journey.
        </p>
        <p className="availability-note">
          <em>Details available in showroom or by inquiry.</em>
        </p>
      </div>

      <div className="how-it-works-section">
        <h2>How it works</h2>

        <div className="process-item">
          <ul>
            <li>
              <p>
                <strong>Trade-In Value:</strong>
              </p>
              <ul>
                <li>
                  <p>
                    When you're ready for a new design, bring in your eligible
                    Mirror jewelry. We will assess its condition and provide a
                    trade-in value, which can be applied as credit toward your
                    next purchase.
                  </p>
                </li>
              </ul>
            </li>
            <li>
              <p>
                <strong>Eligibility Criteria</strong>
              </p>
              <ul>
                <li>
                  <p>Must be a piece originally purchased from Mirror</p>
                </li>
                <li>
                  <p>
                    Jewelry must pass a quality and authenticity inspection by
                    our specialists
                  </p>
                </li>
                <li>
                  <p>
                    Trade-in is only applicable toward the purchase of a new
                    piece of greater or equal value
                  </p>
                </li>
              </ul>
            </li>
            <li>
              <p>
                <strong>Upgrade Opportunities</strong>
              </p>
              <ul>
                <li>
                  <p>
                    Choose from our latest collections or create a custom piece.
                    The program allows you to evolve your style while retaining
                    the value of your original piece.
                  </p>
                </li>
              </ul>
            </li>
            <li>
              <p>
                <strong>Sustainable Luxury</strong>
              </p>
              <ul>
                <li>
                  <p>
                    Reclaim & Renew is also a commitment to
                    sustainability—giving your existing jewelry a second life
                    and reducing waste while enhancing your collection.
                  </p>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="note-section">
          <p className="note-text">
            <em>
              Full program details, eligibility assessments, and upgrade
              consultations are available at our showroom or by direct inquiry.
              Appointments are recommended.
            </em>
          </p>
        </div>
      </div>

      <div className="cta-section">
        <GlassButton
          className="services-cta"
          theme="default"
          width={220}
          height={57}
          fontSize={14}
        >
          Book an Appointment
        </GlassButton>
      </div>
    </div>
  );
};

export default TradeInUpgrade;
