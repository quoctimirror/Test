import "./Lumex91.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const Lumex91 = () => {
  return (
    <section className="lumex91">
      <div className="lumex91-container">
        <div className="lumex91-video-box">
          <img
            className="lumex91-video"
            src="/home-page/Mirror-Lumex 91.png"
            alt="Mirror-Lumex 91"
          />
          <div className="lumex91-circle-overlay"></div>
        </div>

        <div className="lumex91-content">
          <h1 className="heading-1--no-margin">Lumex-91</h1>
          <ShineGlassButton theme="footer">Explore more</ShineGlassButton>
        </div>
      </div>
    </section>
  );
};

export default Lumex91;
