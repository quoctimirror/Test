import React from 'react';
import './universe_section.css';

const UniverseSection = () => {
  return (
    // Đã đổi tên class
    <div className="universe-section-container">
      {/* Đã đổi tên class */}
      <div className="universe-section__viewport">
        <img
          src="/universe/rectangle229635-sx2i-2000w.png"
          alt="Starry background"
          // Đã đổi tên class
          className="universe-section__background-image"
        />

        {/* Đã đổi tên class */}
        <div className="universe-section__graphic-container">
          <img src="/universe/ellipse58644-i3f-200h.png" alt="" className="universe-section__ellipse--center-1" />
          <img src="/universe/ellipse88644-ai1s-300h.png" alt="" className="universe-section__ellipse--center-2" />
          <img src="/universe/ellipse98644-3eex-400h.png" alt="" className="universe-section__ellipse--center-3" />
          <img src="/universe/ellipse108644-assc-500h.png" alt="" className="universe-section__ellipse--center-4" />
          <img src="/universe/ellipse118644-eef-600h.png" alt="" className="universe-section__ellipse--center-5" />
          <img src="/universe/ellipse128644-asu-700h.png" alt="" className="universe-section__ellipse--center-6" />

          <img src="/universe/ellipse158645-2518r-200h.png" alt="" className="universe-section__dot-1" />
          <img src="/universe/ellipse178645-bp2c-200h.png" alt="" className="universe-section__dot-2" />
          <img src="/universe/ellipse168645-7rj-200h.png" alt="" className="universe-section__dot-3" />

          {/* === ĐÃ ĐỔI TÊN CLASS VÀ ÁP DỤNG FONT MỚI === */}
          <span className="universe-section__text">
            <span>MIRROR</span>
            <br />
            <span>EXPERIENCES</span>
          </span>

          {/* <div className="universe-section__group-107">
            <img src="/universe/ellipse13i864-m3pj-200h.png" alt="" className="universe-section__group-107-ellipse" />
          </div> */}

          <div className="universe-section__group-266-1"></div>

          <div className="universe-section__group-266-2">
            <img src="/universe/ellipse18i864-f59o-200h.png" alt="" className="universe-section__group-266-2-ellipse" />
          </div>

          <div className="universe-section__group-268">
            <img src="/universe/ellipse7i864-vs3a-200h.png" alt="" className="universe-section__group-268-ellipse" />
          </div>

          <div className="universe-section__group-267">
            <img src="/universe/ellipse14i864-mguv-200h.png" alt="" className="universe-section__group-267-ellipse" />
          </div>

          <img src="/universe/ellipse1699555-qgp-200h.png" alt="" className="universe-section__ellipse--final" />
        </div>
      </div>
    </div>
  );
};

export default UniverseSection;