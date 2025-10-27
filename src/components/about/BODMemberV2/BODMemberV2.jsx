import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import "./BODMemberV2.css";
import "../../../styles/grid-system.css";

const BODMemberV2 = () => {
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
  const carouselTrackRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCarousel();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  useEffect(() => {
    if (carouselTrackRef.current && !isAnimating.current) {
      gsap.set(carouselTrackRef.current, { x: 0 });
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (!isAnimating.current && carouselTrackRef.current) {
        setCurrentIndex((prev) => prev);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const updateCarousel = () => {
    if (isAnimating.current || !carouselTrackRef.current) return;

    isAnimating.current = true;
    const track = carouselTrackRef.current;
    const members = Array.from(track.children);

    const tl = gsap.timeline({
      onComplete: () => {
        const firstChild = track.firstElementChild;
        track.appendChild(firstChild);

        gsap.set(track, { x: 0 });

        const nextIndex = (currentIndex + 1) % teamMembers.length;
        setCurrentIndex(nextIndex);
        isAnimating.current = false;
      },
    });

    // Calculate shift distance based on first member's actual width
    const firstMember = members[0];
    const memberWidth = firstMember.offsetWidth;
    const containerWidth = track.parentElement.offsetWidth;
    const gridGap = containerWidth * 0.00625;
    const shiftDistance = memberWidth + gridGap;

    tl.to(
      track,
      {
        x: -shiftDistance,
        duration: 0.95,
        ease: "power3.out",
      },
      0
    );

    members.forEach((member, index) => {
      const isCurrentlyHighlighted = member.classList.contains("highlighted");
      const willBeHighlighted = index === 2;
      const isFirstMember = index === 0;
      const isLastMember = index === members.length - 1;

      if (willBeHighlighted) {
        tl.set(
          member,
          {
            filter: "grayscale(0%)",
            opacity: 1,
          },
          0
        );
      } else if (isCurrentlyHighlighted) {
        tl.to(
          member,
          {
            filter: "grayscale(100%)",
            opacity: 0.7,
            duration: 0.2,
            ease: "power3.out",
          },
          0
        );
      }

      if (isFirstMember) {
        tl.to(
          member,
          {
            opacity: 0,
            duration: 0.95,
            ease: "power3.out",
          },
          0
        );
      } else if (isLastMember) {
        tl.fromTo(
          member,
          { opacity: 0 },
          { opacity: 0.7, duration: 0.95, ease: "power3.out" },
          0
        );
      }
    });
  };

  const getVisibleMembers = () => {
    const visible = [];
    for (let i = 0; i < 6; i++) {
      const memberIndex = (currentIndex + i) % teamMembers.length;
      visible.push({
        ...teamMembers[memberIndex],
        isHighlighted: i === 1,
        carouselPosition: i,
        isHidden: i === 5,
      });
    }
    return visible;
  };

  const getHighlightedMember = () => {
    const visibleMembers = getVisibleMembers();
    return (
      visibleMembers.find((member) => member.isHighlighted) || teamMembers[0]
    );
  };

  return (
    <div className="bod-member-v2-section">
      <div className="grid-container bod-member-v2-grid">
        {/* Team Members Carousel */}
        <div className="team-carousel-track-v2" ref={carouselTrackRef}>
          {getVisibleMembers().map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className={`team-member-v2 team-member-${index} ${
                member.isHighlighted ? "highlighted" : ""
              } ${member.isHidden ? "hidden-member" : ""}`}
            >
              <div className="member-photo-v2">
                <img
                  src={member.image}
                  alt={member.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  className="placeholder-photo-v2"
                  style={{ display: "none" }}
                >
                  {member.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leader Quote - Grid-based */}
        <div className="leader-quote-content-v2">
          <p className="bodytext-3--no-margin">
            "As intelligence becomes abundant through technology, what remains
            rare is genuine emotion. Mirror exists to preserve that emotion - to
            cherish every loving moment and transform each gift you give into an
            extension of your heart. Because we believe the most precious gift
            isn't its value - it's the feeling of being truly understood. In a
            world chasing perfection, we choose what's real."
          </p>
        </div>

        {/* Leader Details - Grid-based */}
        <div className="leader-details-content-v2">
          <h3 className="heading-3--no-margin">
            {getHighlightedMember().position}
          </h3>
          <h2 className="leader-name-v2">{getHighlightedMember().name}</h2>
        </div>
      </div>
    </div>
  );
};

export default BODMemberV2;
