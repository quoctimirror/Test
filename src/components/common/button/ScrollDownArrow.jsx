import "./ScrollDownArrow.css";

const ScrollDownArrow = ({ className = "", onClick, ...props }) => {
  return (
    <button
      className={`scroll-down-arrow ${className}`}
      aria-label="Scroll down"
      onClick={onClick}
      {...props}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 9L12 16L5 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default ScrollDownArrow;
