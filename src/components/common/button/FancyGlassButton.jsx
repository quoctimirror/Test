import "./FancyGlassButton.css";
import ButtonGlow from "@/assets/images/button/Button.png";

export default function FancyGlassButton({
  children,
  onClick,
  className = "",
  type = "button",
  variant = "default", // "default" | "transparent"
}) {
  return (
    <button
      type={type}
      className={`fancy-glass-button fancy-glass-button--${variant} ${className}`}
      onClick={onClick}
    >
      <span className="fancy-btn-text bodytext-6--no-margin">{children}</span>
      <img
        src={ButtonGlow}
        alt=""
        className="fancy-btn-glow"
      />
    </button>
  );
}
