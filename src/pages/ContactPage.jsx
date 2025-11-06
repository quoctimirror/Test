import React, { useEffect } from "react";
import ContactV2 from "@components/contactUs/ContactV2";

const ContactPage = () => {
  useEffect(() => {
    // Scroll to top when page loads
    if (sessionStorage.getItem('scrollToTop') === 'true') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      sessionStorage.removeItem('scrollToTop');
    }
  }, []);

  return (
    <div className="contact-page">
      <ContactV2 />
    </div>
  );
};

export default ContactPage;