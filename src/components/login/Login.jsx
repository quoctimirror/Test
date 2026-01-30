import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import { useAuth } from "@/context/AuthContext";
import EyeIconSvg from "@assets/images/icons/EyeIcon.svg";
import EyeSlashIconSvg from "@assets/images/icons/EyeSlashIcon.svg";
import { ROUTES } from "@/constants/routes";
import ShineGlassButton from "@/components/common/button/ShineGlassButton";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when component mounts (when navigating from register)
  useEffect(() => {
    setLoginInput("");
    setPassword("");
    setShowPassword(false);
    setErrors({});

    // Force reset any cached styles
    const passwordToggles = document.querySelectorAll(".password-toggle");
    passwordToggles.forEach((toggle) => {
      toggle.style.color = "var(--transparent-black-50, rgba(0, 0, 0, 0.50))";
    });
  }, []);

  const isEmailFormat = (input) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(input).toLowerCase());
  };

  const hasWhitespace = (input) => /\s/.test(input);

  const validateForm = () => {
    const newErrors = {};
    const trimmedLoginInput = loginInput.trim();
    if (!trimmedLoginInput) {
      newErrors.login = "Username or Email is required";
    } else if (
      !isEmailFormat(trimmedLoginInput) &&
      hasWhitespace(trimmedLoginInput)
    ) {
      newErrors.login = "Username cannot contain spaces";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    // Convert to async function
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear old errors before calling API

    const payload = {
      username: loginInput.trim(),
      password: password,
    };

    try {
      // Use login function from AuthContext
      await login(payload.username, payload.password);

      // Return to previous page (if redirected from another page), otherwise go to Profile
      const from = location.state?.from;
      if (from) {
        navigate(from.pathname, { replace: true, state: from.state });
      } else {
        navigate(ROUTES.USER_PROFILE, { replace: true });
      }
    } catch (error) {
      // --- HANDLE FAILURE ---
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.response) {
        // Server error (4xx, 5xx)
        console.error("API Error:", error.response.data);
        errorMessage =
          error.response.data.message || "Invalid username or password.";
        if (error.response.status === 401) {
          setErrors({ password: "Password is incorrect." });
        } else {
          setErrors({ login: "User not found or account is locked." });
        }
      } else if (error.request) {
        // Cannot connect to server
        errorMessage =
          "Cannot connect to the server. Please check your network.";
        setErrors({ form: errorMessage });
      }
      console.error("Login failed:", error);
      // You can display this error on the form
      // setErrors(prev => ({...prev, form: errorMessage}));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
    if (errors[e.target.name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: null }));
    }
  };

  return (
    <div className="login-container" data-navbar-theme="black">
      <div className="login-form-wrapper">
        <h1 className="heading-1--no-margin login-title">WELCOME BACK!</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* === CHANGES START HERE === */}

          {/* Input group for Username/Email */}
          <div className="form-field-container">
            <div className="input-group">
              <input
                type="text"
                id="login"
                name="login"
                value={loginInput}
                onChange={(e) => handleInputChange(e, setLoginInput)}
                placeholder=" "
                required
              />
              <label
                htmlFor="login"
                className="bodytext-3--no-margin floating-label"
              >
                Username/Email
              </label>
            </div>
            {/* Move error outside input-group */}
            {errors.login && (
              <p className="bodytext-4--no-margin input-error">
                {errors.login}
              </p>
            )}
          </div>

          {/* Input group for Password */}
          <div className="form-field-container">
            <div className="input-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => handleInputChange(e, setPassword)}
                placeholder=" "
                required
              />
              <label
                htmlFor="password"
                className="bodytext-3--no-margin floating-label"
              >
                Password
              </label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <img
                  src={showPassword ? EyeSlashIconSvg : EyeIconSvg}
                  alt={showPassword ? "Hide password" : "Show password"}
                  width="20"
                  height="20"
                />
              </button>
            </div>
            {/* Move error outside input-group */}
            {errors.password && (
              <p className="bodytext-4--no-margin input-error">
                {errors.password}
              </p>
            )}
          </div>

          {/* === END OF CHANGES === */}

          <div className="forgot-password-wrapper">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="bodytext-4--no-margin forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>

          <ShineGlassButton
            type="submit"
            theme="light"
            disabled={isLoading}
            className="sign-in-button"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </ShineGlassButton>
        </form>

        <p className="bodytext-3--no-margin register-prompt">
          Not a member?{" "}
          <Link
            to={ROUTES.AUTH_REGISTER}
            className="bodytext-3--no-margin register-link"
          >
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
