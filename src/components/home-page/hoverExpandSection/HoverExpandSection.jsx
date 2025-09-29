import "./HoverExpand.css";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import image1 from "/home-page/hover-expand/Ring.png";
import image2 from "/home-page/hover-expand/Earring.png";
import image3 from "/home-page/hover-expand/Necklace.png";
import image4 from "/home-page/hover-expand/Bracelet.png";

const HoverExpandSection = () => {
  const navigate = useNavigate();

  const handleExploreMoreClick = async () => {
    sessionStorage.setItem("scrollToTop", "true");
    await optimizedTransitionUtils.transitionToRoute(navigate, "/collections");
  };

  return (
    <div className="hover-expand-section">
      <div className="hover-expand-header">
        <h2 className="heading-1--no-margin hover-expand-title">
          EXPLORE THE GEMS
        </h2>
        <p className="bodytext-3--no-margin hover-expand-subtitle">
          Discover a variety of our pieces.
        </p>
        <ShineGlassButton
          theme="footer"
          className="explore-more-button"
          onClick={handleExploreMoreClick}
        >
          Explore more
        </ShineGlassButton>
      </div>

      <div className="hover-expand-gallery">
        <div className="hover-expand-gradient-top"></div>
        <div className="gallery-item">
          <img src={image1} alt="Jewelry piece 1" />
          <p className="bodytext-1--no-margin gallery-item-text">
            Premium Collection
          </p>
        </div>
        <div className="gallery-item">
          <img src={image2} alt="Jewelry piece 2" />
          <p className="bodytext-1--no-margin gallery-item-text">
            Luxury Rings
          </p>
        </div>
        <div className="gallery-item">
          <img src={image3} alt="Jewelry piece 3" />
          <p className="bodytext-1--no-margin gallery-item-text">
            Diamond Series
          </p>
        </div>
        <div className="gallery-item">
          <img src={image4} alt="Jewelry piece 4" />
          <p className="bodytext-1--no-margin gallery-item-text">
            Signature Pieces
          </p>
        </div>
      </div>
    </div>
  );
};

export default HoverExpandSection;
