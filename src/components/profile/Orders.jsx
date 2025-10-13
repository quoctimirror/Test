import React from "react";
import "./ProfileTabs.css";

const Orders = () => {
  // Mock data - sẽ thay bằng API call sau
  const orders = [
    {
      id: 1,
      image: "/products/lumina-ring.jpg",
      name: "Lumina",
      date: "12/12/2026",
    },
    {
      id: 2,
      image: "/products/lumina-ring.jpg",
      name: "Lumina",
      date: "12/12/2026",
    },
    {
      id: 3,
      image: "/products/lumina-ring.jpg",
      name: "Lumina",
      date: "12/12/2026",
    },
  ];

  const handleViewDetail = (orderId) => {
    console.log("View order detail:", orderId);
    // Navigate to order detail page
  };

  return (
    <div className="profile-tab-content">
      <div className="profile-items-list">
        {orders.map((order) => (
          <div key={order.id} className="profile-item">
            <div className="profile-item-image">
              <img src={order.image} alt={order.name} />
            </div>
            <div className="profile-item-info">
              <h3 className="profile-item-name heading-3--no-margin">{order.name}</h3>
            </div>
            <div className="profile-item-actions">
              <span className="profile-item-date bodytext-3--no-margin">
                {order.date}
              </span>
              <button
                className="profile-view-detail-btn bodytext-3--no-margin"
                onClick={() => handleViewDetail(order.id)}
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

export default Orders;
