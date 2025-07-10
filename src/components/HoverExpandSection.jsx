import "../styles/hover_expand.css";
import image1 from "../assets/images/hover-expand/image_1.svg";
import image2 from "../assets/images/hover-expand/image_2.svg";
import image3 from "../assets/images/hover-expand/image_3.svg";
import image4 from "../assets/images/hover-expand/image_4.svg";

const HoverExpandSection = () => {

  return (
    <div className="hover-expand-section">
      <div className="hover-expand-header">
        <h2 className="hover-expand-title">EXPLORE THE GEMS.</h2>
        <p className="hover-expand-subtitle">Discover a variety of our pieces.</p>
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
