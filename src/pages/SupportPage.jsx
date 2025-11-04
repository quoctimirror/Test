import React, { useEffect } from "react";
import Section3 from "@components/services/section3/Section3";
import Section4 from "@components/services/section4/Section4";
import Section5 from "@components/services/section5/Section5";
import ContactUs from "@components/contactUs/ContactUs";

const SupportPage = () => {
  useEffect(() => {
    // Check if we need to scroll to top
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  return (
    <div className="support-page">
      <main>
        <Section3 />
        <Section4 />
        <Section5 />
        <ContactUs />
      </main>
    </div>
  );
};

export default SupportPage;
