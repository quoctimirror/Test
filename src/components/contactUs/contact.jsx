import React from "react";
import { MediaImage } from "@components/common/media";
import "./contact.css";

const Contact = () => {
  return (
    <section className="contact" data-navbar-theme="white">
      <div className="contact-header">
        <h2 className="contact-title heading-3--no-margin">CONTACT US</h2>
        <p className="contact-subtitle bodytext-4--no-margin">
          Have a question or concern? Our team is standing by to assist
        </p>
      </div>

      <div className="contact-cards-grid">
        {/* Top gradient box */}
        <div className="cards-gradient-top"></div>
        <div className="contact-card">
          <MediaImage
            src="services/img_1_section_6.webp"
            alt="Live Chat"
            className="contact-image"
          />
          <div className="contact-overlay">
            <h3 className="contact-method bodytext-1--no-margin">LIVE CHAT</h3>
            <p className="contact-details">Available Mon - Fri 09:00-21:00</p>
          </div>
        </div>

        <div className="contact-card">
          <MediaImage
            src="services/img_2_section_6.webp"
            alt="Phone Call"
            className="contact-image"
          />
          <div className="contact-overlay">
            <h3 className="contact-method bodytext-1--no-margin">PHONE CALL</h3>
            <p className="contact-details">
              TEL: +44 (0) 207 758 9780
              <br />
              Available Mon - Fri 09:00-19:00
            </p>
          </div>
        </div>

        <div className="contact-card">
          <MediaImage
            src="services/img_3_section_6.webp"
            alt="Email"
            className="contact-image"
          />
          <div className="contact-overlay">
            <h3 className="contact-method bodytext-1--no-margin">EMAIL</h3>
            <p className="contact-details">
              support@mirrorfuturadiamond.com
              <br />
              Available 24/7
            </p>
          </div>
        </div>

        <div className="contact-card">
          <MediaImage
            src="services/img_4_section_6.webp"
            alt="Appointment"
            className="contact-image"
          />
          <div className="contact-overlay">
            <h3 className="contact-method bodytext-1--no-margin">APPOINTMENT</h3>
            <p className="contact-details">
              In-store Appointments or Virtual Consultation
              <br />
              Available Mon - Fri 09:00-19:00
            </p>
          </div>
        </div>

        {/* Bottom gradient box */}
        <div className="cards-gradient-bottom"></div>
      </div>
    </section>
  );
};

export default Contact;