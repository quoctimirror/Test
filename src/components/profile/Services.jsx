import React from "react";
import "./ProfileTabs.css";

const Services = () => {
  // Mock data - will be replaced with API call later
  const services = [
    {
      id: 1,
      image: "/services/jewelry-polish.jpg",
      name: "Jewelry polish",
      date: "12/12/2026",
    },
    {
      id: 2,
      image: "/services/private-appointment.jpg",
      name: "Private Appointment",
      date: "12/12/2026",
    },
    {
      id: 3,
      image: "/services/private-appointment.jpg",
      name: "Private Appointment",
      date: "12/12/2026",
    },
  ];

  const handleViewDetail = (serviceId) => {
    // Navigate to service detail page
  };

  return (
    <div className="profile-tab-content profile-services-tab">
      <div className="profile-items-list">
        {services.map((service) => (
          <div key={service.id} className="profile-item">
            <div className="profile-item-image profile-service-image">
              <img src={service.image} alt={service.name} />
            </div>
            <div className="profile-item-info">
              <h3 className="profile-item-name heading-3--no-margin">
                {service.name}
              </h3>
            </div>
            <div className="profile-item-actions">
              <span className="profile-item-date bodytext-3--no-margin">
                {service.date}
              </span>
              <button
                className="profile-view-detail-btn bodytext-3--no-margin"
                onClick={() => handleViewDetail(service.id)}
              >
                View detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
