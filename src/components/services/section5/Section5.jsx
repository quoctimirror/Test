import React, { useState } from 'react';
import './Section5.css';

const Section5 = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "Are future diamonds real diamonds?"
    },
    {
      id: 2,
      question: "How are future diamonds made?"
    },
    {
      id: 3,
      question: "Do your future diamonds come with certification?"
    },
    {
      id: 4,
      question: "Can I request a custom design or engraving on a piece?"
    },
    {
      id: 5,
      question: "What are Mirror's warranty and aftercare policies?"
    },
    {
      id: 6,
      question: "Do you ship internationally?"
    },
    {
      id: 7,
      question: "Are future diamonds real diamonds?"
    }
  ];

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <section className="services-section5">
      <div className="section5-container">
        <div className="section5-content">
          <h1 className="section5-title">FAQs</h1>
          
          <div className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={openFaq === faq.id}
                >
                  <span>{faq.question}</span>
                  <span className={`faq-icon ${openFaq === faq.id ? 'active' : ''}`}>
                    &#8964;
                  </span>
                </button>
                {openFaq === faq.id && (
                  <div className="faq-answer">
                    <p>This is the answer content for "{faq.question}". Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="view-all-section">
            <button className="view-all-btn">View all</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section5;