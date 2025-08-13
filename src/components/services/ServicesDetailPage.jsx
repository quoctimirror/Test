import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "@pages/servicesDetail.css";
import ProductCareRepair from "./ProductCareRepair";
import TradeInUpgrade from "./TradeInUpgrade";
import Section6 from "./section6/Section6";

const ServicesDetailPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("product-care-repair");

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && (tabFromUrl === 'product-care-repair' || tabFromUrl === 'trade-in-upgrade')) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

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

  return (
    <>
      <div className="services-detail-hero-section">
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
              onClick={() => setActiveTab(tab.id)}
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
      
      <Section6 />
    </>
  );
};

export default ServicesDetailPage;