import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { optimizedTransitionUtils } from "@utils/transitionUtil/optimizedTransitionUtils";
import { getNewsDetailRoute } from "@/constants/routes";
import UnderlineButton from "@components/common/button/UnderlineButton";
import "@styles/grid-system.css";
import "./NewsItemV2.css";

const NewsItemV2 = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const [galleryErrors, setGalleryErrors] = useState({});
  const navigate = useNavigate();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleGalleryImageError = (index) => {
    setGalleryErrors((prev) => ({ ...prev, [index]: true }));
  };

  const handleClick = async () => {
    if (item.id === 1) {
      await optimizedTransitionUtils.transitionToRoute(
        navigate,
        getNewsDetailRoute("new-cut")
      );
    }
  };

  return (
    <div className="news-item-v2-wrapper">
      <div
        className={`grid-container news-item-v2 ${
          item.id === 1 ? "clickable" : ""
        }`}
        onClick={handleClick}
      >
        <div
          className={`news-item-v2-main-image col-6 col-sm-12 ${
            !item.image || imageError ? "no-image" : ""
          }`}
        >
          {item.image && !imageError && (
            <img src={item.image} alt={item.title} onError={handleImageError} />
          )}
        </div>

        <div className="news-item-v2-content col-start-8 col-4 col-sm-12">
          <p className="news-item-v2-date bodytext-4--no-margin">{item.date}</p>
          <h2 className="news-item-v2-title heading-1--no-margin">
            {item.title}
          </h2>
          {item.description && (
            <p className="news-item-v2-description bodytext-5--no-margin">
              {item.description}
            </p>
          )}
          <UnderlineButton
            className="news-item-v2-button"
            textClassName="bodytext-4--no-margin"
          >
            Discover
          </UnderlineButton>
        </div>

        {item.gallery && item.gallery.length > 0 && (
          <div className="news-item-v2-gallery-wrapper col-12 col-sm-12">
            <div className="grid-container news-item-v2-gallery">
              <div
                className={`news-item-v2-gallery-item col-1 col-start-1 col-sm-4 ${
                  galleryErrors[0] ? "no-image" : ""
                }`}
              >
                {!galleryErrors[0] && (
                  <img
                    src={item.gallery[0]}
                    alt=""
                    onError={() => handleGalleryImageError(0)}
                  />
                )}
              </div>
              {item.gallery[1] && (
                <div
                  className={`news-item-v2-gallery-item col-1 col-start-6 col-sm-4 col-sm-start-5 ${
                    galleryErrors[1] ? "no-image" : ""
                  }`}
                >
                  {!galleryErrors[1] && (
                    <img
                      src={item.gallery[1]}
                      alt=""
                      onError={() => handleGalleryImageError(1)}
                    />
                  )}
                </div>
              )}
              {item.gallery[2] && (
                <div
                  className={`news-item-v2-gallery-item news-item-v2-gallery-item-large col-2 col-start-7 col-sm-4 col-sm-start-9 ${
                    galleryErrors[2] ? "no-image" : ""
                  }`}
                >
                  {!galleryErrors[2] && (
                    <img
                      src={item.gallery[2]}
                      alt=""
                      onError={() => handleGalleryImageError(2)}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsItemV2;
