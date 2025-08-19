import "./ImmersiveShowroom.css";

const ImmersiveShowroom = () => {
  return (
    <div className="immersive-showroom">
      <img
        src="/immersiveShowroom/immersiveShowroomBackground.svg"
        alt="Immersive Showroom Background"
        className="showroom-background"
      />
      <div className="showroom-content">
        <h4 className="bodytext-3 showroom-subtitle">
          WHERE TECHNOLOGY MEETS EMOTIONS
        </h4>
        <h1 className="heading-1 showroom-title">IMMERSIVE SHOWROOM</h1>
        <p className="bodytext-3 showroom-description">
          Step into Mirror's physical universe — a sensorial space
          <br />
          where light, sound, and storytelling converge. Here, lab-
          <br />
          grown brilliance comes alive through cinematic displays,
          <br />
          tactile explorations and AR/VR encounters that let you
          <br />
          feel the future of luxury before you wear it.
        </p>
        <button className="explore-button bodytext-4">Explore</button>
      </div>
    </div>
  );
};

export default ImmersiveShowroom;
