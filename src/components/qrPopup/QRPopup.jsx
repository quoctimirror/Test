import React, { useState, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";
import "./QRPopup.css";
import config from "@config/index.js";
import { isValidRingId, DEFAULT_RING_ID } from "@config/models/rings.js";

const QRPopup = ({ isOpen, onClose, ringId }) => {
  const [arUrl, setArUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateURL = useCallback(async () => {
    setIsLoading(true);
    try {
      // Debug logging
      console.log("=== QR Code Debug Info ===");
      console.log("Current hostname:", window.location.hostname);
      console.log("Vite MODE:", import.meta.env?.MODE);
      console.log("Config object:", config);
      console.log("Config app:", config.app);

      // Determine which ring ID to use
      const selectedRingId =
        ringId && isValidRingId(ringId) ? ringId : DEFAULT_RING_ID;

      // Create URL based on environment
      let baseUrl;

      // Force detection based on current URL for Vercel deployment
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname;

        if (hostname.includes("vercel.app")) {
          // Development/staging environment
          baseUrl = "https://mirror-clone-eight.vercel.app";
          console.log("Detected Vercel development environment");
        } else if (hostname.includes("mirror-diamond.com")) {
          // Production environment
          baseUrl = "https://mirror-diamond.com";
          console.log("Detected production environment");
        } else if (hostname === "localhost" || hostname === "127.0.0.1") {
          // Local development
          baseUrl = `http://${hostname}:${config.app.port || 5173}`;
          console.log("Detected local development environment");
        } else {
          // Unknown environment - use current location
          baseUrl = `${window.location.protocol}//${window.location.host}`;
          console.log("Unknown environment, using current location");
        }
      } else {
        // Server-side fallback
        baseUrl = config.app.baseUrl || config.api.baseUrl.replace("/api", "");
        console.log("Server-side fallback");
      }

      // Create URL with ring ID
      const fullArUrl = `${baseUrl}/ar/rings/${selectedRingId}`;

      setArUrl(fullArUrl);

      console.log("Final base URL:", baseUrl);
      console.log("Generated QR for URL:", fullArUrl);
      console.log("Ring ID:", selectedRingId);
      console.log("=== End Debug Info ===");
    } catch (error) {
      console.error("Error generating URL:", error);
    } finally {
      setIsLoading(false);
    }
  }, [ringId]);

  useEffect(() => {
    if (isOpen) {
      generateURL();
    }
  }, [isOpen, ringId, generateURL]);

  if (!isOpen) return null;

  return (
    <div className="qr-popup-overlay" onClick={onClose}>
      <div className="qr-popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-popup-body">
          <p className="qr-instruction-text">
            Scan the QR code with your mobile device and live the immersive
            experience.
          </p>

          <div className="qr-code-container">
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Generating QR code...</p>
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
