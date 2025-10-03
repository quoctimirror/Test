import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SubmitForm.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import { fileUploadAPI, notificationsAPI } from "@services/api";

const SubmitForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    designerName: "",
    contactEmail: "",
    phone: "",
    location: "",
    website: "",
    instagram: "",
    tiktok: "",
    portfolioLink: "",
    categories: [],
    priceRange: "",
    productionCapacity: "",
    readiness: "",
    portfolioFile: null,
    portfolioFileUrl: "",
    heroImages: [],
    heroImagesUrls: [],
    videoLookbook: "",
    collaborationInterests: [],
    brandStory: "",
    agreeToContact: false,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [fileErrors, setFileErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // File size limits (in bytes)
  const FILE_SIZE_LIMITS = {
    portfolioFile: 20 * 1024 * 1024, // 20MB
    heroImages: 3 * 1024 * 1024, // 3MB per image
  };

  // File count limits
  const FILE_COUNT_LIMITS = {
    heroImages: 5, // up to 5 images
  };

  // Accepted file types
  const ACCEPTED_FILE_TYPES = {
    portfolioFile: [".pdf"],
    heroImages: [".jpg", ".jpeg", ".png"],
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper function to validate file size
  const validateFileSize = (file, maxSize) => {
    return file.size <= maxSize;
  };

  // Helper function to validate file type
  const validateFileType = (file, acceptedTypes) => {
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();
    return acceptedTypes.includes(fileExtension);
  };

  // Remove file from hero images
  const removeHeroImage = (indexToRemove) => {
    const updatedFiles = formData.heroImages.filter(
      (_, index) => index !== indexToRemove
    );
    setFormData((prev) => ({ ...prev, heroImages: updatedFiles }));

    // Clear any file count errors when removing files
    if (fileErrors.heroImages && fileErrors.heroImages.includes("total")) {
      const newErrors = { ...fileErrors };
      delete newErrors.heroImages;
      setFileErrors(newErrors);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Clear validation error for this field when user starts typing/selecting
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (type === "checkbox") {
      if (name === "categories" || name === "collaborationInterests") {
        setFormData((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else if (type === "file") {
      if (name === "portfolioFile") {
        const file = e.target.files[0];
        const newErrors = { ...fileErrors };

        if (file) {
          // Validate file type
          if (!validateFileType(file, ACCEPTED_FILE_TYPES.portfolioFile)) {
            newErrors.portfolioFile = `Only PDF files are allowed`;
            setFormData((prev) => ({ ...prev, [name]: null }));
          }
          // Validate file size
          else if (!validateFileSize(file, FILE_SIZE_LIMITS.portfolioFile)) {
            newErrors.portfolioFile = `File size (${formatFileSize(
              file.size
            )}) exceeds the 20MB limit`;
            setFormData((prev) => ({ ...prev, [name]: null }));
          } else {
            delete newErrors.portfolioFile;
            setFormData((prev) => ({ ...prev, [name]: file }));
          }
        } else {
          delete newErrors.portfolioFile;
          setFormData((prev) => ({ ...prev, [name]: null }));
        }

        setFileErrors(newErrors);
      } else if (name === "heroImages") {
        const newFiles = Array.from(e.target.files);
        const existingFiles = formData.heroImages || [];
        const newErrors = { ...fileErrors };
        const validFiles = [];
        const invalidFiles = [];
        const invalidTypes = [];

        // Check total file count limit (existing + new)
        if (
          existingFiles.length + newFiles.length >
          FILE_COUNT_LIMITS.heroImages
        ) {
          newErrors.heroImages = `You can only upload up to ${FILE_COUNT_LIMITS.heroImages} images total. You have ${existingFiles.length} existing files and selected ${newFiles.length} new files.`;
          setFileErrors(newErrors);
          return;
        }

        newFiles.forEach((file) => {
          // Validate file type
          if (!validateFileType(file, ACCEPTED_FILE_TYPES.heroImages)) {
            invalidTypes.push(file.name);
          }
          // Validate file size
          else if (!validateFileSize(file, FILE_SIZE_LIMITS.heroImages)) {
            invalidFiles.push(`${file.name} (${formatFileSize(file.size)})`);
          } else {
            validFiles.push(file);
          }
        });

        // Set error messages
        let errorMessage = "";
        if (invalidTypes.length > 0) {
          errorMessage += `Invalid file types: ${invalidTypes.join(
            ", "
          )}. Only JPG, JPEG, PNG files are allowed.`;
        }
        if (invalidFiles.length > 0) {
          if (errorMessage) errorMessage += " ";
          errorMessage += `The following files exceed the 3MB limit: ${invalidFiles.join(
            ", "
          )}`;
        }

        if (errorMessage) {
          newErrors.heroImages = errorMessage;
        } else {
          delete newErrors.heroImages;
        }

        // Combine existing files with new valid files
        const allFiles = [...existingFiles, ...validFiles];
        setFormData((prev) => ({ ...prev, [name]: allFiles }));
        setFileErrors(newErrors);

        // Clear file input to allow selecting same files again if needed
        e.target.value = "";
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadFiles = async () => {
    const uploadedFiles = {
      portfolioFileUrl: "",
      heroImagesUrls: [],
    };

    try {
      // Upload portfolio file if exists
      if (formData.portfolioFile) {
        const portfolioResponse = await fileUploadAPI.upload(
          formData.portfolioFile,
          "Portfolio submission",
          "mirror-storage",
          "submissions/portfolios"
        );

        const fileUrl =
          portfolioResponse.data?.publicUrl ||
          portfolioResponse.data?.url ||
          portfolioResponse.data?.fileUrl ||
          portfolioResponse.data?.downloadUrl ||
          portfolioResponse.url ||
          portfolioResponse.fileUrl;

        uploadedFiles.portfolioFileUrl = fileUrl;
      }

      // Upload hero images if exist
      if (formData.heroImages && formData.heroImages.length > 0) {
        const heroImagePromises = formData.heroImages.map((file, index) =>
          fileUploadAPI.upload(
            file,
            `Hero image ${index + 1}`,
            "mirror-storage",
            "submissions/hero-images"
          )
        );

        const heroImageResponses = await Promise.all(heroImagePromises);

        uploadedFiles.heroImagesUrls = heroImageResponses.map((response) => {
          const fileUrl =
            response.data?.publicUrl ||
            response.data?.url ||
            response.data?.fileUrl ||
            response.data?.downloadUrl ||
            response.url ||
            response.fileUrl;

          return fileUrl;
        });
      }

      return uploadedFiles;
    } catch (error) {
      throw new Error("Failed to upload files. Please try again.");
    }
  };

  const submitToGoogleSheets = async (formDataToSubmit) => {
    const scriptURL = import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL;

    if (!scriptURL) {
      throw new Error("Google Sheets script URL is not configured");
    }

    try {
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(formDataToSubmit),
        headers: { "Content-Type": "application/json" },
      });

      return { success: true };
    } catch (error) {
      throw new Error("Failed to submit to Google Sheets");
    }
  };

  // Validate required fields with field-specific errors
  const validateRequiredFields = () => {
    const requiredFields = [
      { field: "designerName", label: "Designer / Brand name is required" },
      { field: "contactEmail", label: "Contact email is required" },
      { field: "location", label: "Location is required" },
      // { field: "categories", label: "Please select at least one category" }, // Commented out for Milan
      {
        field: "agreeToContact",
        label: "You must agree to the Privacy Policy",
      },
    ];

    const errors = {};

    requiredFields.forEach(({ field, label }) => {
      const value = formData[field];

      if (
        !value ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "") ||
        (field === "agreeToContact" && value === false)
      ) {
        errors[field] = label;
      }
    });

    return errors;
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Comprehensive validation with field-specific errors
  const validateForm = () => {
    const errors = {};

    // Check required fields
    const requiredFieldErrors = validateRequiredFields();
    Object.assign(errors, requiredFieldErrors);

    // Check email format
    if (formData.contactEmail && !validateEmail(formData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }

    return errors;
  };

  // Function to scroll to first error field
  const scrollToFirstError = (errors) => {
    // Define field order from top to bottom
    const fieldOrder = [
      "designerName",
      "contactEmail",
      "location",
      // "categories", // Commented out for Milan
      "agreeToContact",
    ];

    // Find first field with error
    for (const field of fieldOrder) {
      if (errors[field]) {
        let element;

        if (field === "categories") {
          element = document.querySelector(".submit-form-checkbox-group");
        } else if (field === "agreeToContact") {
          element = document.querySelector('input[name="agreeToContact"]');
        } else {
          element = document.querySelector(`input[name="${field}"]`);
        }

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Focus the element if it's a focusable input
          if (element.focus && element.type !== "checkbox") {
            setTimeout(() => element.focus(), 500);
          }
          break;
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Comprehensive validation
    const errors = validateForm();

    // Check file errors as well
    if (Object.keys(fileErrors).length > 0) {
      errors.fileErrors = "Please fix file size/type errors before submitting";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      scrollToFirstError(errors);
      return;
    }

    setIsUploading(true);

    try {
      // Upload files and get URLs (if any files selected)
      let uploadedFiles = { portfolioFileUrl: "", heroImagesUrls: [] };

      if (
        formData.portfolioFile ||
        (formData.heroImages && formData.heroImages.length > 0)
      ) {
        uploadedFiles = await uploadFiles();
      }

      // Prepare data for Google Sheets (matching your HTML form structure exactly)
      const googleSheetsData = {
        designerName: formData.designerName,
        email: formData.contactEmail,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        portfolioLink: formData.portfolioLink,
        categories: Array.isArray(formData.categories)
          ? formData.categories.join(", ")
          : formData.categories,
        priceRange: formData.priceRange,
        capacity: formData.productionCapacity,
        readiness: formData.readiness,
        pdfLink: uploadedFiles.portfolioFileUrl || "", // Ensure not null
        imageLinks:
          uploadedFiles.heroImagesUrls.length > 0
            ? uploadedFiles.heroImagesUrls.join(", ")
            : "", // Ensure not empty array
        videoLink: formData.videoLookbook,
        collabInterest: Array.isArray(formData.collaborationInterests)
          ? formData.collaborationInterests.join(", ")
          : formData.collaborationInterests,
        brandStory: formData.brandStory,
        agreeToContact: formData.agreeToContact ? "Yes" : "No",
        submissionDate: new Date().toISOString(),
      };

      // Submit to Google Sheets
      await submitToGoogleSheets(googleSheetsData);

      // Send email notification to user with retry logic for cold start
      try {
        await notificationsAPI.sendEmail(
          [formData.contactEmail],
          "milan-form",
          {
            name: formData.designerName,
          }
        );
      } catch (emailError) {
        // Retry once after 2 seconds (in case of cold start)
        try {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          await notificationsAPI.sendEmail(
            [formData.contactEmail],
            "milan-form",
            {
              name: formData.designerName,
            }
          );
        } catch (retryError) {
          // Don't throw error - form submission was successful
        }
      }

      // Navigate to success page
      navigate("/mirror-in-milan-digital-jewelry-week/submit-success");
    } catch (error) {
      alert(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="submit-form-wrapper">
      <section className="submit-form-section">
        <div className="submit-form-container">
          {/* Header Text */}
          <p className="submit-form-header bodytext-3--no-margin">
            LET'S BEGIN THE CONVERSATION
          </p>

          {/* Main Title */}
          <h2 className="submit-form-title heading-2--no-margin">
            Share Your Vision
          </h2>

          {/* Form */}
          <form className="submit-form" onSubmit={handleSubmit}>
            <div className="submit-form-row">
              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Designer / Brand name *
                </label>
                <input
                  type="text"
                  name="designerName"
                  placeholder="Your studio or brand"
                  className="submit-form-input bodytext-6--no-margin"
                  value={formData.designerName}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.designerName && (
                  <p className="submit-form-error bodytext-6--no-margin">
                    {validationErrors.designerName}
                  </p>
                )}
              </div>

              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Contact email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  placeholder="name@gmail.com"
                  className="submit-form-input bodytext-6--no-margin"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.contactEmail && (
                  <p className="submit-form-error bodytext-6--no-margin">
                    {validationErrors.contactEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="submit-form-row">
              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+84..."
                  className="submit-form-input bodytext-6--no-margin"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="City, Country"
                  className="submit-form-input bodytext-6--no-margin"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
                {validationErrors.location && (
                  <p className="submit-form-error bodytext-6--no-margin">
                    {validationErrors.location}
                  </p>
                )}
              </div>
            </div>

            <div className="submit-form-row">
              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://"
                  className="submit-form-input bodytext-6--no-margin"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Instagram
                </label>
                <input
                  type="url"
                  name="instagram"
                  placeholder="https://instagram.com/..."
                  className="submit-form-input bodytext-6--no-margin"
                  value={formData.instagram}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="submit-form-row">
              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Tiktok
                </label>
                <input
                  type="url"
                  name="tiktok"
                  placeholder="https://tiktok.com/@..."
                  className="submit-form-input bodytext-6--no-margin"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                />
              </div>

              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Behance / Portfolio link
                </label>
                <input
                  type="url"
                  name="portfolioLink"
                  placeholder="https://"
                  className="submit-form-input bodytext-6--no-margin"
                  value={formData.portfolioLink}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* SENSITIVE FIELDS - Commented out for Milan event (move to second-stage form later) */}
            {/* Categories */}
            {/* <div className="submit-form-group">
              <label className="submit-form-label bodytext-3--no-margin">
                Categories (select all that apply) *
              </label>
              <div className="submit-form-checkbox-group">
                {["Fine", "Demi-fine", "Experimental", "Digital/3D"].map(
                  (category) => (
                    <label
                      key={category}
                      className="submit-form-checkbox-label bodytext-4--no-margin"
                    >
                      <input
                        type="checkbox"
                        name="categories"
                        value={category}
                        checked={formData.categories.includes(category)}
                        onChange={handleInputChange}
                      />
                      {category}
                    </label>
                  )
                )}
              </div>
              {validationErrors.categories && (
                <p className="submit-form-error bodytext-6--no-margin">
                  {validationErrors.categories}
                </p>
              )}
            </div> */}

            {/* <div className="submit-form-row">
              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Typical price range
                </label>
                <select
                  name="priceRange"
                  className="submit-form-select bodytext-6--no-margin"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                >
                  <option value="">Select...</option>
                  <option value="under-100">Under $100</option>
                  <option value="100-500">$100 - $500</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-5000">$1,000 - $5,000</option>
                  <option value="over-5000">Over $5,000</option>
                </select>
              </div>

              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Production capacity
                </label>
                <select
                  name="productionCapacity"
                  className="submit-form-select bodytext-6--no-margin"
                  value={formData.productionCapacity}
                  onChange={handleInputChange}
                >
                  <option value="">Select...</option>
                  <option value="small">Small (1-10 pieces/month)</option>
                  <option value="medium">Medium (10-50 pieces/month)</option>
                  <option value="large">Large (50+ pieces/month)</option>
                </select>
              </div>
            </div> */}

            {/* Readiness */}
            {/* <div className="submit-form-group">
              <label className="submit-form-label bodytext-3--no-margin">
                Readiness
              </label>
              <div className="submit-form-radio-group">
                {["Made-to-order", "Ready stock", "Both"].map((option) => (
                  <label
                    key={option}
                    className="submit-form-radio-label bodytext-4--no-margin"
                  >
                    <input
                      type="radio"
                      name="readiness"
                      value={option}
                      checked={formData.readiness === option}
                      onChange={handleInputChange}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div> */}

            <div className="submit-form-row">
              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Portfolio PDF (max 20MB)
                </label>
                <div className="submit-form-file-input-wrapper">
                  <input
                    type="file"
                    id="portfolioFile"
                    name="portfolioFile"
                    accept=".pdf"
                    className="submit-form-file-input"
                    onChange={handleInputChange}
                  />
                  <label
                    htmlFor="portfolioFile"
                    className="submit-form-file-input-placeholder bodytext-6--no-margin"
                  >
                    {formData.portfolioFile
                      ? `${formData.portfolioFile.name} (${formatFileSize(
                          formData.portfolioFile.size
                        )})`
                      : "Upload File"}
                  </label>
                </div>
                {fileErrors.portfolioFile && (
                  <p className="submit-form-error bodytext-6--no-margin">
                    {fileErrors.portfolioFile}
                  </p>
                )}
                <p className="submit-form-note bodytext-6--no-margin">
                  Optional if you provided a link above.
                </p>
              </div>

              <div className="submit-form-group">
                <label className="submit-form-label bodytext-3--no-margin">
                  Hero Images (up to 5 JPG/PNG, max 3MB each)
                </label>
                <div className="submit-form-file-input-wrapper">
                  <input
                    type="file"
                    id="heroImages"
                    name="heroImages"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    className="submit-form-file-input"
                    onChange={handleInputChange}
                  />
                  <label
                    htmlFor="heroImages"
                    className="submit-form-file-input-placeholder bodytext-6--no-margin"
                  >
                    {formData.heroImages && formData.heroImages.length > 0
                      ? `Add more images (${formData.heroImages.length}/5 selected)`
                      : "Upload Images"}
                  </label>
                </div>

                {/* Display selected files */}
                {formData.heroImages && formData.heroImages.length > 0 && (
                  <div className="selected-files-list">
                    {formData.heroImages.map((file, index) => (
                      <div key={index} className="selected-file-item">
                        <span className="file-info bodytext-6--no-margin">
                          {file.name} ({formatFileSize(file.size)})
                        </span>
                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => removeHeroImage(index)}
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {fileErrors.heroImages && (
                  <p className="submit-form-error bodytext-6--no-margin">
                    {fileErrors.heroImages}
                  </p>
                )}
                <p className="submit-form-note bodytext-6--no-margin">
                  We may feature selected images with credit.
                </p>
              </div>
            </div>

            {/* Video Lookbook */}
            <div className="submit-form-group">
              <label className="submit-form-label bodytext-3--no-margin">
                Video lookbook (Youtube / Vimeo)
              </label>
              <input
                type="url"
                name="videoLookbook"
                placeholder="https://www.youtube.com/..."
                className="submit-form-input bodytext-6--no-margin"
                value={formData.videoLookbook}
                onChange={handleInputChange}
              />
            </div>

            {/* Collaboration Interests */}
            <div className="submit-form-group">
              <label className="submit-form-label bodytext-3--no-margin">
                Collaboration interests
              </label>
              <div className="submit-form-checkbox-group">
                {[
                  "Retail pop-ups",
                  "Co-design",
                  "Influencer shoots",
                  "Workshops",
                ].map((interest) => (
                  <label
                    key={interest}
                    className="submit-form-checkbox-label bodytext-4--no-margin"
                  >
                    <input
                      type="checkbox"
                      name="collaborationInterests"
                      value={interest}
                      checked={formData.collaborationInterests.includes(
                        interest
                      )}
                      onChange={handleInputChange}
                    />
                    {interest}
                  </label>
                ))}
              </div>
            </div>

            {/* Brand Story */}
            <div className="submit-form-group">
              <label className="submit-form-label bodytext-3--no-margin">
                If you'd like, share a few words about your inspirations
                (optional)
              </label>
              <textarea
                name="brandStory"
                placeholder="What inspires your work? What materials do you love?"
                className="submit-form-textarea bodytext-6--no-margin"
                rows="1"
                value={formData.brandStory}
                onChange={handleInputChange}
                style={{
                  overflow: "hidden",
                  resize: "none",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
                onInput={(e) => {
                  const maxRows = 5;

                  // Reset to 1 row to get accurate scrollHeight
                  e.target.rows = 1;

                  // Calculate how many rows are actually needed based on scroll height
                  const style = getComputedStyle(e.target);
                  const lineHeight = parseFloat(style.lineHeight);
                  const paddingTop = parseFloat(style.paddingTop);
                  const paddingBottom = parseFloat(style.paddingBottom);

                  const contentHeight =
                    e.target.scrollHeight - paddingTop - paddingBottom;
                  const neededRows = Math.round(contentHeight / lineHeight);

                  // Only expand if content actually needs more rows
                  if (neededRows > 1) {
                    e.target.rows = Math.min(neededRows, maxRows);
                  }

                  if (neededRows > maxRows) {
                    e.target.style.overflow = "auto";
                  } else {
                    e.target.style.overflow = "hidden";
                  }
                }}
              />
            </div>

            {/* Agreement */}
            <div className="submit-form-group">
              <label className="submit-form-checkbox-label bodytext-4--no-margin">
                <input
                  type="checkbox"
                  name="agreeToContact"
                  checked={formData.agreeToContact}
                  onChange={handleInputChange}
                  required
                />
                I agree to be contacted regarding my submission and accept the
                Privacy Policy
              </label>
              {validationErrors.agreeToContact && (
                <p className="submit-form-error bodytext-6--no-margin">
                  {validationErrors.agreeToContact}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-submit">
              <ShineGlassButton
                theme="light"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Share your vision"}
              </ShineGlassButton>
              <p className="submit-note bodytext-6--no-margin">
                You'll receive an email confirmation with you submission
                summary.
              </p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SubmitForm;
