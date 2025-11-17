import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookAppointment.css";
import "@styles/grid-system.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import EditIcon from "@assets/images/icons/LT_Edit button.svg";
import { locationsAPI, handleAPIError } from "@services/api";

const BookAppointment = () => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [loading, setLoading] = useState(true);
  const timePickerRef = useRef(null);
  const datePickerRef = useRef(null);
  const progressBarRef = useRef(null);
  const cityDropdownRef = useRef(null);

  // Helper function to convert type names for display
  const getDisplayType = (type) => {
    if (type === "SHOWROOM") return "LOUNGE";
    return type;
  };
  const [formData, setFormData] = useState({
    showroomId: null,
    showroom: "",
    address: "",
    date: null,
    time: "",
    language: "English",
    title: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    additionalInfo: false,
  });

  const timeSlots = [
    { value: "9:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "17:00", label: "5:00 PM" },
  ];

  // Load locations data from API
  useEffect(() => {
    fetchLocationsData();
  }, []);

  const fetchLocationsData = async () => {
    setLoading(true);
    try {
      // Fetch locations and filter options like LocationsPage
      const [locationsResponse, filtersResponse] = await Promise.all([
        locationsAPI.getAll(),
        locationsAPI.getFilterOptions(),
      ]);

      const locationsData = locationsResponse.data || [];
      const filtersData = filtersResponse.data || {};

      // Filter all types except POD
      const nonPodLocations = locationsData.filter(
        (location) => location.type !== "POD"
      );

      setLocations(nonPodLocations);

      // Set cities from API filter options
      setCities(["All Cities", ...(filtersData.cities || [])]);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to load locations");
      console.error("Error fetching locations:", errorInfo);
      setLocations([]);
      setCities(["All Cities"]);
    } finally {
      setLoading(false);
    }
  };

  // Filter locations by selected city
  const filteredLocations = locations.filter((location) => {
    if (selectedCity === "All Cities") return true;
    return location.city === selectedCity;
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target)
      ) {
        setIsTimePickerOpen(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target)
      ) {
        setIsCityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Progress bar scroll tracking
  useEffect(() => {
    let ticking = false;

    const updateProgressBar = () => {
      if (progressBarRef.current) {
        const scrollTop = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        // Show/hide based on scroll position
        if (scrollTop < 50) {
          progressBarRef.current.style.opacity = "0";
        } else {
          progressBarRef.current.style.opacity = "1";
        }

        // Map current page scroll to total progress based on step
        // Step 1: page 0-100% maps to progress 0-33%
        // Step 2: page 0-100% maps to progress 0-66%
        // Step 3: page 0-100% maps to progress 0-100%
        let totalProgress = 0;
        if (step === 1) {
          totalProgress = scrollPercent * 0.33;
        } else if (step === 2) {
          totalProgress = scrollPercent * 0.66;
        } else if (step === 3) {
          totalProgress = scrollPercent;
        }

        progressBarRef.current.style.width = `${totalProgress}%`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgressBar);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial update
    updateProgressBar();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [step]);

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.showroomId) newErrors.showroom = "Please select a lounge";
    if (!formData.date) newErrors.date = "Please select a date";
    if (!formData.time) newErrors.time = "Please select a time";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.firstName)
      newErrors.firstName = "Please enter your first name";
    if (!formData.lastName) newErrors.lastName = "Please enter your last name";
    if (!formData.email) newErrors.email = "Please enter your email address";
    if (!formData.phone) newErrors.phone = "Please enter your phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1 && !validateStep1()) {
      return;
    }
    if (step === 2 && !validateStep2()) {
      return;
    }
    setErrors({});
    setStep(step + 1);
    // Scroll to next section
    setTimeout(() => {
      const nextSection = document.querySelector(
        `.book-section-wrapper-0${step + 1}`
      );
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleEdit = (sectionStep) => {
    // Don't change step, just scroll to the section
    setTimeout(() => {
      const section = document.querySelector(
        `.book-section-wrapper-0${sectionStep}`
      );
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDatePickerClick = () => {
    setIsDatePickerOpen((prev) => !prev);
  };

  return (
    <div className="book-appointment-page">
      <div className="scroll-progress-bar" ref={progressBarRef}></div>

      {/* Hero Section */}
      <section className="book-hero" data-navbar-theme="white">
        <h1 className="book-hero-title heading-1--no-margin">
          Book an appointment
        </h1>
      </section>

      {/* Step 1: Schedule Appointment */}
      {step >= 1 && (
        <section
          className="book-section-wrapper book-section-wrapper-01"
          data-navbar-theme="black"
        >
          <div className="grid-container">
            <div className="book-section book-section-01 col-6 col-start-4 col-sm-12">
              <div className="book-section-number bodytext-3--no-margin">
                (1)
              </div>
              <h2 className="book-section-title heading-2--no-margin">
                Schedule your appointment
              </h2>
            </div>

            <div className="book-form-group col-6 col-start-4 col-sm-12">
              <label className="book-label bodytext-6--no-margin">
                Select a location *
              </label>
              <div className="book-city-filter-wrapper">
                <label className="book-filter-label bodytext-6--no-margin">
                  Filter by City/Province:
                </label>
                <div className="book-city-filter" ref={cityDropdownRef}>
                  <div
                    className={`book-dropdown-selected bodytext-6--no-margin ${
                      isCityDropdownOpen ? "open" : ""
                    }`}
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                  >
                    <span className="book-selected-text">
                      {selectedCity === "All Cities"
                        ? "All Cities"
                        : selectedCity}
                    </span>
                  </div>
                  {isCityDropdownOpen && (
                    <div className="book-dropdown-options">
                      {cities.map((city) => (
                        <div
                          key={city}
                          className={`book-dropdown-option bodytext-6--no-margin ${
                            selectedCity === city ? "selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedCity(city);
                            setIsCityDropdownOpen(false);
                          }}
                        >
                          {city === "All Cities" ? "All Cities" : city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="book-loading bodytext-4--no-margin">
                  Loading lounges...
                </div>
              ) : filteredLocations.length === 0 ? (
                <div className="book-no-lounges bodytext-4--no-margin">
                  No lounges available
                </div>
              ) : (
                <div className="book-showroom-info">
                  {filteredLocations.map((location) => (
                    <div key={location.id} className="book-showroom-radio">
                      <input
                        type="radio"
                        id={`showroom-${location.id}`}
                        name="showroom"
                        checked={formData.showroomId === location.id}
                        onChange={() => {
                          setFormData({
                            ...formData,
                            showroomId: location.id,
                            showroom: location.name,
                            address: `${location.address}, ${location.ward}, ${location.city}, ${location.country}`,
                          });
                          if (errors.showroom) {
                            setErrors({ ...errors, showroom: null });
                          }
                        }}
                      />
                      <label htmlFor={`showroom-${location.id}`}>
                        <div className="book-showroom-name bodytext-1--no-margin">
                          {location.name}
                        </div>
                        <div className="book-showroom-type bodytext-4--no-margin">
                          {getDisplayType(location.type)}
                        </div>
                        <div className="book-showroom-address bodytext-4--no-margin">
                          {location.address}
                        </div>
                        <div className="book-showroom-hours bodytext-4--no-margin">
                          {location.hours}
                        </div>
                        <div className="book-showroom-phone bodytext-4--no-margin">
                          {location.phone}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {errors.showroom && (
                <p className="book-error-message bodytext-6--no-margin">
                  {errors.showroom}
                </p>
              )}
            </div>

            <div className="book-form-group col-3 col-start-4 col-sm-12">
              <label className="book-label bodytext-6--no-margin">Date *</label>
              <DatePicker
                ref={datePickerRef}
                selected={formData.date}
                onChange={(date) => handleInputChange("date", date)}
                onInputClick={handleDatePickerClick}
                open={isDatePickerOpen}
                onClickOutside={() => setIsDatePickerOpen(false)}
                onSelect={() => setIsDatePickerOpen(false)}
                placeholderText="Select..."
                dateFormat="MMMM d, yyyy"
                className="book-input bodytext-5--no-margin"
                wrapperClassName="book-datepicker-wrapper"
                calendarClassName="book-datepicker-calendar"
              />
              {errors.date && (
                <p className="book-error-message bodytext-6--no-margin">
                  {errors.date}
                </p>
              )}
            </div>
            <div className="book-form-group col-3 col-start-7 col-sm-12">
              <label className="book-label bodytext-6--no-margin">Time *</label>
              <div className="book-timepicker-wrapper" ref={timePickerRef}>
                <div
                  className="book-input book-timepicker-input bodytext-5--no-margin"
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                >
                  {formData.time
                    ? timeSlots.find((slot) => slot.value === formData.time)
                        ?.label
                    : "Select..."}
                </div>
                {isTimePickerOpen && (
                  <div className="book-timepicker-dropdown">
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.value}
                        className={`book-timepicker-option bodytext-5--no-margin ${
                          formData.time === slot.value ? "selected" : ""
                        }`}
                        onClick={() => {
                          handleInputChange("time", slot.value);
                          setIsTimePickerOpen(false);
                        }}
                      >
                        {slot.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.time && (
                <p className="book-error-message bodytext-6--no-margin">
                  {errors.time}
                </p>
              )}
            </div>

            <div className="book-form-group col-6 col-start-4 col-sm-12">
              <label className="book-label bodytext-6--no-margin">
                Preferred language *
              </label>
              <div className="book-radio-group">
                <div className="book-radio-item">
                  <input
                    type="radio"
                    id="english"
                    name="language"
                    value="English"
                    checked={formData.language === "English"}
                    onChange={(e) =>
                      handleInputChange("language", e.target.value)
                    }
                  />
                  <label
                    htmlFor="english"
                    className="book-radio-label bodytext-4--no-margin"
                  >
                    English
                  </label>
                </div>
                <div className="book-radio-item">
                  <input
                    type="radio"
                    id="vietnamese"
                    name="language"
                    value="Vietnamese"
                    checked={formData.language === "Vietnamese"}
                    onChange={(e) =>
                      handleInputChange("language", e.target.value)
                    }
                  />
                  <label
                    htmlFor="vietnamese"
                    className="book-radio-label bodytext-4--no-margin"
                  >
                    Vietnamese
                  </label>
                </div>
              </div>
            </div>

            <ShineGlassButton
              theme="light"
              onClick={handleContinue}
              className="book-continue-btn col-6 col-start-4 col-sm-12"
            >
              <span className="bodytext-4--no-margin">Continue</span>
            </ShineGlassButton>
          </div>
        </section>
      )}

      {/* Step 2: Personal Information */}
      {step >= 2 && (
        <section
          className="book-section-wrapper book-section-wrapper-02"
          data-navbar-theme="black"
        >
          <div className="grid-container">
            <div className="book-section book-section-02 col-6 col-start-4 col-sm-12">
              <div className="book-section-number bodytext-3--no-margin">
                (2)
              </div>
              <h2 className="book-section-title heading-2--no-margin">
                Personal information
              </h2>
            </div>

            <div className="book-form-group col-6 col-start-4 col-sm-12">
              <label className="book-label bodytext-4--no-margin">
                Title *
              </label>
              <div className="book-radio-group horizontal">
                {["Mr", "Mrs", "Ms"].map((title) => (
                  <div className="book-radio-item" key={title}>
                    <input
                      type="radio"
                      id={title.toLowerCase()}
                      name="title"
                      value={title}
                      checked={formData.title === title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                    />
                    <label
                      htmlFor={title.toLowerCase()}
                      className="book-radio-label bodytext-4--no-margin"
                    >
                      {title}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="book-form-group col-3 col-start-4 col-sm-12">
              <label className="book-label bodytext-6--no-margin">
                First Name *
              </label>
              <input
                type="text"
                placeholder="Nguyen"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="book-input bodytext-5--no-margin"
              />
              {errors.firstName && (
                <p className="book-error-message bodytext-6--no-margin">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="book-form-group col-3 col-start-7 col-sm-12">
              <label className="book-label bodytext-6--no-margin">
                Last Name *
              </label>
              <input
                type="text"
                placeholder="Your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="book-input bodytext-5--no-margin"
              />
              {errors.lastName && (
                <p className="book-error-message bodytext-6--no-margin">
                  {errors.lastName}
                </p>
              )}
            </div>

            <div className="book-form-group col-3 col-start-4 col-sm-12">
              <label className="book-label bodytext-6--no-margin">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="book-input bodytext-5--no-margin"
              />
              {errors.email && (
                <p className="book-error-message bodytext-6--no-margin">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="book-form-group col-3 col-start-7 col-sm-12">
              <label className="book-label bodytext-6--no-margin">
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                placeholder="+840"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="book-input bodytext-5--no-margin"
              />
              {errors.phone && (
                <p className="book-error-message bodytext-6--no-margin">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="book-additional-info col-6 col-start-4 col-sm-12">
              <p className="bodytext-5--no-margin">
                Fill in all additional information
              </p>
            </div>

            <ShineGlassButton
              theme="light"
              onClick={handleContinue}
              className="book-continue-btn col-6 col-start-4 col-sm-12"
            >
              <span className="bodytext-4--no-margin">Continue</span>
            </ShineGlassButton>
          </div>
        </section>
      )}

      {/* Step 3: Booking Confirmation */}
      {step >= 3 && (
        <section
          className="book-section-wrapper book-section-wrapper-03"
          data-navbar-theme="black"
        >
          <div className="grid-container">
            <div className="book-section book-section-03 col-6 col-start-4 col-sm-12">
              <div className="book-section-number bodytext-3--no-margin">
                (3)
              </div>
              <h2 className="book-section-title heading-2--no-margin">
                Booking
              </h2>

              <div className="book-confirmation">
                <div className="book-confirmation-row">
                  <label className="book-confirmation-label bodytext-6--no-margin">
                    Select a location *
                  </label>
                  <div className="book-confirmation-value-wrapper">
                    <div className="book-confirmation-value">
                      <div className="bodytext-1--no-margin">
                        {formData.showroom}
                      </div>
                      <div className="book-confirmation-address bodytext-4--no-margin">
                        {formData.address}
                      </div>
                    </div>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      className="book-edit-icon"
                      onClick={() => handleEdit(1)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="book-confirmation-row">
                  <label className="book-confirmation-label bodytext-6--no-margin">
                    Date *
                  </label>
                  <div className="book-confirmation-value-wrapper">
                    <div className="book-confirmation-value bodytext-1--no-margin">
                      {formData.date
                        ? formData.date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "October 25, 2025"}
                    </div>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      className="book-edit-icon"
                      onClick={() => handleEdit(1)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="book-confirmation-row">
                  <label className="book-confirmation-label bodytext-6--no-margin">
                    Time *
                  </label>
                  <div className="book-confirmation-value-wrapper">
                    <div className="book-confirmation-value bodytext-1--no-margin">
                      {formData.time || "5 PM"}
                    </div>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      className="book-edit-icon"
                      onClick={() => handleEdit(1)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="book-confirmation-row">
                  <label className="book-confirmation-label bodytext-6--no-margin">
                    Preferred language *
                  </label>
                  <div className="book-confirmation-value-wrapper">
                    <div className="book-confirmation-value bodytext-1--no-margin">
                      {formData.language}
                    </div>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      className="book-edit-icon"
                      onClick={() => handleEdit(1)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="book-confirmation-row">
                  <label className="book-confirmation-label bodytext-6--no-margin">
                    Personal information *
                  </label>
                  <div className="book-confirmation-value-wrapper">
                    <div className="book-confirmation-value bodytext-1--no-margin">
                      {formData.title} {formData.firstName || "Linh"}{" "}
                      {formData.lastName || "Nguyen"}
                    </div>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      className="book-edit-icon"
                      onClick={() => handleEdit(2)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="book-confirmation-row">
                  <label className="book-confirmation-label bodytext-6--no-margin">
                    Email Address *
                  </label>
                  <div className="book-confirmation-value-wrapper">
                    <div className="book-confirmation-value bodytext-1--no-margin">
                      {formData.email || "linh@gmail.com"}
                    </div>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      className="book-edit-icon"
                      onClick={() => handleEdit(2)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <div className="book-confirmation-row">
                  <label className="book-confirmation-label bodytext-6--no-margin">
                    Phone / WhatsApp *
                  </label>
                  <div className="book-confirmation-value-wrapper">
                    <div className="book-confirmation-value bodytext-1--no-margin">
                      {formData.phone || "(+84) 793-973-234"}
                    </div>
                    <img
                      src={EditIcon}
                      alt="Edit"
                      className="book-edit-icon"
                      onClick={() => handleEdit(2)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>

                <ShineGlassButton
                  theme="light"
                  className="book-submit-btn col-6 col-start-4 col-sm-12"
                >
                  <span className="bodytext-4--no-margin">
                    Book this appointment
                  </span>
                </ShineGlassButton>

                <p className="book-confirmation-note bodytext-6--no-margin">
                  You'll receive an email confirmation
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default BookAppointment;
