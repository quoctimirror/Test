import React from 'react';
import './StarlightEffect.css';

const StarlightEffect = ({ direction = "default", height = 170 }) => {
    if (direction === "falling") {
        // Chỉ 1 vạch duy nhất ở giữa, rơi thẳng xuống với chiều cao tùy chỉnh
        return (
            <div className="star-container-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="2"
                    height={height}
                    viewBox={`0 0 2 ${height}`}
                    fill="none"
                >
                    <path d={`M1 0V0`} stroke="url(#gradient-falling)" strokeWidth="1">
                        <animate
                            attributeName="d"
                            from={`M1 0V0`}
                            to={`M1 0V${height}`}
                            dur="1.5s"
                            repeatCount="indefinite"
                        />
                    </path>
                    <defs>
                        <linearGradient id="gradient-falling" x1="1.5" y1="0" x2="1.5" y2={height} gradientUnits="userSpaceOnUse">
                            <stop offset="0" stopColor="#000000" />
                            <stop offset="0.13" stopColor="#000000" />
                            <stop offset="0.75" stopColor="#EC3667" />
                            <stop offset="1" stopColor="#F6F6F6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    }

    if (direction === "rising") {
        // Vạch bay từ dưới lên trên
        return (
            <div className="star-container-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="2"
                    height={height}
                    viewBox={`0 0 2 ${height}`}
                    fill="none"
                >
                    <path d={`M1 0V${height}`} stroke="url(#gradient-rising)" strokeWidth="1" />
                    <defs>
                        <linearGradient id="gradient-rising" x1="1.5" y1="0" x2="1.5" y2={height} gradientUnits="userSpaceOnUse">
                            <stop stopColor="#320606" stopOpacity="0.1" />
                            <stop offset="0.3" stopColor="#EC3667" stopOpacity="0.8" />
                            <stop offset="0.5" stopColor="#EC3667" />
                            <stop offset="0.7" stopColor="#EC3667" stopOpacity="0.8" />
                            <stop offset="1" stopColor="#F6F6F6" stopOpacity="0" />
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                from={`0 ${height}`}
                                to={`0 -${height}`}
                                dur="1.5s"
                                repeatCount="indefinite"
                            />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    }

    // Default behavior
    return (
        <div className="star-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="4" height="170" viewBox="0 0 2 170" fill="none">
                <path d="M1 0V169.5" stroke="url(#gradient-original)" strokeWidth="2" />
                <defs>
                    <linearGradient id="gradient-original" x1="1.5" y1="0" x2="1.5" y2="169.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#320606" />
                        <stop offset="0.552885" stopColor="#EC3667" />
                        <stop offset="1" stopColor="#F6F6F6" />
                        <animateTransform attributeName="gradientTransform" type="translate" from="0 -170" to="0 170" dur="1s" repeatCount="indefinite" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default StarlightEffect;