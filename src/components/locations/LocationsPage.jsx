import React, { useEffect, useState, useRef } from "react";
import { locationsAPI, handleAPIError } from "@services/api";
import UnderlineButton from "@components/common/button/UnderlineButton";
import "./locations.css";

const LocationsPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [cities, setCities] = useState(["all"]);
  const [types, setTypes] = useState(["all"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const dropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);

  // Helper function to convert type names for display
  const getDisplayType = (type) => {
    if (type === "SHOWROOM") return "LOUNGE";
    return type;
  };

  // Load locations data from API
  useEffect(() => {
    fetchLocationsData();

    if (sessionStorage.getItem("scrollToTop") === "true") {
      window.scrollTo({ top: 0, behavior: "instant" });
      sessionStorage.removeItem("scrollToTop");
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target)
      ) {
        setTypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch locations and filter options from API
  const fetchLocationsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch locations and filter options in parallel
      const [locationsResponse, filtersResponse] = await Promise.all([
        locationsAPI.getAll(),
        locationsAPI.getFilterOptions(),
      ]);

      const locationsData = locationsResponse.data || [];
      const filtersData = filtersResponse.data || {};

      // Set locations data
      setLocations(locationsData);

      // Set filter options
      setCities(["all", ...(filtersData.cities || [])]);
      setTypes(["all", ...(filtersData.types || [])]);
    } catch (err) {
      const errorInfo = handleAPIError(err, "Failed to load store locations");
      setError(errorInfo.message);
      console.error("Error fetching locations:", errorInfo);

      // Fallback to empty state
      setLocations([]);
      setCities(["all"]);
      setTypes(["all"]);
    } finally {
      setLoading(false);
    }
  };

  // Filter locations based on selected city and type
  const filteredLocations = locations.filter((location) => {
    const cityMatch = selectedCity === "all" || location.city === selectedCity;
    const typeMatch = selectedType === "all" || location.type === selectedType;
    return cityMatch && typeMatch;
  });

  const handleCityFilter = (city) => {
    setSelectedCity(city);
    setSelectedLocation(null); // Reset selected location when filtering
    setDropdownOpen(false);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setSelectedLocation(null); // Reset selected location when filtering
    setTypeDropdownOpen(false);
  };

  const handleViewOnMap = (location) => {
    setSelectedLocation(location);
    setMapLoading(true);

    // Update the iframe src to zoom to specific location with visible pin
    if (mapRef.current) {
      // Handle both old coordinate structure and new API structure
      const lat = location.coordinates?.lat || location.latitude;
      const lng = location.coordinates?.lng || location.longitude;

      if (!lat || !lng) {
        console.error("Invalid coordinates for location:", location);
        setMapLoading(false);
        return;
      }

      // Use simple query parameter approach
      const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`;

      // Add smooth transition effect
      mapRef.current.style.opacity = "0.5";
      mapRef.current.style.transition = "opacity 0.6s ease-in-out";

      setTimeout(() => {
        mapRef.current.src = mapUrl;
        mapRef.current.onload = () => {
          mapRef.current.style.opacity = "1";
          setMapLoading(false);
        };
      }, 300);
    }
  };

  return (
    <div className="locations-page">
      {/* Hero Section */}
      <div className="locations-hero-section" data-navbar-theme="white">
        <div className="locations-hero-content">
          <h1 className="heading-1--no-margin">LOCATION</h1>
          <p className="bodytext-4--no-margin locations-hero-description">
            From lounges, boutique to PODs, our network unfolds as a
            constellation of spaces - each reflecting Mirror’s world of sensory
            luxury.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="locations-content" data-navbar-theme="black">
        <div className="locations-container">
          {/* Error Message */}
          {error && (
            <div
              className="error-message"
              style={{
                background: "#fee",
                color: "#c53030",
                padding: "1rem",
                margin: "1rem 0",
                borderRadius: "8px",
                border: "1px solid #feb2b2",
              }}
            >
              <p>⚠️ {error}</p>
              <button
                onClick={fetchLocationsData}
                style={{
                  background: "#c53030",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "4px",
                  marginTop: "0.5rem",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Left Side - Location List */}
          <div className="locations-list">
            <div className="filters-container">
              <div className="filter-item">
                <label className="filter-label bodytext-6--no-margin">
                  Filter by City/Province:
                </label>
                <div className="custom-dropdown" ref={dropdownRef}>
                  <div
                    className={`dropdown-selected bodytext-6--no-margin ${
                      dropdownOpen ? "open" : ""
                    }`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className="selected-text">
                      {selectedCity === "all" ? "All Cities" : selectedCity}
                    </span>
                    <span
                      className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}
                    >
                      &#9662;
                    </span>
                  </div>
                  {dropdownOpen && (
                    <div className="dropdown-options">
                      {cities.map((city) => (
                        <div
                          key={city}
                          className={`dropdown-option bodytext-6--no-margin ${
                            selectedCity === city ? "selected" : ""
                          }`}
                          onClick={() => handleCityFilter(city)}
                        >
                          {city === "all" ? "All Cities" : city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="filter-item">
                <label className="filter-label bodytext-6--no-margin">
                  Filter by Type:
                </label>
                <div className="custom-dropdown" ref={typeDropdownRef}>
                  <div
                    className={`dropdown-selected bodytext-6--no-margin ${
                      typeDropdownOpen ? "open" : ""
                    }`}
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  >
                    <span className="selected-text">
                      {selectedType === "all"
                        ? "All Types"
                        : getDisplayType(selectedType)}
                    </span>
                    <span
                      className={`dropdown-arrow ${
                        typeDropdownOpen ? "open" : ""
                      }`}
                    >
                      &#9662;
                    </span>
                  </div>
                  {typeDropdownOpen && (
                    <div className="dropdown-options">
                      {types.map((type) => (
                        <div
                          key={type}
                          className={`dropdown-option bodytext-6--no-margin ${
                            selectedType === type ? "selected" : ""
                          }`}
                          onClick={() => handleTypeFilter(type)}
                        >
                          {type === "all" ? "All Types" : getDisplayType(type)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="location-items">
              {loading ? (
                <div
                  className="loading-state"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  <div
                    style={{
                      border: "4px solid #f3f3f3",
                      borderTop: "4px solid #3498db",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      animation: "spin 2s linear infinite",
                      margin: "0 auto 1rem",
                    }}
                  ></div>
                  <p>Loading store locations...</p>
                </div>
              ) : filteredLocations.length === 0 ? (
                <div
                  className="no-locations"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  <p style={{ color: "#666", fontSize: "1.1rem" }}>
                    {error
                      ? "Unable to load locations"
                      : "No locations found matching your criteria"}
                  </p>
                  {!error &&
                    (selectedCity !== "all" || selectedType !== "all") && (
                      <button
                        onClick={() => {
                          setSelectedCity("all");
                          setSelectedType("all");
                        }}
                        style={{
                          background: "none",
                          color: "#3498db",
                          border: "1px solid #3498db",
                          padding: "0.5rem 1rem",
                          borderRadius: "4px",
                          marginTop: "1rem",
                          cursor: "pointer",
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                </div>
              ) : (
                filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    className={`location-item ${
                      selectedLocation?.id === location.id ? "selected" : ""
                    }`}
                  >
                    <div className="location-info">
                      <h3 className="location-name bodytext-3--no-margin">
                        {location.name}
                      </h3>
                      <p className="location-type bodytext-6--no-margin">
                        {getDisplayType(location.type)}
                      </p>
                      <p className="location-address bodytext-6--no-margin">
                        {location.address}
                      </p>
                      <p className="location-hours bodytext-6--no-margin">
                        {location.hours}
                      </p>
                      <p className="location-phone bodytext-6--no-margin">
                        {location.phone}
                      </p>
                    </div>
                    <div className="location-actions">
                      <UnderlineButton
                        onClick={() => handleViewOnMap(location)}
                        textClassName="bodytext-6--no-margin"
                      >
                        View on map
                      </UnderlineButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Map */}
          <div className="locations-map">
            <div className="map-container">
              {mapLoading && (
                <div className="map-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading location...</p>
                </div>
              )}
              <iframe
                ref={mapRef}
                src="https://www.google.com/maps?q=Mirror+Diamond+locations+Ho+Chi+Minh+City&hl=en&z=13&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, transition: "opacity 0.6s ease-in-out" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Locations Map"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;
