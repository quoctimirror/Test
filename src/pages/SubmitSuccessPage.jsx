import { useNavigate } from "react-router-dom";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import UnderlineButton from "@components/common/button/UnderlineButton";
import "./SubmitSuccessPage.css";

const SubmitSuccessPage = () => {
  const navigate = useNavigate();

  const handleImmersiveShowroom = () => {
    // Navigate to immersive showroom page
    navigate("/immersive-showroom");
  };

  const handleBackToSubmit = () => {
    navigate("/mirror-in-milan-digital-jewelry-week");
  };

  return (
    <div className="submit-success-page">
      <div className="submit-success-content">
        <h1 className="submit-success-title heading-1--no-margin">
          SUBMITTED!
        </h1>
        <p className="submit-success-description bodytext-3--no-margin">
          You’ll get a confirmation email with your submission.
        </p>

        <div className="submit-success-buttons">
          <ShineGlassButton theme="light" onClick={handleImmersiveShowroom}>
            Immersive Showroom
          </ShineGlassButton>
          <UnderlineButton
            className="submit-success-back-btn"
            textClassName="bodytext-4--no-margin"
            onClick={handleBackToSubmit}
          >
            Back to submit page
          </UnderlineButton>
        </div>
      </div>
    </div>
  );
};

export default SubmitSuccessPage;
