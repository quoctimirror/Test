import { useNavigate } from "react-router-dom";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import UnderlineButton from "@components/common/button/UnderlineButton";
import "./SubmitSuccessPage.css";
import { ROUTES } from "@/constants/routes";

const SubmitSuccessPage = () => {
  const navigate = useNavigate();

  const handleImmersiveShowroom = () => {
    // Navigate to immersive showroom page
    navigate(ROUTES.IMMERSIVE_SHOWROOM);
  };

  const handleBackToSubmit = () => {
    navigate(ROUTES.MILAN_SUBMIT);
  };

  return (
    <div className="submit-success-page">
      <div className="submit-success-content">
        <h1 className="submit-success-title heading-1--no-margin">
          SUBMITTED!
        </h1>
        <p className="submit-success-description bodytext-3--no-margin">
          You will receive a confirmation email with your submission.
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
            Back to submission page
          </UnderlineButton>
        </div>
      </div>
    </div>
  );
};

export default SubmitSuccessPage;
