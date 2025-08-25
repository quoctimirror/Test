import "./ContactUs.css";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "../../utils/optimizedTransitionUtils";
import GlassButton from "../common/button/GlassButton";

const ContactUs = () => {
  const navigate = useNavigate();

  const handleContactUsClick = async () => {
    await optimizedTransitionUtils.transitionToRoute(navigate, "/contact");
  };

  return (
    <div className="hero">
      <img
        src="/contactUs/ReachOut.svg"
        alt="Contact Us Background"
        className="hero-background"
      />
      <div className="hero-content">
        <h4 className="bodytext-3">NEED HELP?</h4>
        <h1 className="heading-1">REACH OUT</h1>
        <p className="bodytext-3">We would love to hear from you.</p>
        <p className="bodytext-3">
          Our client care experts are always here to help.
        </p>
        <div className="contact-us-button-wrapper">
          <GlassButton
            width={150}
            height={57}
            fontSize={14}
            onClick={handleContactUsClick}
            className="contact-us-button"
          >
            Contact us
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
