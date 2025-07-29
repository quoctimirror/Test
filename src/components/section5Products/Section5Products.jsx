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
          <button className="contact-us-button">Contact us</button>
        </div>
      </div>
    </div>
  );
};

export default Section5Products;
