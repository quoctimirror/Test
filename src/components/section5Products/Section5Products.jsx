import "./Section5Products.css";

const Section5Products = () => {
  return (
    <div className="hero">
      <img
        src="/products/contact_us.jpg"
        alt="Contact Us Background"
        className="hero-background"
      />
      <div className="hero-content">
        <h4>NEED HELP?</h4>
        <h1>REACH OUT</h1>
        <p>We would love to hear from you.</p>
        <p>Our client care experts are always here to help.</p>
        <div className="contact-us-button-wrapper">
          <button className="contact-us-button">
            <svg
              width="120"
              height="50"
              viewBox="0 0 120 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="button-background"
                d="M9 1 L111 1 L119 10 L119 41 L111 49 L9 49 L1 40 L1 9 Z"
                fill="transparent"
              />
              <path
                className="button-border"
                d="M9 1 L111 1 L119 10 L119 41 L111 49 L9 49 L1 40 L1 9 Z"
                stroke="white"
                fill="none"
              />
              <text
                className="button-text"
                x="60"
                y="30"
                textAnchor="middle"
                fill="white"
                fontSize="14"
                fontFamily="BT Beau Sans"
              >
                Contact us
              </text>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Section5Products;
