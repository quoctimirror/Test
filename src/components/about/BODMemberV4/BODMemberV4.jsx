import "./BODMemberV4.css";
import "../../../styles/grid-system.css";
import { useState, useEffect, useRef } from "react";
import { MediaImage } from "@components/common/media";

const BODMemberV4 = () => {
  const [hoveredImage, setHoveredImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [imagePosition, setImagePosition] = useState(50);
  const [imageAlignment, setImageAlignment] = useState("center"); // 'top', 'center', 'bottom'
  const rowRefs = useRef([]);
  const sectionRef = useRef(null);

  const teamMembers = [
    {
      name: "Kenneth Nguyen",
      position: "Chief Strategy Officer",
      image: "about/BODMember/MrKhanh.svg",
    },
    {
      name: "Dang Hai Son",
      position: "Chief Executive Officer",
      image: "about/BODMember/MrSon.svg",
    },
    {
      name: "Tran Kim Ngan",
      position: "CSIR",
      image: "about/BODMember/MsNgan.svg",
    },
    {
      name: "Tran Nhat Minh",
      position: "Chief Technology Officer",
      image: "about/BODMember/MrMinh.svg",
    },
    {
      name: "Dong Thi Phuong Uyen",
      position: "Chief Marketing Officer",
      image: "about/BODMember/MsUyen.svg",
    },
    {
      name: "Minh Khoa",
      position: "Art Director",
      image: "about/BODMember/MrKhanh.svg",
    },
    {
      name: "Duy Khanh",
      position: "3D Jewelry Designer",
      image: "about/BODMember/MrKhanh.svg",
    },
    {
      name: "Le Gia Quoc Ti",
      position: "Creative Developer",
      image: "about/BODMember/MrKhanh.svg",
    },
    {
      name: "Dang Phuong Nam",
      position: "Creative Developer",
      image: "/about/BODMember/MrKhanh.svg",
    },
    {
      name: "Pham Ngoc Khanh Doan",
      position: "Designer",
      image: "/about/BODMember/MrKhanh.svg",
    },
    {
      name: "Nguyen Hien",
      position: "Designer",
      image: "/about/BODMember/MrKhanh.svg",
    },
    {
      name: "An Khanh Nhat",
      position: "Designer",
      image: "/about/BODMember/MrKhanh.svg",
    },
    {
      name: "Uy Nhi",
      position: "Designer",
      image: "/about/BODMember/MrKhanh.svg",
    },
  ];

  // Check if section is visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsSectionVisible(entry.isIntersecting);
          if (!entry.isIntersecting) {
            setActiveIndex(null);
            setHoveredImage(null);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  // Calculate image position based on section position
  useEffect(() => {
    const updateImagePosition = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
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
    const handleMouseMove = (e) => {
      if (!isSectionVisible) return;

      const mouseY = e.clientY;
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

      if (closestIndex !== null && closestDistance < 200) {
        setActiveIndex(closestIndex);
        setHoveredImage(teamMembers[closestIndex].image);
      } else {
        setActiveIndex(null);
        setHoveredImage(null);
      }
    };

    const handleMouseLeave = () => {
      setActiveIndex(null);
      setHoveredImage(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [teamMembers, isSectionVisible]);

  const getTransform = () => {
    if (imageAlignment === "top") return "translateY(0)";
    if (imageAlignment === "bottom") return "translateY(-100%)";
    return "translateY(-50%)";
  };

  return (
    <div className="bod-member-v4-section" ref={sectionRef}>
      {/* Central image display */}
      <div
        className={`central-member-image ${
          hoveredImage && isSectionVisible ? "visible" : ""
        }`}
        style={{
          top: `${imagePosition}px`,
          transform: getTransform(),
        }}
      >
        {hoveredImage && <MediaImage src={hoveredImage} alt="Team member" />}
      </div>

      <div className="grid-container">
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
