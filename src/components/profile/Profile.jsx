// src/pages/Profile/Profile.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@services/api"; // Use centralized API client
import "./Profile.css";
import "@styles/typography.css";
import "@styles/grid-system.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ChangePassword from "./ChangePassword";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import { useAuth } from "@/context/AuthContext";
import Orders from "./Orders";
import Services from "./Services";
import AddressBook from "./AddressBook";
import Wishlist from "./Wishlist";

const Profile = () => {
  const navigate = useNavigate();
  // Bây giờ chỉ cần 'logout' từ context, không cần 'handleApiError' nữa
  const { logout } = useAuth();
  const navTabsRef = useRef(null);

  // ... (Các state và hằng số không thay đổi)
  const titles = ["Ms", "Mrs", "Mr"];
  const navItems = [
    "My Passport",
    "Orders",
    "Services",
    "Address Book",
    "Wishlist",
  ];

  // Danh sách các quốc gia
  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bangladesh",
    "Belgium",
    "Brazil",
    "Bulgaria",
    "Cambodia",
    "Canada",
    "Chile",
    "China",
    "Colombia",
    "Croatia",
    "Czech Republic",
    "Denmark",
    "Egypt",
    "Estonia",
    "Finland",
    "France",
    "Georgia",
    "Germany",
    "Greece",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "South Korea",
    "Kuwait",
    "Latvia",
    "Lebanon",
    "Lithuania",
    "Luxembourg",
    "Malaysia",
    "Mexico",
    "Morocco",
    "Netherlands",
    "New Zealand",
    "Norway",
    "Pakistan",
    "Philippines",
    "Poland",
    "Portugal",
    "Romania",
    "Russia",
    "Saudi Arabia",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "South Africa",
    "Spain",
    "Sri Lanka",
    "Sweden",
    "Switzerland",
    "Thailand",
    "Turkey",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Vietnam",
  ];

  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    phoneNumber: "",
    nationality: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState("Orders");
  const [showChangePassword, setShowChangePassword] = useState(false);

  // ... (Các hàm validate, handleInputChange, handlePhoneChange, etc. không thay đổi)
  const validateForm = () => {
    const newErrors = {};
    const { firstName, lastName, email, phoneNumber, dateOfBirth } = formData;

    if (!firstName.trim()) newErrors.firstName = "First Name is required";
    else if (firstName.trim().length < 2)
      newErrors.firstName = "First Name must be at least 2 characters";
    else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(firstName.trim()))
      newErrors.firstName = "First Name contains invalid characters";

    if (!lastName.trim()) newErrors.lastName = "Last Name is required";
    else if (lastName.trim().length < 2)
      newErrors.lastName = "Last Name must be at least 2 characters";
    else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(lastName.trim()))
      newErrors.lastName = "Last Name contains invalid characters";

    if (!email.trim()) newErrors.email = "Email Address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Email address is invalid";

    if (phoneNumber && phoneNumber.length < 10)
      newErrors.phoneNumber = "Phone number is too short";

    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 120)
        newErrors.dateOfBirth = "Please enter a valid date of birth";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePhoneChange = (phone) => {
    setFormData((prev) => ({ ...prev, phoneNumber: phone }));
    if (errors.phoneNumber)
      setErrors((prev) => ({ ...prev, phoneNumber: null }));
  };

  const handleTitleSelect = (title) => {
    setFormData((prev) => ({ ...prev, title }));
  };

  const handleNationalityChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, nationality: value }));
    if (errors.nationality)
      setErrors((prev) => ({ ...prev, nationality: null }));
  };

  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);
  };

  const handleLogout = () => {
    logout(); // Gọi thẳng hàm logout từ context
  };

  const handleScrollRight = () => {
    if (navTabsRef.current) {
      const scrollAmount = navTabsRef.current.clientWidth * 0.7; // Scroll 70% của width
      navTabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // useEffect để lấy thông tin user - ĐƠN GIẢN HƠN RẤT NHIỀU
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Use local API through gateway
        const response = await api.get("/api/users/me");
        let userData = response.data;
        if (userData.dateOfBirth) {
          userData.dateOfBirth = userData.dateOfBirth.split("T")[0];
        }
        setFormData((prev) => ({ ...prev, ...userData }));
      } catch (error) {
        // Lỗi ở đây có nghĩa là request đã thất bại ngay cả sau khi thử lại
        console.error("Failed to fetch user profile:", error);
        setErrors({
          form: "Could not load your profile. Please log in again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // Chuyển đổi date format từ yyyy-MM-dd sang MM/dd/yyyy
    let formattedDateOfBirth = null;
    if (formData.dateOfBirth) {
      const date = new Date(formData.dateOfBirth);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      formattedDateOfBirth = `${month}/${day}/${year}`;
    }

    const payload = {
      title: formData.title,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      dateOfBirth: formattedDateOfBirth, // <-- Sử dụng format đã chuyển đổi
      phoneNumber: formData.phoneNumber,
      nationality: formData.nationality,
    };

    try {
      await api.put("/api/users/me", payload);
      // alert('Your changes have been saved successfully!');
    } catch (error) {
      console.error("Failed to save profile:", error);
      const errorMessage =
        error.response?.data?.message || "Save failed. Please try again.";
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Phần JSX return không có gì thay đổi
  if (isLoading && !formData.firstName) {
    // Chỉ hiển thị loading nếu chưa có dữ liệu
    return <div className="profile-loading">Loading Profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-form-wrapper">
        {/* Profile Header */}
        <div className="profile-header grid-container">
          <div className="profile-info col-4">
            <h1 className="heading-1--no-margin profile-name">
              {formData.firstName}
              <br />
              {formData.lastName}
            </h1>
            <div className="profile-logout" onClick={handleLogout}>
              Logout
            </div>
          </div>
          <div className="profile-center col-4">
            <div className="profile-logo"></div>
          </div>
          <div className="profile-tier col-4">
            <p className="tier-level bodytext-1--no-margin">Tier 3</p>
            <p className="tier-name bodytext-1--no-margin">hewhewe</p>
          </div>
        </div>

        {/* Header Navigation */}
        <div className="profile-nav-header">
          <nav className="profile-nav" ref={navTabsRef}>
            {navItems.map((item) => (
              <button
                key={item}
                className={`profile-nav-item ${
                  activeNavItem === item ? "active" : ""
                }`}
                onClick={() => handleNavClick(item)}
              >
                <span className="bodytext-3--no-margin">{item}</span>
              </button>
            ))}
          </nav>
          <button className="profile-nav-scroll-arrow" onClick={handleScrollRight}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="profile-form-content">
          {activeNavItem === "My Passport" && (
            <form className="profile-form" onSubmit={handleSubmit} noValidate>
            {/* Title */}
            <div className="profile-title-group">
              <label className="bodytext-3--no-margin">Title*</label>
              <div className="profile-title-options">
                {titles.map((title) => (
                  <span
                    key={title}
                    onClick={() => handleTitleSelect(title)}
                    className={`profile-title-option bodytext-3--no-margin ${
                      formData.title?.toLowerCase() === title.toLowerCase()
                        ? "active"
                        : ""
                    }`}
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="profile-field-container">
              <label className="bodytext-3--no-margin">First Name*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleInputChange}
                className="profile-form-input bodytext-3--no-margin"
                required
              />
              {errors.firstName && (
                <p className="profile-input-error bodytext-4--no-margin">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="profile-field-container">
              <label className="bodytext-3--no-margin">Last name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleInputChange}
                className="profile-form-input bodytext-3--no-margin"
                required
              />
              {errors.lastName && (
                <p className="profile-input-error bodytext-4--no-margin">
                  {errors.lastName}
                </p>
              )}
            </div>
            <div className="profile-field-container">
              <label className="bodytext-3--no-margin">Email Address*</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="profile-form-input bodytext-3--no-margin"
                required
              />
              {errors.email && (
                <p className="profile-input-error bodytext-4--no-margin">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="profile-field-container">
              <label className="bodytext-3--no-margin">Day of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ""}
                onChange={handleInputChange}
                className="profile-form-input bodytext-3--no-margin"
              />
              {errors.dateOfBirth && (
                <p className="profile-input-error bodytext-4--no-margin">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div className="profile-phone-input-container">
              <label className="bodytext-3--no-margin">Phone Number</label>
              <PhoneInput
                country={"vn"}
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                inputClass="profile-phone-input-field bodytext-3--no-margin"
                containerClass="profile-phone-input-control"
                buttonClass="profile-phone-dropdown-button"
              />
              {errors.phoneNumber && (
                <p className="profile-input-error bodytext-4--no-margin">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="profile-field-container">
              <label className="bodytext-3--no-margin">Nationality</label>
              <select
                name="nationality"
                value={formData.nationality || ""}
                onChange={handleNationalityChange}
                className="profile-form-input profile-nationality-dropdown bodytext-3--no-margin"
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            {errors.form && (
              <div className="profile-field-container">
                <p className="profile-input-error bodytext-4--no-margin">
                  {errors.form}
                </p>
              </div>
            )}

            <div className="profile-action-buttons-container">
              <ShineGlassButton
                theme="light"
                onClick={() => setShowChangePassword(true)}
                className="profile-change-password-button"
              >
                Change Password
              </ShineGlassButton>
              <ShineGlassButton
                theme="light"
                onClick={() => {}}
                className="profile-save-button"
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </ShineGlassButton>
            </div>
          </form>
          )}

          {activeNavItem === "Orders" && <Orders />}
          {activeNavItem === "Services" && <Services />}
          {activeNavItem === "Address Book" && <AddressBook />}
          {activeNavItem === "Wishlist" && <Wishlist />}
        </div>
      </div>
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

export default Profile;
