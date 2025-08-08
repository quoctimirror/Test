import React from "react";
import { Link } from "react-router-dom";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    sessionStorage.setItem('scrollToTop', 'true');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <div className="error-boundary-container">
            <div className="error-boundary-content">
              <div className="error-code">500</div>
              
              <div className="error-message">
                <h1>Something went wrong</h1>
                <p>
                  We encountered an unexpected error. Please try reloading the page
                  or go back to the homepage.
                </p>
              </div>

              <div className="error-actions">
                <button 
                  className="primary-button" 
                  onClick={this.handleReload}
                >
                  Reload Page
                </button>
                
                <button 
                  className="secondary-button" 
                  onClick={this.handleGoHome}
                >
                  Go to Homepage
                </button>
              </div>

              {/* Show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="error-details">
                  <summary>Error Details (Development Only)</summary>
                  <div className="error-stack">
                    <h4>Error:</h4>
                    <pre>{this.state.error && this.state.error.toString()}</pre>
                    
                    <h4>Component Stack:</h4>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              )}

              <div className="helpful-links">
                <h3>Need help?</h3>
                <div className="links-grid">
                  <Link to="/support" className="helpful-link">
                    <span className="link-icon">💬</span>
                    <div>
                      <strong>Contact Support</strong>
                      <small>Get help from our team</small>
                    </div>
                  </Link>
                  
                  <Link to="/collections" className="helpful-link">
                    <span className="link-icon">💎</span>
                    <div>
                      <strong>Browse Collections</strong>
                      <small>Explore our jewelry</small>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="error-boundary-decoration">
              <div className="diamond-shape"></div>
              <div className="diamond-shape delay-1"></div>
              <div className="diamond-shape delay-2"></div>
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;