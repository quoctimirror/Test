import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./EmailVerification.css";
import { authAPI } from "@/services/api";
import { ROUTES } from "@/constants/routes";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. Token is missing.");
        return;
      }

      try {
        // Gọi API để verify email
        const response = await authAPI.verifyEmail(token);

        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");

        // Redirect về trang login sau 3 giây
        setTimeout(() => {
          navigate(ROUTES.AUTH_LOGIN);
        }, 3000);
      } catch (error) {
        setStatus("error");

        if (error.response) {
          // Lỗi từ server
          setMessage(
            error.response.data.message ||
            "Verification failed. The link may be invalid or expired."
          );
        } else if (error.request) {
          // Lỗi network
          setMessage("Cannot connect to the server. Please check your network.");
        } else {
          setMessage("An unexpected error occurred. Please try again.");
        }

        console.error("Email verification failed:", error);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleBackToLogin = () => {
    navigate(ROUTES.AUTH_LOGIN);
  };

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        <div className="email-verification-content">
          {status === "loading" && (
            <>
              <div className="verification-icon loading">
                <div className="spinner"></div>
              </div>
              <h2>Verifying your email...</h2>
              <p>Please wait while we verify your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="heading-1--no-margin verify-title">VERIFY SUCCESSFUL!</h1>
              <p className="bodytext-4--no-margin verify-message">Your account has been created</p>
              <div className="verification-icon success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="48"
                  height="48"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              <ShineGlassButton
                theme="light"
                onClick={handleBackToLogin}
                className="back-to-signin-btn"
              >
                Back to Sign in
              </ShineGlassButton>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="heading-1--no-margin verify-title error-title">VERIFICATION FAILED</h1>
              <p className="bodytext-4--no-margin verify-message error-message">{message}</p>
              <div className="verification-icon error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="64"
                  height="64"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <ShineGlassButton
                theme="light"
                onClick={handleBackToLogin}
                className="back-to-signin-btn"
              >
                Back to Sign in
              </ShineGlassButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
