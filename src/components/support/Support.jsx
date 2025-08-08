import React, { useState } from "react";
import "@pages/support.css";
import ReturnExchange from "./ReturnExchange";
import SizingGuide from "./SizingGuide";
import WarrantyInfo from "./WarrantyInfo";
import FAQs from "./FAQs";
import Section6 from "@components/services/section6/Section6";

const Support = () => {
  const [activeTab, setActiveTab] = useState("return-exchange");

  const tabs = [
    {
      id: "return-exchange",
      label: "Return & Exchange",
      component: ReturnExchange,
    },
    { id: "sizing-guide", label: "Sizing Guide", component: SizingGuide },
    {
      id: "warranty-info",
      label: "Warranty Information",
      component: WarrantyInfo,
    },
    { id: "faqs", label: "FAQs", component: FAQs },
  ];

  return (
    <>
      <div className="support-hero-section">
        <div className="hero-content">
          <h1>Support</h1>
        </div>
      </div>

      <div className="support-wrapper">
        <div className="support-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`support-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="support-container">
          <div className="support-content">
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
      
      {activeTab !== "faqs" && <Section6 />}
    </>
  );
};

export default Support;
