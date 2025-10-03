import { useState, useRef, useEffect } from 'react';
import './CustomDropdown.css';

const CustomDropdown = ({ value, onChange, options, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
            <div
                className="custom-dropdown-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="custom-dropdown-selected">
                    {selectedOption?.label || 'Select...'}
                </span>
                <svg
                    className={`custom-dropdown-arrow ${isOpen ? 'open' : ''}`}
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                >
                    <path
                        d="M1 1L6 6L11 1"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {isOpen && (
                <div className="custom-dropdown-list">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`custom-dropdown-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
