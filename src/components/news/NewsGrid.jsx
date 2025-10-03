import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import "./NewsGrid.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";

const NewsGrid = () => {
  const [visibleItems, setVisibleItems] = useState(12);
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  // Sample news data - replace with actual data
  const newsData = [
    {
      id: 1,
      title: "Lumex-91™: The Next Star Has Arrived",
      image: "/news/lumex_91.png",
    },
    {
      id: 2,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news_img_2.svg",
    },
    {
      id: 3,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news_img_3.svg",
    },
    {
      id: 4,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news_img_4.svg",
    },
    {
      id: 5,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news_img_5.svg",
    },
    {
      id: 6,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news_img_6.svg",
    },
    {
      id: 7,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news_img_7.svg",
    },
    {
      id: 8,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news_img_8.svg",
    },
    // Add more placeholder items
    {
      id: 9,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news-9.jpg",
    },
    {
      id: 10,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news-10.jpg",
    },
    {
      id: 11,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news-11.jpg",
    },
    {
      id: 12,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news-12.jpg",
    },
    {
      id: 13,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news-13.jpg",
    },
    {
      id: 14,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news-14.jpg",
    },
    {
      id: 15,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news-15.jpg",
    },
    {
      id: 16,
      title: "La Société Benefit, vers un nouveau paradigme entrepreneurial?",
      image: "/news/news-16.jpg",
    },
  ];

  const handleViewMore = () => {
    setVisibleItems((prev) => Math.min(prev + 8, newsData.length));
  };

  const handleNewsItemClick = async (item) => {
    if (item.id === 1) {
      await optimizedTransitionUtils.transitionToRoute(
        navigate,
        "/news/new-cut"
      );
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  // Group items into rows of 4
  const groupedData = [];
  for (let i = 0; i < Math.min(visibleItems, newsData.length); i += 4) {
    groupedData.push(newsData.slice(i, i + 4));
  }

  return (
    <section className="news-grid">
      <div className="news-grid-container">
        {groupedData.map((row, rowIndex) => (
          <div key={rowIndex} className="news-row">
            <div className="news-row-content">
              {row.map((item) => (
                <div
                  key={item.id}
                  className={`news-item ${item.id === 1 ? "clickable" : ""}`}
                  onClick={() => handleNewsItemClick(item)}
                >
                  <div
                    className={`news-item-image ${
                      !item.image || imageErrors[item.id] ? "no-image" : ""
                    }`}
                  >
                    {item.image && !imageErrors[item.id] && (
                      <img
                        src={item.image}
                        alt=""
                        onError={() => handleImageError(item.id)}
                      />
                    )}
                  </div>
                  <div className="news-item-content">
                    <h3 className="news-item-title heading-3--no-margin">
                      {item.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {visibleItems < newsData.length && (
          <div className="view-more-section">
            <ShineGlassButton
              className="view-more-btn"
              theme="light"
              onClick={handleViewMore}
            >
              View more
            </ShineGlassButton>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsGrid;
