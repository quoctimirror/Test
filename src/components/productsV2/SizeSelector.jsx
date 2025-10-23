import { useState } from 'react';
import './SizeSelector.css';
import sizeConversionData from '../../assets/sizeConversionBoard.json';
import CustomDropdown from './CustomDropdown';
import ShineGlassButton from '../common/button/ShineGlassButton';

const SizeSelector = ({ onClose, onSelectSize, selectedSize }) => {
    const [activeTab, setActiveTab] = useState('select'); // 'select' or 'find'
    const [measurementUnit, setMeasurementUnit] = useState('mm');
    const [selectedCountryId, setSelectedCountryId] = useState('US');
    const [isClosing, setIsClosing] = useState(false);

    // Get conversion data
    const conversionData = sizeConversionData.conversion_data;
    const countries = sizeConversionData.countries;

    // Get selected country
    const selectedCountry = countries.find(c => c.id === selectedCountryId);
    const sizeSystem = selectedCountry?.system || 'us_numeric';

    // Get circumference value based on unit
    const getCircumference = (item) => {
        return measurementUnit === 'mm'
            ? item.inside_circumference_mm
            : item.inside_circumference_in;
    };

    // Get size based on selected country system
    const getSize = (item) => {
        const systemMap = {
            'us_numeric': 'us_numeric',
            'uk_alphabetic': 'uk_alphabetic',
            'french_numeric': 'french_numeric',
            'german_numeric': 'german_numeric',
            'asian_numeric': 'asian_numeric',
            'italian_numeric': 'italian_numeric'
        };
        return item[systemMap[sizeSystem]];
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, 300); // Match animation duration
    };

    const handleSizeSelect = (sizeItem) => {
        if (onSelectSize) {
            const selectedSize = getSize(sizeItem);
            onSelectSize({
                size: selectedSize,
                circumference: getCircumference(sizeItem)
            });
        }
        handleClose();
    };

    const handleTabChange = (newTab) => {
        if (newTab === activeTab) return;
        setActiveTab(newTab);
    };

    return (
        <div
            className={`pv2-size-selector-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleClose}
        >
            <div className="pv2-size-selector-modal" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <div className="pv2-size-selector-close-button">
                    <ShineGlassButton
                        onClick={handleClose}
                        theme="footer"
                        width={32}
                        height={32}
                        className="pv2-size-selector-close-btn"
                    >
                        <img
                            src="/universeSection/close-x-icon.svg"
                            alt="Close"
                            width="14"
                            height="14"
                        />
                    </ShineGlassButton>
                </div>

                {/* Header Tabs */}
                <div className="pv2-size-selector-header">
                    <button
                        className={`pv2-size-tab pv2-size-tab-left bodytext-4--no-margin ${activeTab === 'select' ? 'active' : ''}`}
                        onClick={() => handleTabChange('select')}
                    >
                        <span className="pv2-tab-text">Select your size</span>
                        <span className="pv2-tab-ghost">Select your size</span>
                    </button>
                    <button
                        className={`pv2-size-tab pv2-size-tab-right bodytext-4--no-margin ${activeTab === 'find' ? 'active' : ''}`}
                        onClick={() => handleTabChange('find')}
                    >
                        <span className="pv2-tab-text">Find your size</span>
                        <span className="pv2-tab-ghost">Find your size</span>
                    </button>
                </div>

                {activeTab === 'select' ? (
                    <>
                        {/* Filters */}
                        <div className="pv2-size-selector-filters">
                            <div className="pv2-filter-group">
                                <CustomDropdown
                                    value={measurementUnit}
                                    onChange={setMeasurementUnit}
                                    options={[
                                        { value: 'mm', label: 'Inside Circumference (mm)' },
                                        { value: 'inch', label: 'Inside Circumference (inch)' }
                                    ]}
                                    className="pv2-filter-select"
                                />
                            </div>

                            <div className="pv2-filter-group">
                                <CustomDropdown
                                    value={selectedCountryId}
                                    onChange={setSelectedCountryId}
                                    options={countries.map(country => ({
                                        value: country.id,
                                        label: `${country.flag} ${country.name}`
                                    }))}
                                    className="pv2-filter-select pv2-filter-select-country"
                                />
                            </div>
                        </div>

                        {/* Size Table */}
                        <div className="pv2-size-table-container">
                            <table className="pv2-size-table">
                                <tbody>
                                    {conversionData.map((item) => {
                                        const size = getSize(item);
                                        // Skip if size is null for this system
                                        if (size === null) return null;

                                        // Check if this row is the selected size
                                        // Convert both to string and compare, also handle number comparison
                                        const sizeStr = String(size);
                                        const selectedSizeStr = String(selectedSize);
                                        const isSelected = selectedSize && (
                                            sizeStr === selectedSizeStr ||
                                            parseFloat(sizeStr) === parseFloat(selectedSizeStr)
                                        );

                                        return (
                                            <tr
                                                key={item.id}
                                                className={`pv2-size-row ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handleSizeSelect(item)}
                                            >
                                                <td className="pv2-size-cell">{getCircumference(item)}</td>
                                                <td className="pv2-size-cell">{size}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    /* Find Your Size Content */
                    <div className="pv2-find-size-content">
                        <div>
                            <p className="pv2-find-size-intro">
                                You can easily measure your ring size at home using just a
                                string, thread, or ribbon and a ruler. Here's how:
                            </p>

                            <ol className="pv2-find-size-steps bodytext-3--no-margin">
                                <li>Gently wrap the string around the base of your finger, close
                                    to your knuckle (where a ring would sit comfortably).</li>
                                <li>Mark the exact point where the string overlaps.</li>
                                <li>Lay the string flat next to a ruler and measure the length in
                                    millimeters (mm). This number is your finger's
                                    circumference.</li>
                            </ol>

                            <p className="pv2-find-size-tip bodytext-5--no-margin">
                                Tips: For the most accurate results, measure your finger at the end of the day when it's at its largest, and avoid measuring when your hands are cold.
                            </p>

                            <p
                                className="pv2-find-size-footer bodytext-4--no-margin"
                                onClick={() => handleTabChange('select')}
                            >
                                Have your result? Select your size
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SizeSelector;