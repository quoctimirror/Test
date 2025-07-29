import { useState } from "react";
import "./SelectOptionSection.css";

const SelectOptionSection = () => {
  const [selectedStone, setSelectedStone] = useState("oval");
  const [currentPrice, setCurrentPrice] = useState("4.000$");
  const [activeTab, setActiveTab] = useState("Stone");

  const tabs = [
    "Stone",
    "Metal",
    "Band Style",
    "Size",
    "Engraving",
    "Gift Wrapping",
    "Quantity",
    "Overview",
  ];

  const stoneOptions = [
    { id: "oval", name: "Oval", icon: "⭕" },
    { id: "pearl", name: "Pearl", icon: "⚪" },
    { id: "emerald", name: "Emerald", icon: "💎" },
  ];

  const handleStoneSelect = (stoneId) => {
    setSelectedStone(stoneId);
    // Update price based on selection (example logic)
    const prices = {
      oval: "4.000$",
      pearl: "5.500$",
      emerald: "7.200$",
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

      {/* Tabs Navigation */}
      <div className="tabs-wrapper">
        <div className="tabs">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="main">
        {/* Left side - Help section */}
        <div className="help">
          <h2>Need help?</h2>
          <p className="help-text">
            There's no question too small or request too big for our client
            advisors.
            <br />
            We're always at your service.
          </p>
          <button className="button solid" onClick={handleContactUs}>
            Contact Us
          </button>
        </div>

        {/* Center - Content area */}
        <div className="content">
          {stoneOptions.map((stone) => (
            <div
              key={stone.id}
              className={`option ${
                selectedStone === stone.id ? "selected" : ""
              }`}
              onClick={() => handleStoneSelect(stone.id)}
            >
              <div className="circle"></div>
              <div className="label">{stone.name}</div>
            </div>
          ))}
        </div>

        {/* Right side - Summary */}
        <div className="summary">
          <h2>From {currentPrice}</h2>
          <button className="button outline" onClick={handleBookAppointment}>
            Book An Appointment
          </button>
          <button className="button solid" onClick={handleOrderNow}>
            Order Now
          </button>
        </div>
      </div>

      {/* More Detail Link */}
      <div className="more-detail-wrapper" onClick={handleMoreDetails}>
        <span>More detail</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 1.5L6 6.5L11 1.5" stroke="black" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default SelectOptionSection;
