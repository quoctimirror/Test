import React, { useState } from "react";
import "@styles/grid-system.css";
import "./AllNewsPageV2.css";
import NewsHero from "@components/news/NewsHero";
import NewsItemV2 from "@components/news/NewsItemV2";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const AllNewsPageV2 = () => {
  const [visibleItems, setVisibleItems] = useState(3);

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
        "At the heart of Milan's Digital Jewelry Week 2025, MIRROR unveiled a glimpse into the future of luxury — where technology and emotion merge through light, sound, and reflection.",
    },
    {
      id: 2,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/mirror-milan2.png",
      gallery: [
        "/news/mirror-milan3.png",
        "/news/mirror-milan1.png",
        "/news/mirror-milan2.png",
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
        "/news/mirror-milan1.png",
        "/news/mirror-milan2.png",
        "/news/mirror-milan3.png",
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
        "/news/mirror-milan3.png",
        "/news/mirror-milan1.png",
        "/news/mirror-milan2.png",
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
        "/news/mirror-milan1.png",
        "/news/mirror-milan2.png",
        "/news/mirror-milan3.png",
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
    <div className="all-news-page-v2">
      <NewsHero />
      <section className="news-list-v2">
        <div className="news-list-v2-container">
          {newsData.slice(0, visibleItems).map((item) => (
            <NewsItemV2 key={item.id} item={item} />
          ))}

          {visibleItems < newsData.length && (
            <div className="view-more-section-v2">
              <ShineGlassButton
                className="view-more-btn-v2"
                theme="light"
                onClick={handleViewMore}
              >
                View more
              </ShineGlassButton>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AllNewsPageV2;
