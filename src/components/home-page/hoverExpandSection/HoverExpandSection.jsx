import "./HoverExpand.css";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import image1 from "@assets/images/hover-expand/img_1.jpg";
import image2 from "@assets/images/hover-expand/img_2.jpg";
import image3 from "@assets/images/hover-expand/img_3.jpg";
import image4 from "@assets/images/hover-expand/img_4.jpg";

const HoverExpandSection = () => {
  const navigate = useNavigate();

  const handleExploreMoreClick = async () => {
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, "/collections");
  };

  return (
    <div className="hover-expand-section">
      <div className="hover-expand-header">
        <h2 className="heading-1 hover-expand-title">EXPLORE THE GEMS</h2>
        <p className="bodytext-3 hover-expand-subtitle">
          Discover a variety of our pieces.
        </p>
        <ShineGlassButton
          width={163}
          height={57}
          fontSize={14}
          theme="footer"
          className="explore-more-button"
          onClick={handleExploreMoreClick}
        >
          Explore more
        </ShineGlassButton>
      </div>

      <div className="hover-expand-gallery">
        <div className="gallery-item">
          <img src={image1} alt="Jewelry piece 1" />
        </div>
        <div className="gallery-item">
          <img src={image2} alt="Jewelry piece 2" />
        </div>
        <div className="gallery-item">
          <img src={image3} alt="Jewelry piece 3" />
        </div>
        <div className="gallery-item">
          <img src={image4} alt="Jewelry piece 4" />
        </div>
      </div>
    </div>
  );
};

export default HoverExpandSection;
