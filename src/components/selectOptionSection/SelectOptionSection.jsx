import { useState } from "react";
import "./SelectOptionSection.css";

const SelectOptionSection = () => {
  const [selectedStone, setSelectedStone] = useState("oval");
  const [currentPrice, setCurrentPrice] = useState("4.000$");

  const stoneOptions = [
    { id: "oval", name: "Oval", icon: "⭕" },
    { id: "pearl", name: "Pearl", icon: "⚪" },
    { id: "emerald", name: "Emerald", icon: "💎" }
  ];

  const handleStoneSelect = (stoneId) => {
    setSelectedStone(stoneId);
    // Update price based on selection (example logic)
    const prices = {
      oval: "4.000$",
      pearl: "5.500$", 
      emerald: "7.200$"
    };
    setCurrentPrice(prices[stoneId]);
  };

  const handleSaveSettings = () => {
    console.log("Settings saved:", { selectedStone, currentPrice });
  };

  const handleContactUs = () => {
    console.log("Contact us clicked");
  };

  const handleBookAppointment = () => {
    console.log("Book appointment clicked");
  };

  const handleOrderNow = () => {
    console.log("Order now clicked");
  };

  const handleMoreDetails = () => {
    console.log("More details clicked");
  };

  return (
    <div className="select-option-section">
      {/* Main ring display */}
      <div className="ring-display">
        <img 
          src="/collection/nhan_ex.png" 
          alt="Wedding Ring Set" 
          className="ring-image"
        />
      </div>

      {/* Bottom control panel */}
      <div className="control-panel">
        {/* Left side - Help section */}
        <div className="help-section">
          <h3>Need help?</h3>
          <p>There's nothing more exciting or magical than jewelry. We love assisting you with your choices.</p>
          <button className="contact-btn" onClick={handleContactUs}>
            Contact Us
          </button>
        </div>

        {/* Center - Stone selection and save */}
        <div className="selection-section">
          <button className="save-btn" onClick={handleSaveSettings}>
            Save
          </button>
          <p className="save-text">Want to save your settings?</p>
          
          <div className="stone-options">
            {stoneOptions.map((stone) => (
              <div 
                key={stone.id}
                className={`stone-option ${selectedStone === stone.id ? 'selected' : ''}`}
                onClick={() => handleStoneSelect(stone.id)}
              >
                <div className="stone-icon">{stone.icon}</div>
                <span className="stone-name">{stone.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Pricing and actions */}
        <div className="pricing-section">
          <div className="price-info">
            <span className="price-label">From</span>
            <span className="price-amount">{currentPrice}</span>
          </div>
          
          <button className="appointment-btn" onClick={handleBookAppointment}>
            Book An Appointment
          </button>
          
          <button className="order-btn" onClick={handleOrderNow}>
            Order Now
          </button>
          
          <button className="details-btn" onClick={handleMoreDetails}>
            More details ↓
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectOptionSection;