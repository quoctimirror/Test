import Logo from "@assets/images/Logo.svg";
import "./FutureDiamond.css";

const FutureDiamond = () => {
  return (
    <section className="future-diamond">
      <div className="future-diamond-content">
        <div className="future-diamond-logo-container">
          <img src={Logo} alt="Mirror Logo" className="future-diamond-logo" />
        </div>
        
        <h1 className="future-diamond-title">Future Diamond</h1>
        
        <div className="future-diamond-description">
          <h1 className="heading-1--no-margin">
            The world's newest diamond cut, a<br />
            new star is born. Its 91 facets sparkle<br />
            the brightest, emitting a fire like no<br />
            other in a celebration of the<br />
            constellations and the extraordinary<br />
            potential of mankind.
          </h1>
        </div>
      </div>
    </section>
  );
};

export default FutureDiamond;