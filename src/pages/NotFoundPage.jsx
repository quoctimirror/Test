import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "../utils/optimizedTransitionUtils";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo(0, 0);
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  const handleGoHome = async () => {
    sessionStorage.setItem('scrollToTop', 'true');
    await optimizedTransitionUtils.transitionToRoute(navigate, "/");
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
          <div className="error-code">404</div>
          
          <div className="error-message">
            <h1>Page Not Found</h1>
            <p>
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="error-actions">
            <button 
              className="primary-button" 
              onClick={handleGoHome}
            >
              Go to Homepage
            </button>
            
            <button 
              className="secondary-button" 
              onClick={handleGoBack}
            >
              Go Back
            </button>
          </div>

          <div className="helpful-links">
            <h3>You might be looking for:</h3>
            <div className="links-grid">
              <button onClick={() => handleLinkClick("/collections")} className="helpful-link">
                <span className="link-icon">💎</span>
                <div>
                  <strong>Collections</strong>
                  <small>Browse our diamond collections</small>
                </div>
              </button>
              
              <button onClick={() => handleLinkClick("/collections")} className="helpful-link">
                <span className="link-icon">💍</span>
                <div>
                  <strong>Products</strong>
                  <small>Explore our jewelry pieces</small>
                </div>
              </button>
              
              <button onClick={() => handleLinkClick("/services")} className="helpful-link">
                <span className="link-icon">🛠️</span>
                <div>
                  <strong>Services</strong>
                  <small>Our jewelry services</small>
                </div>
              </button>
              
              <button onClick={() => handleLinkClick("/support")} className="helpful-link">
                <span className="link-icon">💬</span>
                <div>
                  <strong>Support</strong>
                  <small>Get help and support</small>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="not-found-decoration">
          <div className="diamond-shape"></div>
          <div className="diamond-shape delay-1"></div>
          <div className="diamond-shape delay-2"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;