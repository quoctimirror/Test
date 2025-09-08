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

      {/* Main content */}
      {/* <div className="welcome-content">
        <h1 className="welcome-title">
          <span className="title-line-1">Welcome to</span>
          <span className="title-line-2">MIRROR</span>
        </h1>
      </div> */}
    </div>
  );
};

export default WelcomePage;
