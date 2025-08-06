import React from "react";
import "./ReturnExchange.css";

const ReturnExchange = () => {
  return (
    <div className="return-exchange">
      <div className="header-section">
        <h2>Created by Science. Crafted for Eternity.</h2>
        <p>
          Each Mirror piece is meticulously crafted with rare precision,
          intention, and limited availability. To preserve the integrity and
          exclusivity of our jewelry, we do not accept returns under any
          circumstances. However, exchanges may be accommodated under specific
          conditions as outlined below.
        </p>
      </div>

      <section className="section international-orders-section">
        <h3>1. International Orders</h3>
        <ul className="international-orders-list">
          <li>
            <strong>All international sales are final.</strong>
          </li>
          <li>
            <strong>No exchanges or returns</strong> are accepted for
            international shipments.
          </li>
          <li>
            We strongly recommend booking a virtual consultation prior to
            purchase to ensure accurate sizing, style selection, and
            customization preferences.
          </li>
        </ul>
      </section>

      <section className="section domestic-orders-section">
        <h3>2. Domestic Orders (Vietnam)</h3>

        <div className="subsection showroom-purchases">
          <h4>1. Showroom & In-Person Purchases</h4>
          <ul>
            <li>
              Exchanges may be{" "}
              <strong>permitted within 3 days of purchase</strong>.
            </li>
            <li>
              Items must be returned <strong>in person</strong> to the original
              showroom.
            </li>
            <li>Products must be:</li>
            <ul>
              <li>
                <strong>Unworn and in original</strong>, pristine condition
              </li>
              <li>
                Accompanied by all original packaging, certificates, and
                documentation
              </li>
            </ul>
            <li>No refunds or store credit will be issued.</li>
          </ul>
        </div>

        <div className="subsection nationwide-shipping">
          <h4>2. Nationwide Shipping (Vietnam)</h4>
          <ul>
            <li>
              Exchange requests <strong>may be requested within 5 days</strong>{" "}
              <strong>of confirmed delivery</strong>.
            </li>
            <li>
              Returned items will undergo a <strong>quality review</strong>{" "}
              before exchange approval.
            </li>
            <li>Items must be:</li>
            <ul>
              <li>Unused and undamaged</li>
              <li>
                Returned with original packaging and all accompanying documents
              </li>
            </ul>
            <li>
              Customers are responsible for{" "}
              <strong>shipping and handling costs</strong> associated with the
              exchange.
            </li>
          </ul>
        </div>
      </section>

      <section className="section non-exchangeable-items-section">
        <h3>3. Non-Exchangeable Items</h3>
        <ul>
          <li>Custom or engraved items</li>
          <li>Earrings (for hygiene reasons)</li>
          <li>Promotional or discounted items</li>
          <li>Items without original certificates or packaging</li>
          <li>Damaged, altered, or worn items</li>
        </ul>
      </section>

      <section className="section why-sales-final-section">
        <h3>4. Why All Sales Are Final</h3>
        <p>
          Every piece Mirror creates represents an exclusive release — crafted
          not only for beauty, but meaning. Limiting returns and minimizing
          exchanges ensure each customer receives a piece that has never been
          worn, tried, or handled by others — preserving the emotion, quality,
          and soul of your diamond.
        </p>
      </section>
    </div>
  );
};

export default ReturnExchange;
