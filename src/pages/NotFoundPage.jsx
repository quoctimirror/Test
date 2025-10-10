import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import ShineGlassButton from "@/components/common/button/ShineGlassButton";
import "./NotFoundPage.css";
import { ROUTES } from "@/constants/routes";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem("scrollToTop") === "true") {
      window.scrollTo(0, 0);
      sessionStorage.removeItem("scrollToTop");
    }
  }, []);

  const handleGoHome = async () => {
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.HOME);
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleLinkClick = async (route) => {
    await optimizedTransitionUtils.transitionToRoute(navigate, route);
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code heading-2--no-margin">404</div>

          <div className="error-message">
            <h1 className="heading-1--no-margin">PAGE NOT FOUND</h1>
            <p className="bodytext-3--no-margin">
              This page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="error-actions">
            <ShineGlassButton theme="footer" onClick={handleGoBack}>
              Go back
            </ShineGlassButton>

            <ShineGlassButton theme="light" onClick={handleGoHome}>
              Homepage
            </ShineGlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
