import React from 'react';
import './SizingGuide.css';

const SizingGuide = () => {
  return (
    <div className="sizing-guide">
      <section className="section ring-size-section">
        <h3>1. Ring size</h3>
        <p>You can easily measure your ring size at home using just a string, thread, or ribbon and a ruler. Here's how:</p>
        
        <div className="step-by-step-guide">
          <h4>Step-by-Step Guide</h4>
          
          <div className="step wrap-step">
            <h5>1. Wrap</h5>
            <ul>
              <li>Gently wrap the string around the base of your finger, close to your knuckle (where a ring would sit comfortably).</li>
            </ul>
          </div>
          
          <div className="step mark-step">
            <h5>2. Mark</h5>
            <ul>
              <li>Mark the exact point where the string overlaps.</li>
            </ul>
          </div>
          
          <div className="step measure-step">
            <h5>3. Measure</h5>
            <ul>
              <li>Lay the string flat next to a ruler and measure the length in millimeters (mm). This number is your finger's circumference.</li>
            </ul>
          </div>
          
          <div className="step find-size-step">
            <h5>4. Find Your Size</h5>
            <ul>
              <li>Enter the measured length into our Ring Sizer tool to discover your ideal Mirror ring size.</li>
            </ul>
          </div>
        </div>

        <div className="tip-section">
          <p style={{color: '#e74c3c', fontStyle: 'italic'}}>
            Tip: For the most accurate results, measure your finger at the end of the day when it's at its largest, and avoid measuring when your hands are cold.
          </p>
        </div>

        <div className="size-chart">
          <img src="./support/support.png" alt="Ring Size Chart" className="chart-image" />
        </div>
      </section>

      <section className="section necklace-section">
        <h3>2. Necklace</h3>
        <ul>
          <li>Unused and undamaged</li>
          <li>Returned with original packaging and all accompanying documents</li>
        </ul>
        <p>Customers are responsible for <strong>shipping and handling costs</strong> associated with the exchange.</p>
      </section>

      <section className="section bracelet-section">
        <h3>3. Bracelet</h3>
        <ul>
          <li>Custom or engraved items</li>
          <li>Earrings (for hygiene reasons)</li>
          <li>Promotional or discounted items</li>
          <li>Items without original certificates or packaging</li>
          <li>Damaged, altered, or worn items</li>
        </ul>
      </section>
    </div>
  );
};

export default SizingGuide;