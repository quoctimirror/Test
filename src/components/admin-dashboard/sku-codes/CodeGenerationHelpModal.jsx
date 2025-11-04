import React from "react";
import "./CodeForms.css";

const CodeGenerationHelpModal = ({ open, onClose, title, sections, footer }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="code-help-modal-overlay" onClick={onClose}>
      <div className="code-help-modal" onClick={(event) => event.stopPropagation()}>
        <div className="code-help-header">
          <h3>{title}</h3>
          <button type="button" className="code-help-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="code-help-body">
          {sections.map((section, index) => (
            <div key={index} className="code-help-section">
              <h4>{section.heading}</h4>
              {section.description && <p>{section.description}</p>}
              {section.items && section.items.length > 0 && (
                <ul>
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        {footer && <div className="code-help-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default CodeGenerationHelpModal;
