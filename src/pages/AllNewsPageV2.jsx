import React, { useState, useEffect } from "react";
import "@styles/grid-system.css";
import "./AllNewsPageV2.css";
import NewsHero from "@components/news/NewsHero";
import NewsItemV2 from "@components/news/NewsItemV2";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import ScrollDownArrow from "@components/common/button/ScrollDownArrow";
import ImmersiveButton from "@components/common/button/ImmersiveButton";
import { useScrollToNextSection } from "@/hooks/useScrollToNextSection";
import { useBottomTheme } from "@/hooks/useBottomTheme";
import "@components/home-page/scrollEffect/ScrollEffect.css";

const AllNewsPageV2 = () => {
  const [visibleItems, setVisibleItems] = useState(999); // Show all items
  const { isArrowVisible, handleArrowClick } = useScrollToNextSection({
    footerSelector: '.footer',
  });
  const { theme: arrowTheme } = useBottomTheme();
  const [isImmersiveCollapsed, setIsImmersiveCollapsed] = useState(false);

  // Handle immersive button click
  const handleImmersiveClick = () => {
    console.log("Immersive button clicked");
  };

  // Detect scroll to collapse immersive button
  useEffect(() => {
    const handleScroll = () => {
      setIsImmersiveCollapsed(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sample news data - replace with actual API data
  const newsData = [
    {
      id: 1,
      title: "Digital Jewelry Week Milan 2025",
      image: "/news/mirror-milan1.png",
      gallery: [
        "/news/mirror-milan2.png",
        "/news/mirror-milan3.png",
        "/news/mirror-milan1.png",
      ],
      date: "10/2025",
      description:
        "At the heart of Milan's Digital Jewelry Week 2025, MIRROR unveiled a glimpse into the future of luxury - where technology and emotion merge through light, sound, and reflection.",
    },
    {
      id: 2,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/mirror-milan2.png",
      gallery: [
        "/news/mirror-milan2.png",
        "/news/mirror-milan3.png",
        "/news/mirror-milan1.png",
      ],
      date: "10/2025",
      description:
        "Exploring the intersection of business and social responsibility in the modern entrepreneurial landscape.",
    },
    {
      id: 3,
      title: "Sustainable Luxury: The Future of Fine Jewelry",
      image: "/news/mirror-milan3.png",
      gallery: [
        "/news/mirror-milan2.png",
        "/news/mirror-milan3.png",
        "/news/mirror-milan1.png",
      ],
      date: "09/2025",
      description:
        "How the luxury jewelry industry is embracing sustainability and ethical practices for a better tomorrow.",
    },
    {
      id: 4,
      title: "Innovation in Diamond Cutting Technology",
      image: "/news/mirror-milan1.png",
      gallery: [
        "/news/mirror-milan2.png",
        "/news/mirror-milan3.png",
        "/news/mirror-milan1.png",
      ],
      date: "09/2025",
      description:
        "Revolutionary techniques in diamond cutting that are transforming the industry and creating unprecedented brilliance.",
    },
    {
      id: 5,
      title: "The Art of Craftsmanship Meets Modern Design",
      image: "/news/mirror-milan2.png",
      gallery: [
        "/news/mirror-milan2.png",
        "/news/mirror-milan3.png",
        "/news/mirror-milan1.png",
      ],
      date: "08/2025",
      description:
        "A journey through the evolution of jewelry design where traditional craftsmanship harmonizes with contemporary aesthetics.",
    },
    {
      id: 6,
      title: "Global Trends in Luxury Market 2025",
      image: "/news/mirror-milan3.png",
      gallery: [
        "/news/mirror-milan2.png",
        "/news/mirror-milan3.png",
        "/news/mirror-milan1.png",
      ],
      date: "08/2025",
      description:
        "An in-depth analysis of emerging trends shaping the global luxury market and consumer behavior.",
    },
  ];

  const handleViewMore = () => {
    setVisibleItems((prev) => Math.min(prev + 3, newsData.length));
  };

  return (
    <div className="all-news-page-v2" data-navbar-theme="blend">
      <NewsHero />
      <section className="news-list-v2">
        <div className="news-list-v2-container">
          {newsData.slice(0, visibleItems).map((item) => (
            <NewsItemV2 key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Fixed Immersive Button */}
      <div className="fixed-immersive-container">
        <ImmersiveButton
          theme={arrowTheme}
          isCollapsed={isImmersiveCollapsed}
          onClick={handleImmersiveClick}
        />
      </div>

      {/* Fixed Arrow Button */}
      {isArrowVisible && (
        <div className="fixed-arrow-container">
          <ScrollDownArrow theme={arrowTheme} onClick={handleArrowClick} />
        </div>
      )}
    </div>
  );
};

export default AllNewsPageV2;
