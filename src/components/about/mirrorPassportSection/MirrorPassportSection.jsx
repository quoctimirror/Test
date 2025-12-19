import "./MirrorPassportSection.css";
import UnderlineButton from "@components/common/button/UnderlineButton";

const MirrorPassportSection = () => {
  const cards = [
    {
      header: "EXPLORE",
      title: "MIRROR PASSPORT",
      description:
        "Mirror is not a place - it's a presence. Our Mirror Network connects every part of the journey: from customers and collaborators, to physical PODs and digital tools. Every touchpoint becomes a portal - amplifying presence, creativity, and connection.",
      buttonText: "Discover",
    },
    {
      header: "EXPLORE",
      title: "MIRROR PARTNER",
      description:
        "Mirror is not a place - it's a presence. Our Mirror Network connects every part of the journey: from customers and collaborators, to physical PODs and digital tools. Every touchpoint becomes a portal - amplifying presence, creativity, and connection.",
      buttonText: "Discover",
    },
  ];

  return (
    <section className="mirror-passport-section">
      <div className="passport-cards-container">
        {cards.map((card, index) => (
          <div key={index} className="passport-card">
            <div className="passport-card-content">
              <span className="bodytext-4--no-margin passport-header">
                {card.header}
              </span>
              <h2 className="heading-1--no-margin passport-title">
                {card.title}
              </h2>
              <p className="bodytext-4--no-margin passport-description">
                {card.description}
              </p>
              <UnderlineButton className="passport-button">
                {card.buttonText}
              </UnderlineButton>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MirrorPassportSection;
