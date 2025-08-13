import React, { useState } from "react";
import api from "../../api/axiosConfig";
import "./ChangePassword.css";
import EyeIconSvg from "../../assets/images/icons/EyeIcon.svg";
import EyeSlashIconSvg from "../../assets/images/icons/EyeSlashIcon.svg";
import GlassButton from "../common/GlassButton";

const ChangePassword = ({ onClose }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // SỬA TÊN FUNCTION
  const getAuthToken = () => {
    const accessToken =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    console.log("AccessToken found:", !!accessToken);
    console.log(
      "Token preview:",
      accessToken ? accessToken.substring(0, 50) + "..." : "null"
    );
    return accessToken;
  };

  const validateForm = () => {
    const newErrors = {};
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const accessToken = getAuthToken(); // SỬA TÊN FUNCTION CALL

      if (!accessToken) {
        console.error("No accessToken found in storage");
        setErrors({ form: "Please login again to change password" });
        setIsLoading(false);
        return;
      }

      console.log("Sending request to change password...");

      const response = await api.post("/api/v1/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      console.log("Password changed successfully:", response.data);
      alert("Password changed successfully!");
      onClose();
    } catch (error) {
      console.error("Password change failed:", error);
      console.error("Error response:", error.response?.data);

      if (error.response?.status === 401) {
        setErrors({ form: "Session expired. Please login again." });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to change password. Please try again.";
        setErrors({ form: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-overlay">
      <div className="change-password-modal">
        <div className="change-password-header">
          <h2>Change Password</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-field-container">
            <label className="form-field-label">Current Password*</label>
            <div className="password-input-container">
              <input
                type={showPasswords.currentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                className="form-input password-input"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("currentPassword")}
                aria-label={
                  showPasswords.currentPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <img
                  src={
                    showPasswords.currentPassword ? EyeSlashIconSvg : EyeIconSvg
                  }
                  alt={
                    showPasswords.currentPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  width="20"
                  height="20"
                />
              </button>
            </div>
            {errors.currentPassword && (
              <p className="input-error">{errors.currentPassword}</p>
            )}
          </div>

          <div className="form-field-container">
            <label className="form-field-label">New Password*</label>
            <div className="password-input-container">
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                className="form-input password-input"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("newPassword")}
                aria-label={
                  showPasswords.newPassword ? "Hide password" : "Show password"
                }
              >
                <img
                  src={showPasswords.newPassword ? EyeSlashIconSvg : EyeIconSvg}
                  alt={
                    showPasswords.newPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  width="20"
                  height="20"
                />
              </button>
            </div>
            {errors.newPassword && (
              <p className="input-error">{errors.newPassword}</p>
            )}
          </div>

          <div className="form-field-container">
            <label className="form-field-label">Confirm New Password*</label>
            <div className="password-input-container">
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                className="form-input password-input"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                aria-label={
                  showPasswords.confirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <img
                  src={
                    showPasswords.confirmPassword ? EyeSlashIconSvg : EyeIconSvg
                  }
                  alt={
                    showPasswords.confirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  width="20"
                  height="20"
                />
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="input-error">{errors.confirmPassword}</p>
            )}
          </div>

          {errors.form && (
            <div className="form-field-container">
              <p className="input-error">{errors.form}</p>
            </div>
          )}

          <div className="change-password-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <GlassButton
              width={150}
              height={50}
              theme="outline"
              onClick={() => {}}
              className="submit-button"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </GlassButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
