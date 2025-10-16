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
        <div className={`pv2-custom-dropdown ${className}`} ref={dropdownRef}>
            <div
                className="pv2-custom-dropdown-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="pv2-custom-dropdown-selected">
                    {selectedOption?.label || 'Select...'}
                </span>
                <svg
                    className={`pv2-custom-dropdown-arrow ${isOpen ? 'pv2-open' : ''}`}
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
                <div className="pv2-custom-dropdown-list">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`pv2-custom-dropdown-option ${option.value === value ? 'pv2-selected' : ''}`}
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
