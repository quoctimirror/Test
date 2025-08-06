import React from "react";
import "./Section6.css";

const Section6 = () => {
  return (
    <section className="services-section6">
      <div className="section6-header">
        <h2 className="section6-title">CONTACT US</h2>
        <p className="section6-subtitle">
          Have a question or concern? Our team is standing by to assist
        </p>
      </div>

      <div className="contact-cards-grid">
        <div className="contact-card">
          <img
            src="/services/img_1_section_6.jpg"
            alt="Live Chat"
            className="contact-image"
          />
          <div className="contact-overlay">
            <h3 className="contact-method">LIVE CHAT</h3>
            <p className="contact-details">Available Mon - Fri 09:00-21:00</p>
          </div>
        </div>

        <div className="contact-card">
          <img
            src="/services/img_2_section_6.jpg"
            alt="Phone Call"
            className="contact-image"
          />
          <div className="contact-overlay">
            <h3 className="contact-method">PHONE CALL</h3>
            <p className="contact-details">
              TEL: +44 (0) 207 758 9780
              <br />
              Available Mon - Fri 09:00-19:00
            </p>
          </div>
        </div>

        <div className="contact-card">
          <img
            src="/services/img_3_section_6.jpg"
            alt="Email"
            className="contact-image"
          />
          <div className="contact-overlay">
            <h3 className="contact-method">EMAIL</h3>
            <p className="contact-details">
              support@mirrorfuturadiamond.com
              <br />
              Available 24/7
            </p>
          </div>
        </div>

        <div className="contact-card">
          <img
            src="/services/img_4_section_6.png"
            alt="Appointment"
            className="contact-image"
          />
          <div className="contact-overlay">
            <h3 className="contact-method">APPOINTMENT</h3>
            <p className="contact-details">
              In-store Appointments or Virtual Consultation
              <br />
              Available Mon - Fri 09:00-19:00
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section6;
