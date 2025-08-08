import "./ContactUs.css";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
  const navigate = useNavigate();

  const handleContactUsClick = () => {
    sessionStorage.setItem('scrollToTop', 'true');
    navigate("/support");
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
        <p className="bodytext-3">Our client care experts are always here to help.</p>
        <div className="contact-us-button-wrapper">
          <button className="contact-us-button bodytext-4" onClick={handleContactUsClick}>
            Contact us
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
