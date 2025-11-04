import React from "react";
import ShineGlassButton from "./ShineGlassButton";
import "./ArrowButton.css";

const ArrowButton = ({
  direction = "left",
  onClick,
  size = 57,
  className = "",
  ariaLabel,
  ...props
}) => {
  const leftArrowPath = "M24.25 15.5L6.75 15.5M6.75 15.5L14.25 8M6.75 15.5L14.25 23";
  const rightArrowPath = "M6.75 15.5L24.25 15.5M24.25 15.5L16.75 23M24.25 15.5L16.75 8";

  const arrowPath = direction === "left" ? leftArrowPath : rightArrowPath;
  const defaultAriaLabel = direction === "left" ? "Previous" : "Next";

  return (
    <div
      className={`arrow-button arrow-button-${direction} ${className}`}
      onClick={onClick}
      {...props}
    >
      <ShineGlassButton width={size} height={size} theme="footer">
        <svg
          width="24"
          height="24"
          viewBox="0 0 31 31"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={ariaLabel || defaultAriaLabel}
        >
          <path
            d={arrowPath}
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      </ShineGlassButton>
    </div>
  );
};

export default ArrowButton;
