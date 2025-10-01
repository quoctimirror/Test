import React, { useEffect, useState } from "react";
import "./WelcomePage.css";

const WelcomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div className={`welcome-page ${isLoaded ? "loaded" : ""}`}>
      {/* Background Image */}
      <div className="welcome-background-image"></div>

      {/* Logo */}
      <div className="welcome-logo">
        <img src="/welcome/welcome_logo.svg" alt="Welcome Logo" />
      </div>

      {/* Main content */}
      {/* <div className="welcome-content">
        <div className="welcome-title-section">
          <h1 className="welcome-title heading-1--no-margin">Future Diamond</h1>
        </div>

        <div className="welcome-subtitle-section">
          <h2 className="welcome-subtitle bodytext-1--no-margin">
            Is Coming Soon
          </h2>
        </div>
      </div> */}

      {/* Bottom text content */}
      <div className="welcome-bottom-text">
        <h2 className="bottom-text-line1 bodytext-1--no-margin">
          Awakening Luxury through Your Senses, in Every Time, Space, and
          Presence.
        </h2>
      </div>
    </div>
  );
};

export default WelcomePage;
