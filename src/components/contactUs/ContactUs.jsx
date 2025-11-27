import "./ContactUs.css";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import UnderlineButtonOpposite from "@components/common/button/UnderlineButtonOpposite";
import { MediaImage } from "@components/common/media";
import { ROUTES } from "@/constants/routes";

const ContactUs = () => {
  const navigate = useNavigate();

  const handleBookAppointmentClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.BOOK_APPOINTMENT);
  };

  const handleLiveChatClick = () => {
    // TODO: Open live chat widget
    console.log("Open live chat");
  };

  const handlePhoneCallClick = () => {
    window.location.href = "tel:+442077589780";
  };

  return (
    <section className="contact-us-hero">
      <MediaImage
        src="contactUs/ReachOut.svg"
        alt="Contact Us Background"
        className="contact-us-hero-background"
      />
      <div className="contact-us-gradient-box"></div>
      <div className="contact-us-hero-content">
        <h4 className="bodytext-4--no-margin">NEED HELP?</h4>
        <h1 className="heading-1--no-margin">REACH OUT</h1>
        <p className="bodytext-4--no-margin">We would love to hear from you.</p>
        <p className="bodytext-4--no-margin">
          Our client care experts are always here to help.
        </p>
        <div className="contact-us-button-wrapper">
          <ShineGlassButton
            theme="footer"
            onClick={handleBookAppointmentClick}
            className="contact-us-button"
          >
            Book an Appointment
          </ShineGlassButton>
        </div>
        <div className="contact-us-actions">
          <UnderlineButtonOpposite
            onClick={handleLiveChatClick}
            textClassName="bodytext-4--no-margin"
          >
            Start a live chat
          </UnderlineButtonOpposite>
          <span className="contact-us-separator bodytext-4--no-margin">or</span>
          <UnderlineButtonOpposite
            onClick={handlePhoneCallClick}
            textClassName="bodytext-4--no-margin"
          >
            Make a phone call
          </UnderlineButtonOpposite>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
