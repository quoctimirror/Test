import React, { useState, useEffect } from "react";
import "./BODMember.css";

const BODMember = () => {
  const teamMembers = [
    {
      name: "Uyen Dong",
      position: "CMO",
      image: "/about/BODMember/MsUyen.svg",
      isMainLeader: true,
    },
    {
      name: "Kenneth Nguyen",
      position: "CSO",
      image: "/about/BODMember/MrKhanh.svg",
      isMainLeader: true,
    },
    {
      name: "Hai Son Dang",
      position: "CEO",
      image: "/about/BODMember/MrSon.svg",
      isMainLeader: true,
    },
    {
      name: "Kim Ngan Tran",
      position: "CSIR",
      image: "/about/BODMember/MsNgan.svg",
      isMainLeader: true,
    },
    {
      name: "Nhat Minh Tran",
      position: "CTO",
      image: "/about/BODMember/MrMinh.svg",
      isMainLeader: true,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % teamMembers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [teamMembers.length]);

  const getVisibleMembers = () => {
    const visible = [];
    for (let i = 0; i < 5; i++) {
      const memberIndex = (currentIndex + i) % teamMembers.length;
      visible.push({
        ...teamMembers[memberIndex],
        isHighlighted: i === 1, // Vị trí thứ 2 từ trái (index 1)
        position: i
      });
    }
    return visible;
  };

  const getHighlightedMember = () => {
    const visibleMembers = getVisibleMembers();
    return visibleMembers.find(member => member.isHighlighted) || teamMembers[0];
  };

  return (
    <div className="bod-member-section">
      {/* Team Members Carousel */}
      <div className="team-carousel">
        <div className="team-carousel-track">
          {getVisibleMembers().map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className={`team-member ${member.isHighlighted ? 'highlighted' : ''}`}
            >
              <div className="member-photo">
                <img
                  src={member.image}
                  alt={member.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="placeholder-photo" style={{ display: "none" }}>
                  {member.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leader Quote */}
      <div className="leader-quote">
        <p className="quote-text">
          "As intelligence becomes abundant through technology, 
          what remains rare is genuine emotion. Mirror exists to 
          preserve that emotion — to cherish every loving moment 
          and transform each gift you give into an extension of your 
          heart. Because we believe the most precious gift isn't its 
          value — it's the feeling of being truly understood. In a 
          world chasing perfection, we choose what's real."
        </p>
      </div>

      {/* Leader Details */}
      <div className="leader-details">
        <span className="leader-position">{getHighlightedMember().position}</span>
        <h2 className="leader-name">{getHighlightedMember().name}</h2>
      </div>
    </div>
  );
};

export default BODMember;
