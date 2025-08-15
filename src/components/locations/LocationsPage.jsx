import React, { useEffect, useState, useRef } from "react";
import "./locations.css";

const LocationsPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const dropdownRef = useRef(null);
  const typeDropdownRef = useRef(null);

  useEffect(() => {
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setTypeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Locations array - can be fetched from API
  const locations = [
    {
      id: 1,
      name: "Mirror Diamond Showroom An Khanh",
      type: "Showroom",
      address: "71 Nguyen Co Thach, Ward An Khanh, Ho Chi Minh City",
      city: "Ho Chi Minh City",
      hours: "Mon-Sat: 9:00 AM - 8:00 PM",
      phone: "+84 28 3991 2345",
      coordinates: {
        lat: 10.771097097407328,
        lng: 106.72430572551536
      }
    },
    {
      id: 2,
      name: "Mirror Diamond Boutique Gia Dinh",
      type: "Boutique",
      address: "282/14 Bui Huu Nghia, Ward Gia Dinh, Ho Chi Minh City",
      city: "Ho Chi Minh City",
      hours: "Mon-Sun: 10:00 AM - 9:00 PM",
      phone: "+84 28 3876 5432",
      coordinates: {
        lat: 10.800849887248818,
        lng: 106.70083992540167
      }
    },
    {
      id: 3,
      name: "Mirror Diamond Showroom Quy Nhon",
      type: "Showroom",
      address: "03 Dinh Cong Trang, Ward Quy Nhon, Binh Dinh Province",
      city: "Binh Dinh Province",
      hours: "Mon-Sat: 9:00 AM - 7:30 PM",
      phone: "+84 256 3821 9876",
      coordinates: {
        lat: 13.761730199393417,
        lng: 109.21577088311184
      }
    },
    {
      id: 4,
      name: "Six Senses Con Dao",
      type: "POD",
      address: "Con Dao Special Zone, Ho Chi Minh City",
      city: "Ho Chi Minh City",
      hours: "Daily: 8:00 AM - 10:00 PM",
      phone: "+84 254 3831 2222",
      coordinates: {
        lat: 8.70115369316553,
        lng: 106.6338898542159
      }
    },
    {
      id: 5,
      name: "InterContinental Da Nang",
      type: "POD",
      address: "Ward Son Tra, Da Nang City",
      city: "Da Nang City",
      hours: "Daily: 8:00 AM - 10:00 PM",
      phone: "+84 236 3938 8888",
      coordinates: {
        lat: 16.121054097753404,
        lng: 108.30627975038146
      }
    }
  ];

  // Get unique cities and types for filters
  const cities = ["all", ...new Set(locations.map(location => location.city))];
  const types = ["all", ...new Set(locations.map(location => location.type))];

  // Filter locations based on selected city and type
  const filteredLocations = locations.filter(location => {
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
      const { lat, lng } = location.coordinates;
      const encodedAddress = encodeURIComponent(location.address);
      
      // Use simple query parameter approach
      const mapUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`;
      
      // Add smooth transition effect
      mapRef.current.style.opacity = '0.5';
      mapRef.current.style.transition = 'opacity 0.6s ease-in-out';
      
      setTimeout(() => {
        mapRef.current.src = mapUrl;
        mapRef.current.onload = () => {
          mapRef.current.style.opacity = '1';
          setMapLoading(false);
        };
      }, 300);
    }
  };

  return (
    <div className="locations-page">
      {/* Hero Section */}
      <div className="locations-hero-section">
        <div className="hero-content">
          <h1>LOCATION</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="locations-content">
        <div className="locations-container">
          {/* Left Side - Location List */}
          <div className="locations-list">
            <div className="filters-container">
              <div className="filter-item">
                <label className="filter-label">Filter by City/Province:</label>
                <div className="custom-dropdown" ref={dropdownRef}>
                  <div 
                    className={`dropdown-selected ${dropdownOpen ? 'open' : ''}`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className="selected-text">
                      {selectedCity === "all" ? "All Cities" : selectedCity}
                    </span>
                    <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>
                      &#9662;
                    </span>
                  </div>
                  {dropdownOpen && (
                    <div className="dropdown-options">
                      {cities.map((city) => (
                        <div
                          key={city}
                          className={`dropdown-option ${selectedCity === city ? 'selected' : ''}`}
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
                <label className="filter-label">Filter by Type:</label>
                <div className="custom-dropdown" ref={typeDropdownRef}>
                  <div 
                    className={`dropdown-selected ${typeDropdownOpen ? 'open' : ''}`}
                    onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                  >
                    <span className="selected-text">
                      {selectedType === "all" ? "All Types" : selectedType}
                    </span>
                    <span className={`dropdown-arrow ${typeDropdownOpen ? 'open' : ''}`}>
                      &#9662;
                    </span>
                  </div>
                  {typeDropdownOpen && (
                    <div className="dropdown-options">
                      {types.map((type) => (
                        <div
                          key={type}
                          className={`dropdown-option ${selectedType === type ? 'selected' : ''}`}
                          onClick={() => handleTypeFilter(type)}
                        >
                          {type === "all" ? "All Types" : type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="location-items">
              {filteredLocations.map((location) => (
                <div key={location.id} className={`location-item ${selectedLocation?.id === location.id ? 'selected' : ''}`}>
                  <div className="location-info">
                    <h3 className="location-name">{location.name}</h3>
                    <p className="location-type">{location.type}</p>
                    <p className="location-address">{location.address}</p>
                    <p className="location-hours">{location.hours}</p>
                    <p className="location-phone">{location.phone}</p>
                  </div>
                  <div className="location-actions">
                    <button 
                      className="view-map-btn"
                      onClick={() => handleViewOnMap(location)}
                    >
                      View on map
                    </button>
                  </div>
                </div>
              ))}
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
                style={{ border: 0, transition: 'opacity 0.6s ease-in-out' }}
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