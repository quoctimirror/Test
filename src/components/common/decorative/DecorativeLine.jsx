const DecorativeLine = ({ className = "", fillOpacity = "0.75" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="66"
      height="6"
      viewBox="0 0 66 6"
      fill="none"
      className={className}
    >
      <path
        d="M0.113249 3L3 5.88675L5.88675 3L3 0.113249L0.113249 3ZM65.8867 3L63 0.113249L60.1132 3L63 5.88675L65.8867 3ZM3 3V3.5H63V3V2.5H3V3Z"
        fill="black"
        fillOpacity={fillOpacity}
      />
    </svg>
  );
};

export default DecorativeLine;