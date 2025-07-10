// src/components/UniverseSection.jsx

import React from 'react';
import './universe_section.css';

const UniverseSection = () => {
  return (
    <div className="universe-section-container">
      <div className="universe-section__viewport">
        <img
          src="/universe/rectangle229635-sx2i-2000w.png"
          alt="Starry background"
          className="universe-section__background-image"
        />

        <div className="universe-section__graphic-container">
          {/* Cấu trúc các vòng tròn và hành tinh khác giữ nguyên */}
          <img src="/universe/ellipse88644-ai1s-300h.png" alt="" className="universe-section__ellipse--center-2" />
          <img src="/universe/ellipse98644-3eex-400h.png" alt="" className="universe-section__ellipse--center-3" />
          <img src="/universe/ellipse108644-assc-500h.png" alt="" className="universe-section__ellipse--center-4" />
          <img src="/universe/ellipse118644-eef-600h.png" alt="" className="universe-section__ellipse--center-5" />
          <img src="/universe/ellipse128644-asu-700h.png" alt="" className="universe-section__ellipse--center-6" />

          <img src="/universe/ellipse158645-2518r-200h.png" alt="" className="universe-section__dot-1" />
          <img src="/universe/ellipse178645-bp2c-200h.png" alt="" className="universe-section__dot-2" />
          <img src="/universe/ellipse168645-7rj-200h.png" alt="" className="universe-section__dot-3" />

          {/* 
            ================================================================
            <<< THAY ĐỔI CẤU TRÚC QUAN TRỌNG Ở ĐÂY >>>
            - Hình tròn trung tâm giờ là một DIV container (.universe-section__center-hub).
            - Hình ảnh của nó (.universe-section__ellipse--center-1) nằm bên trong.
            - Chữ (.universe-section__text) cũng nằm bên trong, làm cho nó phụ thuộc vào kích thước của hình tròn.
            ================================================================
          */}
          <div className="universe-section__center-hub">
            <img
              src="/universe/ellipse58644-i3f-200h.png"
              alt=""
              className="universe-section__ellipse--center-1"
            />
            <div className="universe-section__text">
              <span>MIRROR</span>
              <br />
              <span>EXPERIENCES</span>
            </div>
          </div>

          {/* Các element còn lại */}
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