import "./BODMemberV4.css";
import "@styles/grid-system.css";
import { useState, useEffect, useRef } from "react";

const BODMemberV4 = () => {
  const [hoveredImage, setHoveredImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [imagePosition, setImagePosition] = useState(50);
  const [imageAlignment, setImageAlignment] = useState("center"); // 'top', 'center', 'bottom'
  const rowRefs = useRef([]);
  const sectionRef = useRef(null);
  const membersGridRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Distance threshold for hover detection (px)
  const HOVER_DISTANCE_THRESHOLD = 200;

  const teamMembers = [
    {
      name: "Kenneth Nguyen",
      position: "Chief Strategy Officer",
      image: "/about/BODMember/A KHÁNH.png",
    },
    {
      name: "Dang Hai Son",
      position: "Chief Executive Officer",
      image: "/about/BODMember/A SƠN.png",
    },
    {
      name: "Tran Kim Ngan",
      position: "CSIR",
      image: "/about/BODMember/MsNgan.svg",
    },
    {
      name: "Tran Nhat Minh",
      position: "Chief Technology Officer",
      image: "/about/BODMember/A MINH.png",
    },
    {
      name: "Dong Thi Phuong Uyen",
      position: "Chief Marketing Officer",
      image: "/about/BODMember/C UYÊN 2.png",
    },
    {
      name: "Minh Khoa",
      position: "Art Director",
      image: "/about/BODMember/A KHOA.png",
    },
    {
      name: "Duy Khanh",
      position: "3D Jewelry Designer",
      image: "/about/BODMember/A KHÁNH.png",
    },
    {
      name: "Le Gia Quoc Ti",
      position: "Creative Developer",
      image: "/about/BODMember/TI.png",
    },
    {
      name: "Dang Phuong Nam",
      position: "Creative Developer",
      image: "/about/BODMember/NAM.png",
    },
    {
      name: "Pham Ngoc Khanh Doan",
      position: "Designer",
      image: "/about/BODMember/ĐOAN.png",
    },
    {
      name: "Nguyen Hien",
      position: "Designer",
      image: "/about/BODMember/HIỀN.png",
    },
    {
      name: "An Khanh Nhat",
      position: "Designer",
      image: "/about/BODMember/AN.png",
    },
    {
      name: "Uy Nhu",
      position: "Designer",
      image: "/about/BODMember/NHƯ.png",
    },
  ];

  // Preload all images on mount để tránh delay khi hover
  useEffect(() => {
    teamMembers.forEach((member) => {
      const img = new Image();
      img.src = member.image;
    });
  }, []);

  // Check if members grid is visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsGridVisible(entry.isIntersecting);
          if (!entry.isIntersecting) {
            setActiveIndex(null);
            setHoveredImage(null);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentGrid = membersGridRef.current;
    if (currentGrid) {
      observer.observe(currentGrid);
    }

    return () => {
      if (currentGrid) {
        observer.unobserve(currentGrid);
      }
    };
  }, []);

  // Calculate image position based on members grid position
  useEffect(() => {
    const updateImagePosition = () => {
      if (!membersGridRef.current) return;

      const rect = membersGridRef.current.getBoundingClientRect();
      const viewportMiddle = window.innerHeight / 2;

      // If section top is below viewport middle, align image top to section top
      if (rect.top > viewportMiddle) {
        setImagePosition(rect.top);
        setImageAlignment("top");
      }
      // If section bottom is above viewport middle, align image bottom to section bottom
      else if (rect.bottom < viewportMiddle) {
        setImagePosition(rect.bottom);
        setImageAlignment("bottom");
      }
      // Section spans across viewport middle, center the image
      else {
        setImagePosition(viewportMiddle);
        setImageAlignment("center");
      }
    };

    updateImagePosition();
    window.addEventListener("scroll", updateImagePosition);
    window.addEventListener("resize", updateImagePosition);

    return () => {
      window.removeEventListener("scroll", updateImagePosition);
      window.removeEventListener("resize", updateImagePosition);
    };
  }, []);

  useEffect(() => {
    let scrollAnimationFrame = null;

    // Function to check hover based on mouse position
    const checkHover = (mouseY) => {
      if (!isGridVisible) return;

      let closestIndex = null;
      let closestDistance = Infinity;

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const rect = row.getBoundingClientRect();
          const rowCenterY = rect.top + rect.height / 2;
          const distance = Math.abs(mouseY - rowCenterY);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });

      if (closestIndex !== null && closestDistance < HOVER_DISTANCE_THRESHOLD) {
        setActiveIndex(closestIndex);
        setHoveredImage(teamMembers[closestIndex].image);
      } else {
        setActiveIndex(null);
        setHoveredImage(null);
      }
    };

    const handleMouseMove = (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      checkHover(e.clientY);
    };

    const handleScroll = () => {
      // Throttle with requestAnimationFrame for smooth performance
      if (scrollAnimationFrame) return;

      scrollAnimationFrame = requestAnimationFrame(() => {
        checkHover(mousePositionRef.current.y);
        scrollAnimationFrame = null;
      });
    };

    const handleMouseLeave = () => {
      setActiveIndex(null);
      setHoveredImage(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (scrollAnimationFrame) {
        cancelAnimationFrame(scrollAnimationFrame);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [teamMembers, isGridVisible]);

  const getTransform = () => {
    if (imageAlignment === "top") return "translateY(0)";
    if (imageAlignment === "bottom") return "translateY(-100%)";
    return "translateY(-50%)";
  };

  return (
    <div className="bod-member-v4-section" ref={sectionRef}>
      {/* Intro Section */}
      <div className="bod-intro">
        <div className="grid-container">
          <div className="bod-intro-content">
            <span className="bodytext-4--no-margin bod-intro-header">
              WHO WE ARE?
            </span>
            <h1 className="heading-1--no-margin bod-intro-title">
              THE MINDS BEHIND MIRROR
            </h1>
            <p className="bodytext-4--no-margin bod-intro-desc">
              Mirror is led by a collective of visionaries - blending
              innovation, design, and purpose. From strategy to storytelling, we
              shape a brand that's equal parts emotional and engineered.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden images for preloading - ensures browser caches all images */}
      <div style={{ display: "none" }} aria-hidden="true">
        {teamMembers.map((member, idx) => (
          <img key={idx} src={member.image} alt="" />
        ))}
      </div>

      {/* Central image display - Load from /public folder only */}
      <div
        className={`central-member-image ${
          hoveredImage && isGridVisible ? "visible" : ""
        }`}
        style={{
          top: `${imagePosition}px`,
          transform: getTransform(),
        }}
      >
        {hoveredImage && <img src={hoveredImage} alt="Team member" />}
      </div>

      <div className="grid-container members-grid" ref={membersGridRef}>
        {teamMembers.map((member, index) => (
          <div
            key={index}
            ref={(el) => (rowRefs.current[index] = el)}
            className={`member-row ${activeIndex === index ? "active" : ""}`}
          >
            <div className="member-name">
              <h2 className="heading-2--no-margin">{member.name}</h2>
            </div>
            <div className="member-position">
              <p className="bodytext-4--no-margin">{member.position}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BODMemberV4;
