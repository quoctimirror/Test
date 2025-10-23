import { useState, useEffect, useRef } from "react";
import "./BODMemberV3.css";
import "../../../styles/grid-system.css";

const BODMemberV3 = () => {
  const teamMembers = [
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
      name: "Uyen Dong",
      position: "CMO",
      image: "/about/BODMember/MsUyen.svg",
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
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const memberRefs = useRef([]);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const quoteRef = useRef(null);
  const detailsRef = useRef(null);
  const isResetting = useRef(false);

  // Create infinite array by triplicating items (only for tablet/mobile)
  const getMembersToRender = () => {
    if (isTabletOrMobile) {
      return [...teamMembers, ...teamMembers, ...teamMembers];
    }
    return teamMembers;
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTabletOrMobile(window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Check if section is in viewport and has active image to show/hide text
  useEffect(() => {
    const checkVisibility = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Show text when section is in viewport
      const isInViewport = rect.top < viewportHeight && rect.bottom > 0;

      // More specifically, show when we have scrolled into the section
      const hasScrolledIn = rect.top < viewportHeight * 0.5;

      // Check if there's an active image in the center (only for desktop)
      // On tablet/mobile, text is always visible when section is in view
      const hasActiveImage = isTabletOrMobile
        ? true
        : memberRefs.current.some((ref) => {
            if (!ref) return false;
            const imgRect = ref.getBoundingClientRect();
            const centerY = viewportHeight / 2;
            // Check if image center is close to viewport center
            const imgCenter = imgRect.top + imgRect.height / 2;
            const distance = Math.abs(imgCenter - centerY);
            return (
              distance < viewportHeight / 3 && ref.classList.contains("active")
            );
          });

      setIsVisible(isInViewport && hasScrolledIn && hasActiveImage);
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });

    return () => window.removeEventListener("scroll", checkVisibility);
  }, [isTabletOrMobile]);

  useEffect(() => {
    const handleScroll = () => {
      if (isResetting.current) return;

      if (isTabletOrMobile) {
        // Horizontal scroll detection for tablet/mobile
        const container = containerRef.current;
        if (!container) return;

        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        const centerPosition = scrollLeft + containerWidth / 2;

        // Find closest item to center
        let closestIndex = 0;
        let minDistance = Infinity;

        memberRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            const parentRect = container.getBoundingClientRect();
            const elementCenter =
              rect.left - parentRect.left + scrollLeft + rect.width / 2;
            const distance = Math.abs(centerPosition - elementCenter);

            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = index;
            }
          }
        });

        // Update current index (mod by original length)
        setCurrentIndex(closestIndex % teamMembers.length);

        // Infinite scroll logic: reset position when near edges
        const itemWidth = memberRefs.current[0]?.offsetWidth || 0;
        const gap = 20;
        const totalItemsWidth = (itemWidth + gap) * teamMembers.length;

        // If scrolled past second copy (too far right), jump back to first copy
        if (scrollLeft > totalItemsWidth * 1.5) {
          isResetting.current = true;
          container.scrollLeft = scrollLeft - totalItemsWidth;
          setTimeout(() => {
            isResetting.current = false;
          }, 50);
        }
        // If scrolled before first copy (too far left), jump forward to second copy
        else if (scrollLeft < totalItemsWidth * 0.5) {
          isResetting.current = true;
          container.scrollLeft = scrollLeft + totalItemsWidth;
          setTimeout(() => {
            isResetting.current = false;
          }, 50);
        }
      } else {
        // Vertical scroll detection for desktop
        const scrollPosition = window.scrollY + window.innerHeight / 2;

        memberRefs.current.forEach((ref, index) => {
          if (ref && index < teamMembers.length) {
            const rect = ref.getBoundingClientRect();
            const elementCenter = rect.top + window.scrollY + rect.height / 2;
            const distance = Math.abs(scrollPosition - elementCenter);

            if (distance < window.innerHeight / 3) {
              setCurrentIndex(index);
            }
          }
        });
      }
    };

    // Initial scroll position for infinite scroll (tablet/mobile only)
    if (isTabletOrMobile && containerRef.current) {
      const itemWidth = 200; // approximate
      const gap = 20;
      containerRef.current.scrollLeft = (itemWidth + gap) * teamMembers.length;
    }

    // Initial check
    setTimeout(handleScroll, 100);

    // Listen to window scroll (desktop) and container scroll (mobile)
    window.addEventListener("scroll", handleScroll, { passive: true });

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [teamMembers.length, isTabletOrMobile]);

  const currentMember = teamMembers[currentIndex];

  return (
    <div className="bod-member-v3-section" ref={sectionRef}>
      <div className="grid-container bod-member-v3-grid">
        {/* Leader Quote - Left side - Sticky */}
        <div
          className={`leader-quote-content-v3 ${isVisible ? "visible" : ""}`}
          ref={quoteRef}
        >
          <p className="bodytext-4--no-margin">
            "As intelligence becomes abundant through technology, what remains
            rare is genuine emotion. Mirror exists to preserve that emotion — to
            cherish every loving moment and transform each gift you give into an
            extension of your heart. Because we believe the most precious gift
            isn't its value — it's the feeling of being truly understood. In a
            world chasing perfection, we choose what's real."
          </p>
        </div>

        {/* All Members - Center - Scrollable */}
        <div className="members-scroll-container-v3" ref={containerRef}>
          {getMembersToRender().map((member, index) => (
            <div
              key={`${member.name}-${index}`}
              ref={(el) => (memberRefs.current[index] = el)}
              data-index={index}
              className={`member-item-v3 ${
                isTabletOrMobile
                  ? index % teamMembers.length === currentIndex
                    ? "active"
                    : ""
                  : index === currentIndex
                  ? "active"
                  : ""
              }`}
            >
              <img
                src={member.image}
                alt={member.name}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>

        {/* Leader Details - Right side - Sticky */}
        <div
          className={`leader-details-content-v3 ${isVisible ? "visible" : ""}`}
          ref={detailsRef}
        >
          <h1 className="heading-1--no-margin">{currentMember.name}</h1>
          <h3 className="bodytext-4--no-margin">{currentMember.position}</h3>
        </div>
      </div>
    </div>
  );
};

export default BODMemberV3;
