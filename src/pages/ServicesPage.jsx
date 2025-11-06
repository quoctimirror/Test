import React, { useEffect } from "react";
import Section1 from "@components/services/section1/Section1";
import Section2 from "@components/services/section2/Section2";
import ContactUs from "@components/contactUs/ContactUs";
import "./services.css";

const ServicesPage = () => {
  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem("scrollToTop") === "true") {
      window.scrollTo(0, 0);
      sessionStorage.removeItem("scrollToTop");
    }
  }, []);

  return (
    <div className="services-page">
      <div data-section="section-1" data-navbar-theme="white">
        <Section1 />
      </div>
      <div data-section="section-2" data-navbar-theme="black">
        <Section2 />
      </div>
      <div data-section="contact-us">
        <ContactUs />
      </div>
    </div>
  );
};

export default ServicesPage;
