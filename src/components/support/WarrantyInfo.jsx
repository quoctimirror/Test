import React from 'react';

const WarrantyInfo = () => {
  return (
    <div className="warranty-info">
      <div className="header-section">
        <h2>Created by Science. Crafted for Eternity.</h2>
        <p>
          Each Mirror piece is meticulously crafted with rare precision, intention, and limited availability. 
          To preserve the integrity and exclusivity of our jewelry, we do not accept returns under any circumstances. 
          However, exchanges may be accommodated under specific conditions as outlined below.
        </p>
      </div>

      <section className="section">
        <h3>1. Limited Warranty - 12 Months</h3>
        <p>All jewelry purchased from Mirror Future Diamond is covered by a <strong>12-month limited warranty</strong>, which includes:</p>
        
        <ul>
          <li>Manufacturing defects in materials or craftsmanship</li>
          <li>Structural integrity of the setting</li>
          <li>Clasp or chain malfunction (necklaces or bracelets)</li>
          <li>Stone loosening due to workmanship issues (not customer damage)</li>
        </ul>

        <h4>What's Not Covered:</h4>
        <p>This warranty does not apply to:</p>
        <ul>
          <li>Damage caused by improper use, impact, or accidents</li>
          <li>Normal wear-and-tear, including surface scratches or abrasions</li>
          <li>Discoloration from exposure to chemicals, cosmetics, or environmental conditions</li>
          <li>Theft, loss, or misplacement</li>
          <li>Any alteration, resizing, or repair performed by a third party not authorized by Mirror</li>
        </ul>
        
        <p style={{color: '#e74c3c', fontStyle: 'italic'}}>
          Note: To maintain warranty coverage, all inspections, repairs, and modifications must be performed exclusively by Mirror or its authorized partners.
        </p>
      </section>

      <section className="section">
        <h3>2. Warranty Activation & Conditions</h3>
        <ul>
          <li>Warranty is automatically registered upon purchase through Mirror's internal system.</li>
          <li>For online purchases, please retain your digital receipt and certification documents.</li>
          <li>Proof of purchase is required for all warranty or after-care claims.</li>
        </ul>
      </section>
    </div>
  );
};

export default WarrantyInfo;