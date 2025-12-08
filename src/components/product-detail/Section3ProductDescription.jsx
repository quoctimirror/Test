import React from "react";
import "./Section3ProductDescription.css";

const Section3ProductDescription = ({ product }) => {
  if (!product?.description && !product?.longDescription) {
    return null;
  }

  return (
    <div className="section3-product-description" data-navbar-theme="black">
      <div className="product-description-container">
        <div className="description-content">
          <div className="description-header">
            <h2 className="description-title heading-2--no-margin">
              About This Piece
            </h2>
          </div>

          <div className="description-body">
            {product?.longDescription && (
              <div className="long-description bodytext-3--no-margin">
                {product.longDescription.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx}>{paragraph}</p>
                ))}
              </div>
            )}

            {!product?.longDescription && product?.description && (
              <div className="short-description bodytext-3--no-margin">
                <p>{product.description}</p>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {(product?.careInstructions || product?.notes || product?.customizationOptions) && (
            <div className="description-extras">
              {product?.careInstructions && (
                <div className="extra-section">
                  <h3 className="extra-title bodytext-3--no-margin">
                    Care Instructions
                  </h3>
                  <p className="extra-content bodytext-4--no-margin">
                    {product.careInstructions}
                  </p>
                </div>
              )}

              {product?.customizationOptions && (
                <div className="extra-section">
                  <h3 className="extra-title bodytext-3--no-margin">
                    Customization Options
                  </h3>
                  <p className="extra-content bodytext-4--no-margin">
                    {product.customizationOptions}
                  </p>
                </div>
              )}

              {product?.notes && (
                <div className="extra-section">
                  <h3 className="extra-title bodytext-3--no-margin">
                    Additional Notes
                  </h3>
                  <p className="extra-content bodytext-4--no-margin">
                    {product.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Certifications */}
          {(product?.certificationUrl || product?.certificationNumber) && (
            <div className="description-certifications">
              <h3 className="cert-title bodytext-3--no-margin">
                Certifications & Authenticity
              </h3>
              <div className="cert-info">
                {product?.certificationNumber && (
                  <div className="cert-item">
                    <span className="cert-label">Certificate Number:</span>
                    <span className="cert-value">{product.certificationNumber}</span>
                  </div>
                )}
                {product?.certificationUrl && (
                  <div className="cert-item">
                    <a
                      href={product.certificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cert-link"
                    >
                      View Certificate
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Section3ProductDescription;
