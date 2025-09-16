import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "@pages/servicesDetail.css";
import ProductCareRepair from "./ProductCareRepair";
import TradeInUpgrade from "./TradeInUpgrade";
import ContactUs from "@components/contactUs/ContactUs";

const ServicesDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("product-care-repair");

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && (tabFromUrl === 'product-care-repair' || tabFromUrl === 'trade-in-upgrade')) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    navigate(`/services/detail?tab=${tabId}`, { replace: true });
  };

  const tabs = [
    {
      id: "product-care-repair",
      label: "Product Care & Repair",
      component: ProductCareRepair,
    },
    {
      id: "trade-in-upgrade", 
      label: "Trade-In & Upgrade",
      component: TradeInUpgrade,
    },
  ];

  const getHeroImage = () => {
    switch (activeTab) {
      case "product-care-repair":
        return "/services/Product care & Repair_1920x600.jpg";
      case "trade-in-upgrade":
        return "/services/Trade in_1920x600.jpg";
      default:
        return "/services/service_detail_img.jpg";
    }
  };

  return (
    <>
      <div
        className="services-detail-hero-section"
        style={{ backgroundImage: `url("${getHeroImage()}")` }}
      >
        <div className="hero-content">
          <h1>Services</h1>
        </div>
      </div>

      <div className="services-detail-wrapper">
        <div className="services-detail-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`services-detail-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="services-detail-container">
          <div className="services-detail-content">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`tab-content ${
                  activeTab === tab.id ? "active" : ""
                }`}
              >
                {activeTab === tab.id && <tab.component />}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <ContactUs />
    </>
  );
};

export default ServicesDetailPage;