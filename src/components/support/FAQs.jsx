import React, { useState } from 'react';

const FAQs = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = [
    "Are future diamonds real diamonds?",
    "How are future diamonds made?",
    "Do your future diamonds come with certification?",
    "Can I request a custom design or engraving on a piece?",
    "What are Mirror's warranty and aftercare policies?",
    "Do you ship internationally?"
  ];

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="faqs-wrapper">
      <div className="faq-sidebar">
        <nav className="faq-nav">
          <ul>
            <li className="nav-item active">
              <a href="#products">Products</a>
            </li>
            <li className="nav-item">
              <a href="#orders">Orders & Payments</a>
            </li>
            <li className="nav-item">
              <a href="#exchanges">Exchanges & Returns</a>
            </li>
            <li className="nav-item">
              <a href="#care">Care & Repairs</a>
            </li>
            <li className="nav-item">
              <a href="#shipping">Shipping & Delivery</a>
            </li>
            <li className="nav-item">
              <a href="#location">Location</a>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="faqs">
        <div className="search-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search"
              className="search-input"
            />
            <button className="search-button">Search</button>
          </div>
        </div>

      <div className="faq-content">
        <div className="faq-sections">
        {[1, 2, 3].map((sectionIndex) => (
          <div key={sectionIndex} className="faq-section">
            <div className="faq-image-placeholder">
              <div className="placeholder-box"></div>
            </div>
            
            <div className="faq-list">
              {faqData.map((question, index) => (
                <div key={`${sectionIndex}-${index}`} className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(`${sectionIndex}-${index}`)}
                  >
                    <span>{question}</span>
                    <span className={`faq-icon ${expandedFAQ === `${sectionIndex}-${index}` ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {expandedFAQ === `${sectionIndex}-${index}` && (
                    <div className="faq-answer">
                      <p>Answer for: {question}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default FAQs;