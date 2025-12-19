import React from "react";
import GlassThemeButton from "./GlassThemeButton";
import "./ArrowButton.css";

// Custom arrow icons for left/right directions
const LeftArrowIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 31 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24.25 15.5L6.75 15.5M6.75 15.5L14.25 8M6.75 15.5L14.25 23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </svg>
);

const RightArrowIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 31 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.75 15.5L24.25 15.5M24.25 15.5L16.75 23M24.25 15.5L16.75 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
    />
  </svg>
);

const ArrowButton = ({
  direction = "left",
  onClick,
  className = "",
  ariaLabel,
  theme = "dark",
  ...props
}) => {
  const defaultAriaLabel = direction === "left" ? "Previous" : "Next";
  const ArrowIcon = direction === "left" ? <LeftArrowIcon /> : <RightArrowIcon />;

  return (
    <div
      className={`arrow-button arrow-button-${direction} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel || defaultAriaLabel}
      {...props}
    >
      <GlassThemeButton
        theme={theme}
        icon={ArrowIcon}
      />
    </div>
  );
};

export default ArrowButton;
