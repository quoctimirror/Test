import "./Lumex91.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const Lumex91 = () => {
  return (
    <section className="lumex91">
      <div className="lumex91-container">
        <div className="lumex91-video-box">
          <video
            className="lumex91-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/home-page/lumex91.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
