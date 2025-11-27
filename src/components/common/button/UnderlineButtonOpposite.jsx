import "./UnderlineButtonOpposite.css";

export default function UnderlineButtonOpposite({
  children,
  onClick,
  className = "",
  textClassName = "bodytext-4--no-margin",
  disabled = false
}) {
  return (
    <button
      className={`underline-button-opposite ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={`underline-button-opposite-text ${textClassName}`}>
        {children}
      </span>
    </button>
  );
}
