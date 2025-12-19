import "./SoundButton.css";

const SoundButton = ({ className = "", onClick, isActive = false, ...props }) => {
  return (
    <div className={`sound-button ${className}`}>
      <button onClick={onClick} {...props}>
        <div className="wave-container">
          <svg
            className={`sound-wave-svg ${isActive ? "active" : ""}`}
            width="120"
            height="24"
            viewBox="0 0 120 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Straight line - visible when inactive */}
            <path
              className={`wave-path-straight ${!isActive ? "visible" : ""}`}
              d="M0 12 L120 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Long flowing wave - visible when active - SEAMLESS PATTERN */}
            <g className={`wave-group ${isActive ? "visible" : ""}`}>
              <path
                className="wave-path-flowing"
                d="M-20 12 Q-15 4, -10 12 Q-5 20, 0 12 Q5 4, 10 12 Q15 20, 20 12 Q25 4, 30 12 Q35 20, 40 12 Q45 4, 50 12 Q55 20, 60 12 Q65 4, 70 12 Q75 20, 80 12 Q85 4, 90 12 Q95 20, 100 12 Q105 4, 110 12 Q115 20, 120 12 Q125 4, 130 12 Q135 20, 140 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>
        </div>
      </button>
    </div>
  );
};

export default SoundButton;
