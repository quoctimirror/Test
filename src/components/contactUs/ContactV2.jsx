import React from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import { ROUTES } from "@/constants/routes";
import UnderlineButton from "@components/common/button/UnderlineButton";
import "./ContactV2.css";

const ContactV2 = () => {
  const navigate = useNavigate();

  const handleBookAppointment = async () => {
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.BOOK_APPOINTMENT);
  };

  return (
    <section className="contact-v2">
      <div className="contact-v2-header" data-navbar-theme="white">
        <h2 className="contact-v2-title heading-1--no-margin">CONTACT US</h2>
        <p className="contact-v2-subtitle bodytext-4--no-margin">
          Have a question or concern? Our team is standing by to assist
        </p>
      </div>

      <div className="contact-v2-cards" data-navbar-theme="black">
        <div className="contact-v2-card">
          <div className="contact-v2-card-content">
            <h3 className="contact-v2-card-title bodytext-1--no-margin">
              LIVE CHAT
            </h3>
            <p className="contact-v2-card-details bodytext-4--no-margin">
              Available Mon - Fri 09:00-21:00
            </p>
            <UnderlineButton
              className="contact-v2-card-link"
              textClassName="bodytext-4--no-margin"
            >
              Chat now
            </UnderlineButton>
          </div>
          <span className="contact-v2-card-arrow">›</span>
        </div>

        <div className="contact-v2-card">
          <div className="contact-v2-card-content">
            <h3 className="contact-v2-card-title bodytext-1--no-margin">
              PHONE CALL
            </h3>
            <p className="contact-v2-card-details bodytext-4--no-margin">
              TEL: +44 (0) 207 758 9780
              <br />
              Available Mon - Fri 09:00-19:00
            </p>
            <a href="tel:+442077589780">
              <UnderlineButton
                className="contact-v2-card-link"
                textClassName="bodytext-4--no-margin"
              >
                Call now
              </UnderlineButton>
            </a>
          </div>
          <span className="contact-v2-card-arrow">›</span>
        </div>

        <div className="contact-v2-card">
          <div className="contact-v2-card-content">
            <h3 className="contact-v2-card-title bodytext-1--no-margin">EMAIL</h3>
            <p className="contact-v2-card-details bodytext-4--no-margin">
              support@mirrorfuturediamond.com
              <br />
              Available: 24/7
            </p>
            <a href="mailto:support@mirrorfuturediamond.com">
              <UnderlineButton
                className="contact-v2-card-link"
                textClassName="bodytext-4--no-margin"
              >
                Send email
              </UnderlineButton>
            </a>
          </div>
          <span className="contact-v2-card-arrow">›</span>
        </div>

        <div className="contact-v2-card clickable" onClick={handleBookAppointment}>
          <div className="contact-v2-card-content">
            <h3 className="contact-v2-card-title bodytext-1--no-margin">
              APPOINTMENT
            </h3>
            <p className="contact-v2-card-details bodytext-4--no-margin">
              In-store Appointments or Virtual Consultation
              <br />
              Available Mon - Fri 09:00-19:00
            </p>
            <UnderlineButton
              className="contact-v2-card-link"
              textClassName="bodytext-4--no-margin"
            >
              Book an appointment
            </UnderlineButton>
          </div>
          <span className="contact-v2-card-arrow">›</span>
        </div>
      </div>
    </section>
  );
};

export default ContactV2;
