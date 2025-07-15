import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import "./QRPopup.css";
import config from "../../../config/index.js";
import { isValidRingId, DEFAULT_RING_ID } from "../../config/rings.js";

const QRPopup = ({ isOpen, onClose, ringId }) => {
  const [arUrl, setArUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateURL = async () => {
    setIsLoading(true);
    try {
      // Determine which ring ID to use
      const selectedRingId = ringId && isValidRingId(ringId) ? ringId : DEFAULT_RING_ID;
      
      // Tạo URL dựa trên môi trường
      let baseUrl;
      
      if (config.app.host === 'localhost') {
        // Local development - sử dụng HTTP
        baseUrl = `http://${config.app.host}:${config.app.port}`;
      } else if (config.app.baseUrl) {
        // Development/Production - sử dụng HTTPS
        baseUrl = config.app.baseUrl;
      } else {
        // Fallback - extract from API URL
        baseUrl = config.api.baseUrl.replace('/api', '');
      }
      
      // Create URL with ring ID
      const fullArUrl = `${baseUrl}/ar/rings/${selectedRingId}`;
      
      setArUrl(fullArUrl);
      
      console.log("Generated QR for URL:", fullArUrl);
      console.log("Ring ID:", selectedRingId);
    } catch (error) {
      console.error("Error generating URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateURL();
    }
  }, [isOpen, ringId]);

  if (!isOpen) return null;

  return (
    <div className="qr-popup-overlay" onClick={onClose}>
      <div className="qr-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-popup-body">
          <p className="qr-instruction-text">Scan the QR code with your mobile device and live the immersive experience.</p>
          
          <div className="qr-code-container">
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Đang tạo QR code...</p>
              </div>
            ) : arUrl ? (
              <div className="qr-code-wrapper">
                <QRCode
                  value={arUrl}
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="H"
                />
              </div>
            ) : null}
          </div>
          
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRPopup;