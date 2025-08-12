import React from "react";
import "./WarrantyInfo.css";

const WarrantyInfo = () => {
  return (
    <div className="warranty-info">
      <div className="header-section">
        <h2 className="heading-3">Created by Science. Crafted for Eternity.</h2>
        <p>
          Each Mirror piece is meticulously crafted with rare precision,
          intention, and limited availability. To preserve the integrity and
          exclusivity of our jewelry, we do not accept returns under any
          circumstances. However, exchanges may be accommodated under specific
          conditions as outlined below.
        </p>
      </div>

      <section className="section limited-warranty-section">
        <h3>1. Limited Warranty - 12 Months</h3>
        <div className="warranty-overview">
          <p>
            All jewelry purchased from Mirror Future Diamond is covered by a{" "}
            <span className="bodytext-2">12-month limited warranty</span>, which
            includes:
          </p>

          <div className="warranty-covered">
            <ul>
              <li>Manufacturing defects in materials or craftsmanship</li>
              <li>Structural integrity of the setting</li>
              <li>Clasp or chain malfunction (necklaces or bracelets)</li>
              <li>
                Stone loosening due to workmanship issues (not customer damage)
              </li>
            </ul>
          </div>
        </div>

        <div className="warranty-exclusions">
          <h4>
            <span className="bodytext-2">What's Not Covered:</span>
          </h4>
          <p>This warranty does not apply to:</p>
          <ul>
            <li>Damage caused by improper use, impact, or accidents</li>
            <li>
              Normal wear-and-tear, including surface scratches or abrasions
            </li>
            <li>
              Discoloration from exposure to chemicals, cosmetics, or
              environmental conditions
            </li>
            <li>Theft, loss, or misplacement</li>
            <li>
              Any alteration, resizing, or repair performed by a third party not
              authorized by Mirror
            </li>
          </ul>
        </div>

        <div className="warranty-note">
          <p className="warranty-note-text">
            Note: To maintain warranty coverage, all inspections, repairs, and
            modifications must be performed exclusively by Mirror or its
            authorized partners.
          </p>
        </div>
      </section>

      <section className="section warranty-activation-section">
        <h3>2. Warranty Activation & Conditions</h3>
        <div className="activation-details">
          <ul>
            <li>
              Warranty is automatically registered upon purchase through
              Mirror's internal system.
            </li>
            <li>
              For online purchases, please retain your digital receipt and
              certification documents.
            </li>
            <li>
              Proof of purchase is required for all warranty or after-care
              claims.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default WarrantyInfo;
