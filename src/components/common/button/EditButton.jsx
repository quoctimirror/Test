import React from "react";
import "./EditButton.css";

const EditButton = ({ onClick, className = "", size = 30 }) => {
  return (
    <button className={`edit-button ${className}`} onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
      >
        <path
          d="M22.2148 11.58L10.7947 23H7V19.2053L18.42 7.78523C18.9235 7.28242 19.6059 7 20.3174 7C21.0289 7 21.7113 7.28242 22.2148 7.78523C22.7176 8.28866 23 8.97108 23 9.6826C23 10.3941 22.7176 11.0765 22.2148 11.58Z"
          stroke="#797979"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="edit-button-stroke"
        />
        <path
          d="M11.5 23L7 18.5V23H11.5Z"
          fill="#797979"
          className="edit-button-fill"
        />
      </svg>
    </button>
  );
};

export default EditButton;
