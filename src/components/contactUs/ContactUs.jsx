import "./ContactUs.css";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import { ROUTES } from "@/constants/routes";

const ContactUs = () => {
  const navigate = useNavigate();

  const handleContactUsClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(navigate, ROUTES.CONTACT);
  };

  return (
    <div className="contact-us-hero">
      <img
        src="/contactUs/ReachOut.svg"
        alt="Contact Us Background"
        className="contact-us-hero-background"
      />
      <div className="contact-us-gradient-box"></div>
      <div className="contact-us-hero-content">
        <h4 className="bodytext-3--no-margin">NEED HELP?</h4>
        <h1 className="heading-1--no-margin">REACH OUT</h1>
        <p className="bodytext-3--no-margin">We would love to hear from you.</p>
        <p className="bodytext-3--no-margin">
          Our client care experts are always here to help.
        </p>
        <div className="contact-us-button-wrapper">
          <ShineGlassButton
            theme="footer"
            onClick={handleContactUsClick}
            className="contact-us-button"
          >
            Contact us
          </ShineGlassButton>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
