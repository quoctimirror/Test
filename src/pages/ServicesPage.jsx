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
      <Section1 />
      <Section2 />
      <ContactUs />
    </div>
  );
};

export default ServicesPage;
