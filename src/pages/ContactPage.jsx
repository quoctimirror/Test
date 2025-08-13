import React, { useEffect } from "react";
import Contact from "@components/contactUs/contact";

const ContactPage = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page">
      <Contact />
    </div>
  );
};

export default ContactPage;