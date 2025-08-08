import React, { useEffect } from "react";
import Section1 from "@components/services/section1/Section1";
import Section2 from "@components/services/section2/Section2";
import Section3 from "@components/services/section3/Section3";
import Section4 from "@components/services/section4/Section4";
import Section5 from "@components/services/section5/Section5";
import Section6 from "@components/services/section6/Section6";
import "./services.css";

const ServicesPage = () => {
  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo(0, 0);
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  return (
    <div className="services-page">
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
    </div>
  );
};

export default ServicesPage;
