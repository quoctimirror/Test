import React from "react";
import "./ReturnExchange.css";

const ReturnExchange = () => {
  return (
    <div className="return-exchange">
      <div className="header-section">
        <h2 className="heading-2">Created by Science. Crafted for Eternity.</h2>
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
            <p>
              <span className="bodytext-2">
                All international sales are final.
              </span>
            </p>
          </li>
          <li>
            <p>
              <span className="bodytext-2">No exchanges or returns</span> are
              accepted for international shipments.
            </p>
          </li>
          <li>
            <p>
              We strongly recommend booking{" "}
              <span className="bodytext-2">a virtual consultation</span> prior
              to purchase to ensure accurate sizing, style selection, and
              customization preferences.
            </p>
          </li>
        </ul>
      </section>

      <section className="section domestic-orders-section">
        <h3>2. Domestic Orders (Vietnam)</h3>

        <div className="subsection showroom-purchases">
          <h4>
            <span className="bodytext-2">
              1. Showroom & In-Person Purchases
            </span>
          </h4>
          <ul className="showroom-purchases-list">
            <li>
              <p>
                Exchanges may be{" "}
                <span className="bodytext-2">
                  permitted within 3 days of purchase
                </span>
                .
              </p>
            </li>
            <li>
              <p>
                Items must be returned{" "}
                <span className="bodytext-2">in person</span> to the original
                showroom.
              </p>
            </li>
            <li>
              <p>Products must be:</p>
            </li>
            <ul>
              <li>
                <p>
                  <span className="bodytext-2">Unworn and in original</span>,
                  pristine condition
                </p>
              </li>
              <li>
                <p>
                  Accompanied by all original packaging, certificates, and
                  documentation
                </p>
              </li>
            </ul>
            <li>
              <p>No refunds or store credit will be issued.</p>
            </li>
          </ul>
        </div>

        <div className="subsection nationwide-shipping">
          <h4>
            <span className="bodytext-2">2. Nationwide Shipping (Vietnam)</span>
          </h4>
          <ul className="nationwide-shipping-list">
            <li>
              <p>
                Exchange requests{" "}
                <span className="bodytext-2">
                  may be requested within 5 days
                </span>{" "}
                of confirmed delivery.
              </p>
            </li>
            <li>
              <p>
                Returned items will undergo a quality review before exchange
                approval.
              </p>
            </li>
            <li>
              <p>Items must be:</p>
            </li>
            <ul>
              <li>
                <p>Unused and undamaged</p>
              </li>
              <li>
                <p>
                  Returned with original packaging and all accompanying
                  documents
                </p>
              </li>
            </ul>
            <li>
              <p>
                Customers are responsible for{" "}
                <span className="bodytext-2">shipping and handling costs</span>{" "}
                associated with the exchange.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="section non-exchangeable-items-section">
        <h3>3. Non-Exchangeable Items</h3>
        <ul className="non-exchangeable-items-list">
          <li>
            <p>Custom or engraved items</p>
          </li>
          <li>
            <p>Earrings (for hygiene reasons)</p>
          </li>
          <li>
            <p>Promotional or discounted items</p>
          </li>
          <li>
            <p>Items without original certificates or packaging</p>
          </li>
          <li>
            <p>Damaged, altered, or worn items</p>
          </li>
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
