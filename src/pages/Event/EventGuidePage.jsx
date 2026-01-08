/**
 * EventGuidePage - Landing page for Mirror Diamond Symphony Event
 * Design based on provided mockup
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import ShineGlassButton from '@components/common/button/ShineGlassButton';
import titleSvg from '@/assets/images/icons/title.svg';
import '@styles/grid-system.css';

import './EventGuidePage.css';

const EventGuidePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(ROUTES.EVENT_LOGIN);
  };

  const scrollToContent = () => {
    const section = document.querySelector('.event-guide__about');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="event-guide">
      {/* Hero Section */}
      <section className="event-guide__hero">
        <div className="event-guide__hero-top grid-container">
          <div className="event-guide__hero-left">
            <span className="event-guide__collab bodytext6">MIRROR x DOCMONGMO</span>
            <span className="event-guide__collab-sub bodytext6">Trải nghiệm</span>
          </div>

          <p className="event-guide__hero-description bodytext6">
            Không chỉ là một đêm diễn, đây là nơi mỗi người được mời gọi bước vào thế giới của sự phản chiếu – nơi cảm xúc được lắng nghe và ghi dấu theo cách rất riêng.
          </p>
        </div>

        <div className="event-guide__hero-content">
          <img
            src={titleSvg}
            alt="The Sound of Love Grown"
            className="event-guide__hero-title-img"
          />
        </div>

        <div className="event-guide__hero-bottom">
          <ShineGlassButton theme="light" onClick={handleGetStarted}>
            Get started
          </ShineGlassButton>

          <div className="event-guide__hero-right" onClick={scrollToContent}>
            <span>Or scroll down to read more</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="event-guide__about">
        <h2 className="event-guide__about-title">The sound of Love grown</h2>
        <p className="event-guide__about-text">
          Đồng hành cùng Doc Mong Mo, MIRROR chia sẻ chung một tình thân yêu
          trong thế giới, tôn vinh phát đẹp và những tâm sắc của từng nốt nhạc
          cùng với Mong Mo mỗi nốt nhạc như một thiết nghiệm - giao thoa tình để gieo
          hạt từ thôi – những nốt nhạc mang sắc màu lộng lẫy của kim cương
          những giai điệu đến tâm, đây là cuối lộ trình được cất gọn bước vào
          thế giới của ai phần đời . . . còn bạn nào Đăng ký nghe giai điệu mà bạn đóng
          . . . yêu với những.
        </p>
      </section>

      {/* Every Note Section (with Music Staff) */}
      <section className="event-guide__every-note">
        <div className="event-guide__staff-visual">
          {/* Treble Clef */}
          <svg className="event-guide__treble-clef" viewBox="0 0 100 200" fill="none">
            <path d="M50 180C50 180 30 160 30 140C30 120 50 100 50 80C50 60 30 40 30 20C30 10 40 0 50 0C60 0 70 10 70 20C70 40 50 60 50 80C50 100 70 120 70 140C70 160 50 180 50 180Z" stroke="#333" strokeWidth="2"/>
          </svg>

          {/* Staff Lines */}
          <div className="event-guide__staff-lines">
            <div className="event-guide__staff-line"></div>
            <div className="event-guide__staff-line"></div>
            <div className="event-guide__staff-line"></div>
            <div className="event-guide__staff-line"></div>
            <div className="event-guide__staff-line"></div>
          </div>

          {/* Diamond Notes */}
          <div className="event-guide__notes">
            <div className="event-guide__note event-guide__note--1">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#E0E0E0" stroke="#999"/>
              </svg>
            </div>
            <div className="event-guide__note event-guide__note--2">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#D4D4D4" stroke="#888"/>
              </svg>
            </div>
            <div className="event-guide__note event-guide__note--3">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#C8C8C8" stroke="#777"/>
              </svg>
            </div>
            <div className="event-guide__note event-guide__note--heart">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#8B0000"/>
              </svg>
            </div>
          </div>
        </div>

        <h2 className="event-guide__section-title">Every note...</h2>
        <p className="event-guide__section-text">
          Đồng hành cùng Doc Mong Mo, MIRROR chia sẻ chung một tình thân yêu
          trong thế giới, tôn vinh phát đẹp và những tâm sắc của từng
        </p>
        <ShineGlassButton theme="light" onClick={handleGetStarted}>
          Get started
        </ShineGlassButton>
      </section>

      {/* Avatar Generator Section */}
      <section className="event-guide__avatar">
        <div className="event-guide__avatar-image">
          <div className="event-guide__avatar-card">
            <div className="event-guide__avatar-placeholder"></div>
          </div>
        </div>

        <h2 className="event-guide__section-title">Avatar generator</h2>
        <p className="event-guide__section-text">
          Đồng hành cùng Doc Mong Mo, MIRROR chia sẻ chung một tình thân yêu
          trong thế giới, tôn vinh phát đẹp và những tâm sắc của từng
        </p>
        <ShineGlassButton theme="light" onClick={handleGetStarted}>
          Get started
        </ShineGlassButton>
      </section>

      {/* Lucky Draw Section */}
      <section className="event-guide__lucky-draw">
        <h2 className="event-guide__section-title event-guide__section-title--light">Lucky draw</h2>
        <p className="event-guide__section-text event-guide__section-text--light">
          Mỗi vé là một cơ hội nhận được món quà từ Mirror. Mỗi vé là một cơ
          hội nhận được món quà từ Mirror.
        </p>
        <ShineGlassButton theme="light" onClick={handleGetStarted}>
          Buy tickets
        </ShineGlassButton>
      </section>
    </div>
  );
};

export default EventGuidePage;
