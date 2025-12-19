import React from "react";
import "./ProfileTabs.css";

const Wishlist = () => {
  // Mock data - sẽ thay bằng API call sau
  const wishlistItems = [
    {
      id: 1,
      image: "/products/lumina-ring.jpg",
      name: "Lumina",
    },
    {
      id: 2,
      image: "/products/lumina-ring.jpg",
      name: "Lumina",
    },
  ];

  const handleViewDetail = (itemId) => {
    // Navigate to product detail page
  };

  return (
    <div className="profile-tab-content">
      <div className="profile-items-list">
        {wishlistItems.map((item) => (
          <div key={item.id} className="profile-item">
            <div className="profile-item-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="profile-item-info">
              <h3 className="profile-item-name heading-3--no-margin">
                {item.name}
              </h3>
            </div>
            <div className="profile-item-actions">
              <button
                className="profile-view-detail-btn bodytext-3--no-margin"
                onClick={() => handleViewDetail(item.id)}
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

export default Wishlist;
