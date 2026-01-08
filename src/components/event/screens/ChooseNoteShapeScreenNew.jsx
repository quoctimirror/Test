/**
 * ChooseNoteShapeScreenNew - Step 3: Preview card with diamond
 * Shows a phone mockup with landscape background and heart diamond
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Share2, Instagram } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import useEventStore from '@/store/useEventStore';
import RippleEffect from '@/components/event/effects/ripple-effect';

// Import heart diamond image
import heartSvg from '@/assets/images/dmm/heart.svg';

// Facebook icon component
const FacebookIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// TikTok icon component
const TikTokIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.88 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1V9.4c-.26-.03-.52-.05-.79-.05a6.33 6.33 0 0 0-6.33 6.33 6.33 6.33 0 0 0 6.33 6.33 6.33 6.33 0 0 0 6.33-6.33V9.26a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.69z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom gradient for ripple effect (lighter pink)
const RIPPLE_GRADIENT = `radial-gradient(50% 50% at 50% 50%, #F4A5B8 0%, rgba(185, 185, 185, 0.00) 54.33%, #FFF 93.27%, rgba(255, 255, 255, 0.00) 100%)`;

const ChooseNoteShapeScreenNew = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);
  const rippleRef = useRef(null);

  const { userNote, selectedDiamond } = useEventStore();

  // Initialize RippleEffect on card
  useEffect(() => {
    if (cardRef.current && !rippleRef.current) {
      rippleRef.current = new RippleEffect(cardRef.current, {
        autoRippleCount: 5,
        duration: 10000,
        delay: 2000,
        startSize: 100,
        endSize: 1200,
        opacity: 0.7,
        autoPlay: true,
        clickable: false,
        gradient: RIPPLE_GRADIENT,
      });
    }

    return () => {
      if (rippleRef.current) {
        rippleRef.current.destroy();
        rippleRef.current = null;
      }
    };
  }, []);

  // Navigation - go back to step 2
  const handleGoBack = () => {
    navigate(ROUTES.EVENT_WRITE_MESSAGE);
  };

  // Handle download
  const handleDownload = async () => {
    setDownloading(true);
    // TODO: Implement download functionality
    setTimeout(() => {
      setDownloading(false);
    }, 1000);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mirror Diamond',
          text: 'Check out my diamond note!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    }
  };

  return (
    <div className="choose-note-shape">
      {/* Background */}
      <div className="choose-note-shape__bg" />

      {/* Header */}
      <header className="choose-note-shape__header">
        <h1 className="choose-note-shape__title">MIRROR</h1>
      </header>

      {/* Main content */}
      <main className="choose-note-shape__main">
        {/* Left arrow - go back */}
        <div className="choose-note-shape__arrow choose-note-shape__arrow--left">
          <button
            className="glass-button glass-button--circle"
            onClick={handleGoBack}
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Center card preview */}
        <div className="choose-note-shape__card-container">
          <div className="choose-note-shape__card" ref={cardRef}>
            {/* Card background - gradient landscape */}
            <div className="choose-note-shape__card-bg" />

            {/* Diamond heart in center of card */}
            <div className="choose-note-shape__diamond-wrapper">
              <img
                src={heartSvg}
                alt="Heart Diamond"
                className="choose-note-shape__diamond"
              />
            </div>
          </div>

          {/* Action buttons below card */}
          <div className="choose-note-shape__actions">
            <button
              className="glass-button glass-button--pill"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={20} />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
            <button
              className="glass-button glass-button--circle glass-button--small"
              onClick={handleShare}
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Right side - Social icons */}
        <div className="choose-note-shape__social">
          <button className="glass-button glass-button--circle glass-button--small" aria-label="Instagram">
            <Instagram size={20} />
          </button>
          <button className="glass-button glass-button--circle glass-button--small" aria-label="Facebook">
            <FacebookIcon size={20} />
          </button>
          <button className="glass-button glass-button--circle glass-button--small" aria-label="TikTok">
            <TikTokIcon size={20} />
          </button>
        </div>
      </main>

      {/* Footer - bottom left */}
      <footer className="choose-note-shape__footer">
        {/* Progress bar 3/3 */}
        <div className="choose-note-shape__progress">
          <div className="choose-note-shape__progress-step choose-note-shape__progress-step--active" />
          <div className="choose-note-shape__progress-step choose-note-shape__progress-step--active" />
          <div className="choose-note-shape__progress-step choose-note-shape__progress-step--active" />
        </div>
        <h3 className="heading-3--no-margin choose-note-shape__subtitle">Choose the note shape</h3>
        <p className="bodytext-6--no-margin choose-note-shape__description">
          cing elit, sed diam nonummy nibut laoreet dolore
          magna aliquam erat volutpat. cing elit, sed diam
          nonummy nibut nibut laoreet dolore magna aliquam
          erat volutpat.
        </p>
      </footer>
    </div>
  );
};

export default ChooseNoteShapeScreenNew;
