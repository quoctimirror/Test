import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./EmailVerification.css";
import { authAPI } from "@/services/api";
import { ROUTES } from "@/constants/routes";

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
              <div className="verification-icon success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="64"
                  height="64"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h2>Email Verified!</h2>
              <p>{message}</p>
              <p className="redirect-message">
                Redirecting to login page in a few seconds...
              </p>
            </>
          )}

          {status === "error" && (
            <>
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
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <button onClick={handleBackToLogin} className="back-to-login-btn">
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
