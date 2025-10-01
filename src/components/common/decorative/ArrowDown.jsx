const ArrowDown = ({ width = 20, height = 20, fill = "black", className = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.29973 11.25L9.54971 17.5L10.4336 17.5L16.6836 11.25L15.7997 10.3661L10.6167 15.5492L10.6167 2.5L9.36666 2.5L9.36666 15.5492L4.18361 10.3661L3.29973 11.25Z"
        fill={fill}
      />
    </svg>
  );
};

export default ArrowDown;