import React, { useState, useEffect, useRef } from "react";
import "./FAQs.css";

const FAQs = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [activeSection, setActiveSection] = useState("products");

  // Dữ liệu câu hỏi gốc của bạn, không thay đổi
  const faqData = [
    "Are future diamonds real diamonds?",
    "How are future diamonds made?",
    "Do your future diamonds come with certification?",
    "Can I request a custom design or engraving on a piece?",
    "What are Mirror's warranty and aftercare policies?",
    "Do you ship internationally?",
  ];

  // Dữ liệu để định nghĩa các section và sidebar, giúp chúng đồng bộ
  const sectionsInfo = [
    { id: "products", title: "Products" },
    { id: "orders", title: "Orders & Payments" },
    { id: "exchanges", title: "Exchanges & Returns" },
    { id: "care", title: "Care & Repairs" },
    { id: "shipping", title: "Shipping & Delivery" },
    { id: "location", title: "Location" },
  ];

  // Logic Intersection Observer để theo dõi section active (giữ nguyên)
  const observer = useRef(null);
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find(
          (entry) => entry.isIntersecting
        )?.target;
        if (visibleSection) {
          setActiveSection(visibleSection.id);
        }
      },
      {
        rootMargin: "-40% 0px -60% 0px",
        threshold: 0,
      }
    );

    const sections = document.querySelectorAll(".faq-section");
    sections.forEach((section) => observer.current.observe(section));

    return () => {
      sections.forEach((section) => observer.current.unobserve(section));
    };
  }, []);

  const toggleFAQ = (id) => {
    const panel = document.querySelector(`[data-faq-id="${id}"]`);
    
    if (panel) {
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
        setExpandedFAQ(null);
      } else {
        // Đóng tất cả panels khác trước
        document.querySelectorAll('.faq-answer').forEach(p => {
          p.style.maxHeight = null;
        });
        
        // Mở panel hiện tại
        panel.style.maxHeight = panel.scrollHeight + "px";
        setExpandedFAQ(id);
      }
    }
  };

  return (
    // Thêm container để xác định vùng hoạt động của sticky
    <div className="faqs-sticky-container">
      <div className="faqs-wrapper">
        <div className="faq-sidebar-section">
          {/* Sidebar giờ sẽ được render động từ `sectionsInfo` */}
          <nav className="faq-nav">
            <ul>
              {sectionsInfo.map((section) => (
                <li
                  key={section.id}
                  className={`nav-item ${
                    activeSection === section.id ? "active" : ""
                  }`}
                >
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="faqs-main-section">
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

          <div className="faq-content-section">
            <div className="faq-sections">
              {/* Lặp qua `sectionsInfo` để tạo các section */}
              {sectionsInfo.map((section) => (
                <div key={section.id} id={section.id} className="faq-section">
                  <div className="faq-image-placeholder">
                    <div className="placeholder-box">{section.title}</div>
                  </div>

                  <div className="faq-list">
                    {/* QUAN TRỌNG: Lặp qua `faqData` gốc để render TẤT CẢ câu hỏi trong MỖI section */}
                    {faqData.map((question, index) => (
                      <div key={`${section.id}-${index}`} className="faq-item">
                        <button
                          className="faq-question"
                          onClick={() => toggleFAQ(`${section.id}-${index}`)}
                        >
                          <span>{question}</span>
                          <span
                            className={`faq-icon ${
                              expandedFAQ === `${section.id}-${index}`
                                ? "expanded"
                                : ""
                            }`}
                          ></span>
                        </button>
                        <div
                          className="faq-answer"
                          data-faq-id={`${section.id}-${index}`}
                        >
                          <p>Answer for: {question}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
