import React from "react";
import "./EditButton.css";

const EditButton = ({ onClick, className = "", size = 20 }) => {
  return (
    <button className={`edit-button ${className}`} onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 18 18"
        fill="none"
      >
        <path
          d="M15.9648 5.32997L4.54474 16.75H0.75V12.9553L12.17 1.53523C12.6735 1.03242 13.3559 0.75 14.0674 0.75C14.7789 0.75 15.4613 1.03242 15.9648 1.53523C16.4676 2.03866 16.75 2.72108 16.75 3.4326C16.75 4.14411 16.4676 4.82654 15.9648 5.32997Z"
          stroke="#797979"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="edit-button-stroke"
        />
      </svg>
    </button>
  );
};

export default EditButton;
