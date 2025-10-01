import { useState } from 'react';
import './SizeSelector.css';
import sizeConversionData from '../../assets/sizeConversionBoard.json';

const SizeSelector = ({ onClose, onSelectSize }) => {
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

    return (
        <div
            className={`size-selector-overlay ${isClosing ? 'closing' : ''}`}
            onClick={handleClose}
        >
            <div className="size-selector-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header Tabs */}
                <div className="size-selector-header">
                    <button
                        className={`size-tab bodytext-4--no-margin ${activeTab === 'select' ? 'active' : ''}`}
                        onClick={() => setActiveTab('select')}
                    >
                        Select your size
                    </button>
                    <button
                        className={`size-tab bodytext-4--no-margin ${activeTab === 'find' ? 'active' : ''}`}
                        onClick={() => setActiveTab('find')}
                    >
                        Find your size
                    </button>
                </div>

                {activeTab === 'select' ? (
                    <>
                        {/* Filters */}
                        <div className="size-selector-filters">
                            <div className="filter-group">
                                <select
                                    value={measurementUnit}
                                    onChange={(e) => setMeasurementUnit(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="mm">Inside Circumference (mm)</option>
                                    <option value="inch">Inside Circumference (inch)</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <select
                                    value={selectedCountryId}
                                    onChange={(e) => setSelectedCountryId(e.target.value)}
                                    className="filter-select filter-select-country"
                                >
                                    {countries.map((country) => (
                                        <option key={country.id} value={country.id}>
                                            {country.flag} {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Size Table */}
                        <div className="size-table-container">
                            <table className="size-table">
                                <tbody>
                                    {conversionData.map((item) => {
                                        const size = getSize(item);
                                        // Skip if size is null for this system
                                        if (size === null) return null;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="size-row"
                                                onClick={() => handleSizeSelect(item)}
                                            >
                                                <td className="size-cell">{getCircumference(item)}</td>
                                                <td className="size-cell">{size}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    /* Find Your Size Content */
                    <div className="find-size-content">
                        <div>
                            <p className="find-size-intro bodytext-3--no-margin">
                                You can easily measure your ring size at home using just a <br />
                                string, thread, or ribbon and a ruler. Here's how:
                            </p>

                            <ol className="find-size-steps bodytext-3--no-margin">
                                <li>Gently wrap the string around the base of your finger, close <br />
                                    to your knuckle (where a ring would sit comfortably).</li>
                                <li>Mark the exact point where the string overlaps.</li>
                                <li>Lay the string flat next to a ruler and measure the length in <br />
                                    millimeters (mm). This number is your finger's<br />
                                    circumference.</li>
                            </ol>

                            <p className="find-size-tip bodytext-5--no-margin">
                                Tips: For the most accurate results, measure your finger at the end of the <br />
                                day when it's at its largest, and avoid measuring when your hands are <br /> cold.
                            </p>

                            <p className="find-size-footer bodytext-4--no-margin">Have your result? Select your size</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SizeSelector;