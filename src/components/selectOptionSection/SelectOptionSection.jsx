import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SelectOptionSection.css";
import ShineGlassButton from "@components/common/button/ShineGlassButton";
import {
  categoriesAPI,
  componentsAPI,
  componentOptionalsAPI,
  productsAPI,
  ordersAPI,
  handleAPIError,
} from "@services/api";
import { ROUTES } from "@/constants/routes";

const SelectOptionSection = () => {
  const navigate = useNavigate();
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderFeedback, setOrderFeedback] = useState(null);

  const decodeTokenPayload = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
      const [, payload] = token.split(".");
      return JSON.parse(atob(payload));
    } catch (error) {
      console.warn("Unable to decode access token", error);
      return null;
    }
  };

  const parsePriceToNumber = (priceString) => {
    if (!priceString) return 0;
    const numeric = priceString.toString().replace(/[^0-9]/g, "");
    return numeric ? Number(numeric) : 0;
  };

  const formatCurrency = (amount, currency = "USD") => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
      }).format(Number(amount || 0));
    } catch (error) {
      return `$${Number(amount || 0)}`;
    }
  };

  const resolveQuantity = () => {
    const selectedQty = userSelections?.Quantity?.componentOptionalName;
    const parsed = selectedQty ? parseInt(selectedQty, 10) : NaN;
    return Number.isNaN(parsed) ? 1 : parsed;
  };

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
    navigate(ROUTES.CONTACT);
  };

  const handleBookAppointment = () => {
    // Book appointment clicked
  };

  const handleOrderNow = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate(ROUTES.AUTH_LOGIN);
      return;
    }

    if (!selectedProduct) {
      setOrderFeedback("Product selection is unavailable. Please try again later.");
      return;
    }

    const quantity = resolveQuantity();
    const totalAmount = parsePriceToNumber(currentPrice);
    const identity = decodeTokenPayload();
    const configurationSnapshot = {
      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        price: selectedProduct.price,
        currency: selectedProduct.currency,
      },
      selections: userSelections,
      size: sizeValue,
      categoryId: selectedCategory?.id,
      overviewDefaults: defaultValues,
      displayedPrice: currentPrice,
      user: identity
        ? {
            id: identity.userId || identity.sub,
            email: identity.email,
          }
        : undefined,
    };

    const payload = {
      productId: selectedProduct.id,
      subtotalAmount: totalAmount,
      totalAmount,
      paymentTermsType: "FIXED_SCHEDULE",
      configuration: JSON.stringify(configurationSnapshot),
      quantity,
      sourceChannel: "WEB_PRODUCT_PAGE",
      customerName:
        identity?.name ||
        `${identity?.firstName ?? ""} ${identity?.lastName ?? ""}`.trim() ||
        undefined,
      customerEmail: identity?.email,
      customerPhone: identity?.phone || identity?.phoneNumber,
    };

    try {
      setIsSubmittingOrder(true);
      setOrderFeedback(null);
      await ordersAPI.create(payload);
      setOrderFeedback(
        "Thank you! Your order request has been received. Our team will reach out shortly to finalize payment arrangements."
      );
    } catch (error) {
      const apiError = handleAPIError(error, "Unable to create order");
      setOrderFeedback(apiError.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleMoreDetails = () => {
    // More details clicked
  };

  // Get options for current active tab
  const getCurrentTabOptions = () => {
    if (!activeTab || !components.length || !componentOptions.length) return [];

    // If Overview tab is selected, return empty array (no options to display)
    if (activeTab === "Overview") return [];

    // Find the component that matches the active tab - handle different field names
    const currentComponent = components.find(
      (comp) => (comp.componentName || comp.name) === activeTab
    );

    if (!currentComponent) {
      return [];
    }

    // Filter options by componentId - handle different field names
    const componentId = currentComponent.componentId || currentComponent.id;
    const filteredOptions = componentOptions
      .filter((option) => option.componentId === componentId)
      .reverse();

    return filteredOptions;
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);

    // Update user selections with current tab and option - handle different field names
    const updatedSelections = {
      ...userSelections,
      [activeTab]: {
        componentOptionalId: option.componentOptionalId || option.id,
        componentOptionalName: option.componentOptionalName || option.name,
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
        // Fetch categories using API Gateway
        const categoriesResponse = await categoriesAPI.getAll();
        const categoriesData = categoriesResponse.data;
        setCategories(categoriesData);

        // Find and set the Ring category - backend uses 'CAT000001' format
        const ringCategory = categoriesData.find(
          (cat) => cat.id === "CAT000001" || cat.categoryName === "Rings"
        );

        if (ringCategory) {
          setSelectedCategory(ringCategory);
        }

        // Fetch components using API Gateway
        const componentsResponse = await componentsAPI.getAll();
        const componentsData = componentsResponse.data;

        // Filter components by categoryId - backend uses 'CAT000001' format
        const ringComponents = componentsData
          .filter(
            (comp) =>
              comp.categoryId === "CAT000001" ||
              comp.categoryId === ringCategory?.id
          )
          .reverse();

        setComponents(ringComponents);

        // Create tabs from component names - handle different possible field names
        const componentTabs = ringComponents.map(
          (comp) => comp.componentName || comp.name || "Unnamed Component"
        );
        const allTabs = [...componentTabs, "Overview"];
        setTabs(allTabs);

        // Set first component as active tab if available
        if (componentTabs.length > 0) {
          setActiveTab(componentTabs[0]);
        }

        // Fetch component options using API Gateway
        const optionsResponse = await componentOptionalsAPI.getAll();
        const optionsData = optionsResponse.data;
        setComponentOptions(optionsData);

        // Fetch default product for ordering context
        const productsResponse = await productsAPI.getAll({ paginated: false });
        const productData = productsResponse.data;
        if (Array.isArray(productData) && productData.length > 0) {
          setSelectedProduct(productData[0]);
          setCurrentPrice(
            formatCurrency(
              productData[0].price,
              productData[0].currency || "USD"
            )
          );
        }
      } catch (error) {
        const errorInfo = handleAPIError(
          error,
          "Failed to load configuration data"
        );
        console.error("Error fetching data:", errorInfo.message);

        // Fallback data khi API thất bại

        // Fallback categories
        const fallbackCategories = [
          {
            categoryId: "CAT0001",
            categoryName: "Rings",
            description: "Wedding and engagement rings",
          },
        ];
        setCategories(fallbackCategories);
        setSelectedCategory(fallbackCategories[0]);

        // Fallback components
        const fallbackComponents = [
          {
            componentId: "COMP001",
            componentName: "Stone",
            categoryId: "CAT0001",
          },
          {
            componentId: "COMP002",
            componentName: "Metal",
            categoryId: "CAT0001",
          },
          {
            componentId: "COMP003",
            componentName: "Band Style",
            categoryId: "CAT0001",
          },
          {
            componentId: "COMP004",
            componentName: "Size",
            categoryId: "CAT0001",
          },
          {
            componentId: "COMP005",
            componentName: "Engraving",
            categoryId: "CAT0001",
          },
          {
            componentId: "COMP006",
            componentName: "Gift Wrapping",
            categoryId: "CAT0001",
          },
          {
            componentId: "COMP007",
            componentName: "Quantity",
            categoryId: "CAT0001",
          },
        ];
        setComponents(fallbackComponents);

        // Create tabs
        const componentTabs = fallbackComponents.map(
          (comp) => comp.componentName
        );
        const allTabs = [...componentTabs, "Overview"];
        setTabs(allTabs);
        setActiveTab(componentTabs[0]);

        // Fallback component options
        const fallbackOptions = [
          // Stone options
          {
            componentOptionalId: "OPT001",
            componentOptionalName: "Oval",
            componentId: "COMP001",
          },
          {
            componentOptionalId: "OPT002",
            componentOptionalName: "Round",
            componentId: "COMP001",
          },
          {
            componentOptionalId: "OPT003",
            componentOptionalName: "Princess",
            componentId: "COMP001",
          },
          {
            componentOptionalId: "OPT004",
            componentOptionalName: "Emerald",
            componentId: "COMP001",
          },

          // Metal options
          {
            componentOptionalId: "OPT005",
            componentOptionalName: "Yellow Gold",
            componentId: "COMP002",
          },
          {
            componentOptionalId: "OPT006",
            componentOptionalName: "White Gold",
            componentId: "COMP002",
          },
          {
            componentOptionalId: "OPT007",
            componentOptionalName: "Rose Gold",
            componentId: "COMP002",
          },
          {
            componentOptionalId: "OPT008",
            componentOptionalName: "Platinum",
            componentId: "COMP002",
          },

          // Band Style options
          {
            componentOptionalId: "OPT009",
            componentOptionalName: "Single Band",
            componentId: "COMP003",
          },
          {
            componentOptionalId: "OPT010",
            componentOptionalName: "Double Band",
            componentId: "COMP003",
          },
          {
            componentOptionalId: "OPT011",
            componentOptionalName: "Twisted Band",
            componentId: "COMP003",
          },

          // Size options
          {
            componentOptionalId: "OPT012",
            componentOptionalName: "5",
            componentId: "COMP004",
          },
          {
            componentOptionalId: "OPT013",
            componentOptionalName: "6",
            componentId: "COMP004",
          },
          {
            componentOptionalId: "OPT014",
            componentOptionalName: "7",
            componentId: "COMP004",
          },
          {
            componentOptionalId: "OPT015",
            componentOptionalName: "8",
            componentId: "COMP004",
          },

          // Engraving options
          {
            componentOptionalId: "OPT016",
            componentOptionalName: "No",
            componentId: "COMP005",
          },
          {
            componentOptionalId: "OPT017",
            componentOptionalName: "Yes",
            componentId: "COMP005",
          },

          // Gift Wrapping options
          {
            componentOptionalId: "OPT018",
            componentOptionalName: "Yes",
            componentId: "COMP006",
          },
          {
            componentOptionalId: "OPT019",
            componentOptionalName: "No",
            componentId: "COMP006",
          },

          // Quantity options
          {
            componentOptionalId: "OPT020",
            componentOptionalName: "1",
            componentId: "COMP007",
          },
          {
            componentOptionalId: "OPT021",
            componentOptionalName: "2",
            componentId: "COMP007",
          },
          {
            componentOptionalId: "OPT022",
            componentOptionalName: "3",
            componentId: "COMP007",
          },
        ];
        setComponentOptions(fallbackOptions);
        setSelectedProduct({
          id: "PRD-PLACEHOLDER",
          name: "Custom Ring",
          price: 15600,
          currency: "USD",
          sku: "WEB-CUSTOM",
        });
        setCurrentPrice(formatCurrency(15600, "USD"));
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
          <ShineGlassButton
            theme="light"
            onClick={handleContactUs}
          >
            Contact Us
          </ShineGlassButton>
        </div>

        {/* Center - Content area */}
        <div
          className={`content ${activeTab === "Size" ? "content-size" : ""}`}
          style={{
            "--grid-columns":
              activeTab === "Size"
                ? 1
                : Math.min(getCurrentTabOptions().length || 1, 6),
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
                      left: `${((sizeValue - 1) / 9) * 100}%`,
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
                      "--progress-width": `${((sizeValue - 1) / 9) * 100}%`,
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
                key={option.componentOptionalId || option.id}
                className={`option ${
                  (selectedOption?.componentOptionalId ||
                    selectedOption?.id) ===
                  (option.componentOptionalId || option.id)
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="circle"></div>
                <div className="label bodytext-3--no-margin">
                  {option.componentOptionalName ||
                    option.name ||
                    "Unnamed Option"}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right side - Summary */}
        <div className="summary">
          <h2 className="bodytext-1--no-margin">From {currentPrice}</h2>
          <ShineGlassButton
            theme="footer"
            onClick={handleBookAppointment}
            className="book-appointment-button"
          >
            Book An Appointment
          </ShineGlassButton>
          <ShineGlassButton
            theme="light"
            onClick={handleOrderNow}
            className="order-now-button"
            disabled={isSubmittingOrder}
          >
            {isSubmittingOrder ? "Processing…" : "Order Now"}
          </ShineGlassButton>
          {orderFeedback && (
            <p className="order-feedback bodytext-6--no-margin">{orderFeedback}</p>
          )}
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
