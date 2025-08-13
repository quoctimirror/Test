import { useState, useEffect } from "react";
import "./SelectOptionSection.css";
import GlassButton from "../common/GlassButton";
import api from "../../api/axiosConfig";

const SelectOptionSection = () => {
  const [selectedStone, setSelectedStone] = useState("oval");
  const [currentPrice, setCurrentPrice] = useState("4.000$");
  const [activeTab, setActiveTab] = useState("Stone");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [components, setComponents] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [componentOptions, setComponentOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userSelections, setUserSelections] = useState({});
  const [sizeValue, setSizeValue] = useState(6); // State for size slider

  // Default values for overview when no selection is made
  const defaultValues = {
    Stone: "Oval",
    Metal: "Yellow Gold",
    "Band Style": "Single Band",
    Size: "6",
    Engraving: "No",
    "Gift Wrapping": "Yes",
    Quantity: "1",
  };

  // Functions to handle localStorage
  const saveSelectionsToLocalStorage = (selections) => {
    localStorage.setItem("ringConfiguration", JSON.stringify(selections));
  };

  const loadSelectionsFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem("ringConfiguration");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return {};
    }
  };

  const handleSaveSettings = () => {
    // Settings saved
  };

  const handleContactUs = () => {
    // Contact us clicked
  };

  const handleBookAppointment = () => {
    // Book appointment clicked
  };

  const handleOrderNow = () => {
    // Order now clicked
  };

  const handleMoreDetails = () => {
    // More details clicked
  };

  // Get options for current active tab
  const getCurrentTabOptions = () => {
    if (!activeTab || !components.length || !componentOptions.length) return [];

    // If Overview tab is selected, return empty array (no options to display)
    if (activeTab === "Overview") return [];

    // Find the component that matches the active tab
    const currentComponent = components.find(
      (comp) => comp.componentName === activeTab
    );
    if (!currentComponent) return [];

    // Filter options by componentId and reverse the order
    return componentOptions
      .filter((option) => option.componentId === currentComponent.componentId)
      .reverse();
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);

    // Update user selections with current tab and option
    const updatedSelections = {
      ...userSelections,
      [activeTab]: {
        componentOptionalId: option.componentOptionalId,
        componentOptionalName: option.componentOptionalName,
        componentId: option.componentId,
      },
    };

    setUserSelections(updatedSelections);
    saveSelectionsToLocalStorage(updatedSelections);
  };

  const handleSizeChange = (value) => {
    setSizeValue(value);
    
    // Update user selections for Size tab
    const updatedSelections = {
      ...userSelections,
      Size: {
        componentOptionalId: `SIZE_${value}`,
        componentOptionalName: value.toString(),
        componentId: "COMP004", // Size component ID
      },
    };

    setUserSelections(updatedSelections);
    saveSelectionsToLocalStorage(updatedSelections);
  };

  // Fetch categories and components from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await api.get("/api/categories");
        const categoriesData = categoriesResponse.data;
        setCategories(categoriesData);

        // Find and set the Ring category (CAT0001) as selected
        const ringCategory = categoriesData.find(
          (cat) => cat.categoryId === "CAT0001"
        );
        if (ringCategory) {
          setSelectedCategory(ringCategory);
        }

        // Fetch components
        const componentsResponse = await api.get("/api/components");
        const componentsData = componentsResponse.data;

        // Filter components by categoryId CAT0001 and reverse the order
        const ringComponents = componentsData
          .filter((comp) => comp.categoryId === "CAT0001")
          .reverse();
        setComponents(ringComponents);

        // Create tabs from component names and add Overview tab at the end
        const componentTabs = ringComponents.map(
          (comp) => comp.componentName
        );
        const allTabs = [...componentTabs, "Overview"];
        setTabs(allTabs);

        // Set first component as active tab if available
        if (componentTabs.length > 0) {
          setActiveTab(componentTabs[0]);
        }

        // Fetch component options
        const optionsResponse = await api.get("/api/component-optionals");
        const optionsData = optionsResponse.data;
        setComponentOptions(optionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Fallback data khi API thất bại
        
        // Fallback categories
        const fallbackCategories = [
          { categoryId: "CAT0001", categoryName: "Rings", description: "Wedding and engagement rings" }
        ];
        setCategories(fallbackCategories);
        setSelectedCategory(fallbackCategories[0]);
        
        // Fallback components
        const fallbackComponents = [
          { componentId: "COMP001", componentName: "Stone", categoryId: "CAT0001" },
          { componentId: "COMP002", componentName: "Metal", categoryId: "CAT0001" },
          { componentId: "COMP003", componentName: "Band Style", categoryId: "CAT0001" },
          { componentId: "COMP004", componentName: "Size", categoryId: "CAT0001" },
          { componentId: "COMP005", componentName: "Engraving", categoryId: "CAT0001" },
          { componentId: "COMP006", componentName: "Gift Wrapping", categoryId: "CAT0001" },
          { componentId: "COMP007", componentName: "Quantity", categoryId: "CAT0001" }
        ];
        setComponents(fallbackComponents);
        
        // Create tabs
        const componentTabs = fallbackComponents.map(comp => comp.componentName);
        const allTabs = [...componentTabs, "Overview"];
        setTabs(allTabs);
        setActiveTab(componentTabs[0]);
        
        // Fallback component options
        const fallbackOptions = [
          // Stone options
          { componentOptionalId: "OPT001", componentOptionalName: "Oval", componentId: "COMP001" },
          { componentOptionalId: "OPT002", componentOptionalName: "Round", componentId: "COMP001" },
          { componentOptionalId: "OPT003", componentOptionalName: "Princess", componentId: "COMP001" },
          { componentOptionalId: "OPT004", componentOptionalName: "Emerald", componentId: "COMP001" },
          
          // Metal options
          { componentOptionalId: "OPT005", componentOptionalName: "Yellow Gold", componentId: "COMP002" },
          { componentOptionalId: "OPT006", componentOptionalName: "White Gold", componentId: "COMP002" },
          { componentOptionalId: "OPT007", componentOptionalName: "Rose Gold", componentId: "COMP002" },
          { componentOptionalId: "OPT008", componentOptionalName: "Platinum", componentId: "COMP002" },
          
          // Band Style options
          { componentOptionalId: "OPT009", componentOptionalName: "Single Band", componentId: "COMP003" },
          { componentOptionalId: "OPT010", componentOptionalName: "Double Band", componentId: "COMP003" },
          { componentOptionalId: "OPT011", componentOptionalName: "Twisted Band", componentId: "COMP003" },
          
          // Size options
          { componentOptionalId: "OPT012", componentOptionalName: "5", componentId: "COMP004" },
          { componentOptionalId: "OPT013", componentOptionalName: "6", componentId: "COMP004" },
          { componentOptionalId: "OPT014", componentOptionalName: "7", componentId: "COMP004" },
          { componentOptionalId: "OPT015", componentOptionalName: "8", componentId: "COMP004" },
          
          // Engraving options
          { componentOptionalId: "OPT016", componentOptionalName: "No", componentId: "COMP005" },
          { componentOptionalId: "OPT017", componentOptionalName: "Yes", componentId: "COMP005" },
          
          // Gift Wrapping options
          { componentOptionalId: "OPT018", componentOptionalName: "Yes", componentId: "COMP006" },
          { componentOptionalId: "OPT019", componentOptionalName: "No", componentId: "COMP006" },
          
          // Quantity options
          { componentOptionalId: "OPT020", componentOptionalName: "1", componentId: "COMP007" },
          { componentOptionalId: "OPT021", componentOptionalName: "2", componentId: "COMP007" },
          { componentOptionalId: "OPT022", componentOptionalName: "3", componentId: "COMP007" }
        ];
        setComponentOptions(fallbackOptions);
      }
    };

    fetchData();
  }, []);

  // Reset to default values on page load (don't load from localStorage)
  useEffect(() => {
    // Clear any existing localStorage data on page load
    localStorage.removeItem("ringConfiguration");
    // Keep userSelections as empty object so it uses defaultValues
    setUserSelections({});
  }, []);

  return (
    <div className="select-option-section">
      {/* Main ring display */}
      <div className="ring-display">
        <img
          src="/products/nhan_ex.png"
          alt="Wedding Ring Set"
          className="ring-image"
        />
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-wrapper">
        <div className="tabs">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="bodytext-6--no-margin">{tab}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="main">
        {/* Left side - Help section */}
        <div className="help">
          <h2 className="bodytext-1--no-margin">Need help?</h2>
          <p className="help-text bodytext-6--no-margin">
            There's no question too small or request too big for our client
            advisors.
            <br />
            We're always at your service.
          </p>
          <GlassButton 
            theme="light"
            width={274}
            height={57}
            fontSize={14}
            onClick={handleContactUs}
          >
            Contact Us
          </GlassButton>
        </div>

        {/* Center - Content area */}
        <div
          className={`content ${activeTab === "Size" ? "content-size" : ""}`}
          style={{
            "--grid-columns": activeTab === "Size" ? 1 : Math.min(getCurrentTabOptions().length || 1, 6),
          }}
        >
          {activeTab === "Overview" ? (
            <div className="overview-content">
              <div className="overview-grid">
                {tabs
                  .filter((tab) => tab !== "Overview")
                  .map((tabName) => {
                    const selection = userSelections[tabName];
                    let displayValue;
                    
                    if (selection) {
                      displayValue = selection.componentOptionalName;
                    } else if (tabName === "Size") {
                      displayValue = sizeValue.toString();
                    } else {
                      displayValue = defaultValues[tabName] || "No Selection";
                    }

                    return (
                      <div key={tabName} className="overview-item">
                        <div className="overview-label">{tabName}</div>
                        <div className="overview-value">{displayValue}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : activeTab === "Size" ? (
            // Size slider
            <>
              <div className="size-slider-container">
                <div className="size-slider-wrapper">
                  <div 
                    className="size-value bodytext-3--no-margin"
                    style={{
                      left: `${((sizeValue - 1) / 9) * 100}%`
                    }}
                  >
                    {sizeValue}
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sizeValue}
                    onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                    className="size-slider"
                    style={{
                      '--progress-width': `${((sizeValue - 1) / 9) * 100}%`
                    }}
                  />
                </div>
              </div>
              <div className="find-size-link bodytext-6--no-margin">
                Find your size →
              </div>
            </>
          ) : (
            getCurrentTabOptions().map((option) => (
              <div
                key={option.componentOptionalId}
                className={`option ${
                  selectedOption?.componentOptionalId ===
                  option.componentOptionalId
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="circle"></div>
                <div className="label bodytext-3--no-margin">{option.componentOptionalName}</div>
              </div>
            ))
          )}
        </div>

        {/* Right side - Summary */}
        <div className="summary">
          <h2 className="bodytext-1--no-margin">From {currentPrice}</h2>
          <GlassButton 
            theme="custom"
            width={274}
            height={57}
            fontSize={14}
            onClick={handleBookAppointment}
            className="book-appointment-button"
          >
            Book An Appointment
          </GlassButton>
          <GlassButton 
            theme="custom"
            width={274}
            height={57}
            fontSize={14}
            onClick={handleOrderNow}
            className="order-now-button"
          >
            Order Now
          </GlassButton>
        </div>
      </div>

      {/* More Detail Link */}
      <div className="more-detail-wrapper" onClick={handleMoreDetails}>
        <span>More detail</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 1.5L6 6.5L11 1.5" stroke="black" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default SelectOptionSection;
