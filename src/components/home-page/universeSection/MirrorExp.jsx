import React, { useEffect, useRef, useState } from 'react';
import './MirrorExp.css';
import SenseOverlay from './SenseOverlay';
import PresenceOverlay from './PresenceOverlay';
import SpaceOverlay from './SpaceOverlay';
import TimeOverlay from './TimeOverlay';

const MirrorExp = () => {
  const mirrorExpRef = useRef(null);
  const [showSenseOverlay, setShowSenseOverlay] = useState(false);
  const [showPresenceOverlay, setShowPresenceOverlay] = useState(false);
  const [showSpaceOverlay, setShowSpaceOverlay] = useState(false);
  const [showTimeOverlay, setShowTimeOverlay] = useState(false);

  const [clickOrigin, setClickOrigin] = useState({ x: 50, y: 50 }); // Default center

  const handleSenseClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    setClickOrigin({ x, y });
    setShowSenseOverlay(true);
  };

  const handleCloseSenseOverlay = () => {
    setShowSenseOverlay(false);
  };

  const handlePresenceClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    setClickOrigin({ x, y });
    setShowPresenceOverlay(true);
  };

  const handleClosePresenceOverlay = () => {
    setShowPresenceOverlay(false);
  };

  const handleSpaceClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    setClickOrigin({ x, y });
    setShowSpaceOverlay(true);
  };

  const handleCloseSpaceOverlay = () => {
    setShowSpaceOverlay(false);
  };

  const handleTimeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    setClickOrigin({ x, y });
    setShowTimeOverlay(true);
  };

  const handleCloseTimeOverlay = () => {
    setShowTimeOverlay(false);
  };


  useEffect(() => {
    if (mirrorExpRef.current) {
      const container = mirrorExpRef.current;
      const rect = container.getBoundingClientRect();

      // Tọa độ center của container
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Xác định breakpoint
      const screenWidth = window.innerWidth;
      let breakpoint = '';
      let layer0Radius = 0;
      let layer1Radius = 0;
      let layer2Radius = 0;
      let layer3Radius = 0;
      let layer4Radius = 0;
      let layer5Radius = 0;

      if (screenWidth <= 425) {
        breakpoint = 'Mobile (0-425px)';
        layer0Radius = 132 / 2; // 66px
        layer1Radius = 192 / 2; // 96px
        layer2Radius = 252 / 2; // 126px
        layer3Radius = 312 / 2; // 156px
        layer4Radius = 372 / 2; // 186px
        layer5Radius = 432 / 2; // 216px
      } else if (screenWidth >= 426 && screenWidth <= 1023) {
        breakpoint = 'Tablet (426-1023px)';
        layer0Radius = 192 / 2; // 96px - updated for tablet
        layer1Radius = 192 / 2; // 96px
        layer2Radius = 252 / 2; // 126px
        layer3Radius = 312 / 2; // 156px
        layer4Radius = 372 / 2; // 186px
        layer5Radius = 432 / 2; // 216px
      } else {
        breakpoint = 'Desktop (1024px+)';
        layer0Radius = 180 / 2; // 90px - updated for desktop
        layer1Radius = 290 / 2; // 145px - updated for desktop
        layer2Radius = 400 / 2; // 200px - updated for desktop
        layer3Radius = 510 / 2; // 255px - updated for desktop
        layer4Radius = 620 / 2; // 310px - updated for desktop
        layer5Radius = 730 / 2; // 365px - updated for desktop
      }

    }
  }, []);

  return (
    <div className="mirror-exp" ref={mirrorExpRef}>
      <div className="mirror-exp__luxury-text bodytext-1--no-margin">
        Awakening luxury through your senses, in every time, space and presence.
      </div>
      <div className="mirror-exp-title"></div>
      <div className="mirror-exp__layer5"></div>
      <div className="mirror-exp__layer4"></div>
      <div className="mirror-exp__layer3"></div>
      <div className="mirror-exp__layer2"></div>
      <div className="mirror-exp__meteoroid-orbit">
        <div className="mirror-exp__meteoroid-3h"></div>
      </div>
      <div className="mirror-exp__meteoroid-orbit-layer2">
        <div className="mirror-exp__meteoroid-layer2-12h"></div>
      </div>
      <div className="mirror-exp__meteoroid-orbit-layer4">
        <div className="mirror-exp__meteoroid-layer4-0deg"></div>
        <div className="mirror-exp__meteoroid-layer4-120deg"></div>
        <div className="mirror-exp__meteoroid-layer4-240deg"></div>
      </div>
      <div className="mirror-exp__heart-senses" onClick={handleSenseClick} style={{ cursor: 'pointer' }}>
        <span className="mirror-exp__sense-text bodytext-4--no-margin">Sense</span>
      </div>
      <div className="mirror-exp__circle-presence" onClick={handlePresenceClick} style={{ cursor: 'pointer' }}>
        <span className="mirror-exp__presence-text bodytext-4--no-margin">Presence</span>
      </div>
      <div className="mirror-exp__droplet-time" onClick={handleTimeClick} style={{ cursor: 'pointer' }}>
        <span className="mirror-exp__time-text bodytext-4--no-margin">Time</span>
      </div>
      <div className="mirror-exp__rect-space" onClick={handleSpaceClick} style={{ cursor: 'pointer' }}>
        <span className="mirror-exp__space-text bodytext-4--no-margin">Space</span>
      </div>
      <div className="mirror-exp__center-dot"></div>
      <div className="mirror-exp__text">
        <span className="mirror-exp__mirror bodytext-3--no-margin">MIRROR</span>
        <span className="mirror-exp__experience bodytext-3--no-margin">EXPERIENCE</span>
      </div>
      <SenseOverlay
        isVisible={showSenseOverlay}
        onClose={handleCloseSenseOverlay}
        origin={clickOrigin}
      />
      <PresenceOverlay
        isVisible={showPresenceOverlay}
        onClose={handleClosePresenceOverlay}
        origin={clickOrigin}
      />
      <SpaceOverlay
        isVisible={showSpaceOverlay}
        onClose={handleCloseSpaceOverlay}
        origin={clickOrigin}
      />
      <TimeOverlay
        isVisible={showTimeOverlay}
        onClose={handleCloseTimeOverlay}
        origin={clickOrigin}
      />
    </div>
  );
};

export default MirrorExp;