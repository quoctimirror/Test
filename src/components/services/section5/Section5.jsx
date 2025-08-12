import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Section5.css";
import GlassButton from "../../common/GlassButton";

const Section5 = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const handleViewAllFAQs = () => {
    window.scrollTo(0, 0);
    navigate("/support?tab=faqs");
  };

  const faqs = [
    {
      id: 1,
      question: "Are future diamonds real diamonds?",
    },
    {
      id: 2,
      question: "How are future diamonds made?",
    },
    {
      id: 3,
      question: "Do your future diamonds come with certification?",
    },
    {
      id: 4,
      question: "Can I request a custom design or engraving on a piece?",
    },
    {
      id: 5,
      question: "What are Mirror's warranty and aftercare policies?",
    },
    {
      id: 6,
      question: "Do you ship internationally?",
    },
    {
      id: 7,
      question: "Are future diamonds real diamonds?",
    },
  ];

  const toggleFaq = (id) => {
    const panel = document.querySelector(`[data-faq-id="${id}"]`);
    if (panel) {
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
        setOpenFaq(null);
      } else {
        // Đóng tất cả panels khác trước
        document.querySelectorAll(".faq-answer").forEach((p) => {
          p.style.maxHeight = null;
        });
        // Mở panel hiện tại
        panel.style.maxHeight = panel.scrollHeight + "px";
        setOpenFaq(id);
      }
    }
  };

  return (
    <section className="services-section5">
      <div className="section5-container">
        <div className="section5-content">
          <h1 className="section5-title">FAQs</h1>

          <div className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.id} className={`faq-item ${openFaq === faq.id ? 'active' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={openFaq === faq.id}
                >
                  <span>{faq.question}</span>
                  <span
                    className={`faq-icon ${
                      openFaq === faq.id ? "expanded" : ""
                    }`}
                  ></span>
                </button>
                <div className="faq-answer" data-faq-id={faq.id}>
                  <p>
                    This is the answer content for "{faq.question}". Lorem ipsum
                    dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-section">
            <GlassButton
              className="view-all-btn"
              theme="default"
              width={125}
              height={57}
              fontSize={14}
              onClick={handleViewAllFAQs}
            >
              View all
            </GlassButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section5;
