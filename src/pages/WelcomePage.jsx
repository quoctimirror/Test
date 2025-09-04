import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MetaballBackground from '@components/specialEffect/MetaballBackground/MetaballBackground';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleExplore = () => {
    navigate('/home');
  };

  const handleCollections = () => {
    navigate('/collections');
  };

  const handleAbout = () => {
    navigate('/about');
  };

  return (
    <div className={`welcome-page ${isLoaded ? 'loaded' : ''}`}>
      {/* Metaball Background */}
      <MetaballBackground />

      {/* Main content */}
      <div className="welcome-content">
        <h1 className="welcome-title">
          <span className="title-line-1">Welcome to</span>
          <span className="title-line-2">MIRROR</span>
        </h1>
      </div>
    </div>
  );
};

export default WelcomePage;