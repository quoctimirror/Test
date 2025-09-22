import "./ImmersiveShowroom.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const ImmersiveShowroom = () => {
  return (
    <div className="immersive-showroom">
      <video
        src="/immersiveShowroom/ImmersiveShowroom.mp4"
        className="showroom-background"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="showroom-content">
        <h4 className="bodytext-3--no-margin showroom-subtitle">
          WHERE TECHNOLOGY MEETS EMOTIONS
        </h4>
        <h1 className="heading-1--no-margin showroom-title">
          IMMERSIVE SHOWROOM
        </h1>
        <p className="bodytext-3--no-margin showroom-description">
          Step into Mirror's physical universe — a sensorial space where light,
          sound, and storytelling converge. Here, lab- grown brilliance comes
          alive through cinematic displays, tactile explorations and AR/VR
          encounters that let you feel the future of luxury before you wear it.
        </p>
        <ShineGlassButton theme="footer" className="explore-button">
          Explore
        </ShineGlassButton>
      </div>
    </div>
  );
};

export default ImmersiveShowroom;
