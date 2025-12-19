import "./UnderlineButton.css";

export default function UnderlineButton({
  children,
  onClick,
  className = "",
  textClassName = "bodytext-6--no-margin",
  disabled = false
}) {
  return (
    <button
      className={`underline-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={`underline-button-text ${textClassName}`}>
        {children}
      </span>
    </button>
  );
}
