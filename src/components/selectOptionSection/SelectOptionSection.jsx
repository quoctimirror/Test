import { useState, useEffect } from "react";
import "./SelectOptionSection.css";

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
    console.log("Settings saved:", { selectedStone, currentPrice });
  };

  const handleContactUs = () => {
    console.log("Contact us clicked");
  };

  const handleBookAppointment = () => {
    console.log("Book appointment clicked");
  };

  const handleOrderNow = () => {
    console.log("Order now clicked");
  };

  const handleMoreDetails = () => {
    console.log("More details clicked");
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
    console.log("Selected option:", option);
    console.log("Updated selections:", updatedSelections);
  };

  // Fetch categories and components from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);

          // Find and set the Ring category (CAT0001) as selected
          const ringCategory = categoriesData.find(
            (cat) => cat.categoryId === "CAT0001"
          );
          if (ringCategory) {
            setSelectedCategory(ringCategory);
          }
        }

        // Fetch components
        const componentsResponse = await fetch("/api/components");
        if (componentsResponse.ok) {
          const componentsData = await componentsResponse.json();

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
        }

        // Fetch component options
        const optionsResponse = await fetch("/api/component-optionals");
        if (optionsResponse.ok) {
          const optionsData = await optionsResponse.json();
          setComponentOptions(optionsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="main">
        {/* Left side - Help section */}
        <div className="help">
          <h2>Need help?</h2>
          <p className="help-text">
            There's no question too small or request too big for our client
            advisors.
            <br />
            We're always at your service.
          </p>
          <button className="button solid" onClick={handleContactUs}>
            Contact Us
          </button>
        </div>

        {/* Center - Content area */}
        <div
          className="content"
          style={{
            "--grid-columns": Math.min(getCurrentTabOptions().length || 1, 6),
          }}
        >
          {activeTab === "Overview" ? (
            <div className="overview-content">
              <div className="overview-grid">
                {tabs
                  .filter((tab) => tab !== "Overview")
                  .map((tabName) => {
                    const selection = userSelections[tabName];
                    const displayValue = selection
                      ? selection.componentOptionalName
                      : defaultValues[tabName] || "No Selection";

                    return (
                      <div key={tabName} className="overview-item">
                        <div className="overview-label">{tabName}</div>
                        <div className="overview-value">{displayValue}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
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
                <div className="label">{option.componentOptionalName}</div>
              </div>
            ))
          )}
        </div>

        {/* Right side - Summary */}
        <div className="summary">
          <h2>From {currentPrice}</h2>
          <button className="button outline" onClick={handleBookAppointment}>
            Book An Appointment
          </button>
          <button className="button solid" onClick={handleOrderNow}>
            Order Now
          </button>
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
