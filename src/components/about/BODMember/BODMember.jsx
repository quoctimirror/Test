import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
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
  const carouselTrackRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCarousel();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // Reset track position sau mỗi lần React re-render
  useEffect(() => {
    if (carouselTrackRef.current && !isAnimating.current) {
      gsap.set(carouselTrackRef.current, { x: 0 });
    }
  }, [currentIndex]);

  const updateCarousel = () => {
    if (isAnimating.current || !carouselTrackRef.current) return;

    isAnimating.current = true;
    const track = carouselTrackRef.current;
    const members = Array.from(track.children);
    
    // Inspired by carouselvip.html - smooth infinite loop
    const tl = gsap.timeline({
      onComplete: () => {
        // Move first element to end (như trong carouselvip.html)
        const firstChild = track.firstElementChild;
        track.appendChild(firstChild);
        
        // Reset track position
        gsap.set(track, { x: 0 });
        
        // Update state
        const nextIndex = (currentIndex + 1) % teamMembers.length;
        setCurrentIndex(nextIndex);
        isAnimating.current = false;
      }
    });

    // Calculate positions (based on carouselvip.html slot system)
    const containerWidth = track.parentElement.offsetWidth;
    const gap = containerWidth * 0.00625; // 0.625% gap như CSS
    const baseWidth = 294;
    const baseHeight = 441;
    const highlightedWidth = 600;
    const highlightedHeight = 902;
    
    // Smooth slide all elements to left (giống carouselvip.html line 122-125)
    tl.to(track, {
      x: -(baseWidth + gap),
      duration: 0.95,
      ease: "power3.out" // easeOutCubic như carouselvip
    }, 0);

    // Concurrent animations for each member (giống carouselvip.html concurrent approach)
    members.forEach((member, index) => {
      const photo = member.querySelector('.member-photo');
      if (!photo) return;

      // Current state detection
      const isCurrentlyHighlighted = member.classList.contains('highlighted');
      const willBeHighlighted = index === 2; // Will be highlighted next
      const isFirstMember = index === 0; // Will slide out
      const isLastMember = index === members.length - 1; // Hidden member

      // Apply size changes during slide (concurrent với track movement)
      if (isCurrentlyHighlighted) {
        // Currently highlighted shrinks to normal
        tl.to(photo, {
          width: baseWidth,
          height: baseHeight,
          duration: 0.95,
          ease: "power3.out"
        }, 0);
      } else if (willBeHighlighted) {
        // Next highlighted grows
        tl.to(photo, {
          width: highlightedWidth,
          height: highlightedHeight,
          duration: 0.95,
          ease: "power3.out"
        }, 0);
      }

      // Fade effects
      if (isFirstMember) {
        // First member fades out as it slides left
        tl.to(member, {
          opacity: 0,
          duration: 0.95,
          ease: "power3.out"
        }, 0);
      } else if (isLastMember) {
        // Hidden member appears from right (giống carouselvip.html ghost card)
        tl.fromTo(member, 
          { opacity: 0 },
          { opacity: 0.7, duration: 0.95, ease: "power3.out" }, 0
        );
      }
    });
  };

  const getVisibleMembers = () => {
    const visible = [];
    // Tạo 6 members: 5 visible + 1 ẩn bên phải để slide vào
    for (let i = 0; i < 6; i++) {
      const memberIndex = (currentIndex + i) % teamMembers.length;
      visible.push({
        ...teamMembers[memberIndex],
        isHighlighted: i === 1, // Vị trí thứ 2 từ trái (index 1)
        carouselPosition: i, // Dùng carouselPosition thay vì ghi đè position
        isHidden: i === 5 // Member thứ 6 ẩn ban đầu
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
        <div className="team-carousel-track" ref={carouselTrackRef}>
          {getVisibleMembers().map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              className={`team-member ${member.isHighlighted ? 'highlighted' : ''} ${member.isHidden ? 'hidden-member' : ''}`}
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
        <p className="bodytext-3--no-margin">
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
        <h3 className="heading-3--no-margin">{getHighlightedMember().position}</h3>
        <h2 className="leader-name">{getHighlightedMember().name}</h2>
      </div>
    </div>
  );
};

export default BODMember;
