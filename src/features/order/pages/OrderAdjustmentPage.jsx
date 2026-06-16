import { AlertTriangle, ChevronRight, Search, Calendar, Clock, Minus, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { showOrderStatusUpdated } from "../../../utils/vendorAlerts";
import { orderDetailRecords, ordersTableRows } from "../data/orderData";

const MOCK_SUGGESTIONS = [
  {
    id: "sug-1",
    name: "Lemon tea",
    serves: "Serves 10 persons",
    price: 1200,
    priceStr: "NOK 1,200",
    image: "/heroBg.webp",
  },
  {
    id: "sug-2",
    name: "Apple juice",
    serves: "Serves 10 persons",
    price: 1000,
    priceStr: "NOK 1,000",
    image: "/heroBg.webp",
  },
  {
    id: "sug-3",
    name: "Berry smoothie",
    serves: "Serves 10 persons",
    price: 1500,
    priceStr: "NOK 1,500",
    image: "/heroBg.webp",
  },
  {
    id: "sug-4",
    name: "Soft drink pack",
    serves: "Serves 12 persons",
    price: 800,
    priceStr: "NOK 800",
    image: "/heroBg.webp",
  },
];

const REASON_OPTIONS = [
  "Item unavailable",
  "Price adjustment",
  "Delivery time issue",
  "Minimum guest count issue",
  "Need item replacement",
  "Cancel Order",
  "Reject Order",
];

const CHECKBOX_ITEMS = [
  "Grilled chicken",
  "Fresh salad",
  "Bread",
  "Sauces",
  "Dessert",
];

const ORIGINAL_ITEM_PRICES = {
  "Grilled chicken": 2500, // NOK 2,500 / $250.00
  "Fresh salad": 800,     // NOK 800 / $80.00
  "Bread": 300,           // NOK 300 / $30.00
  "Sauces": 200,          // NOK 200 / $20.00
  "Dessert": 1200,        // NOK 1,200 / $120.00
};

const parseCurrencyValue = (valStr) => {
  if (!valStr) return 0;
  // Remove currency symbols/text like $, kr, NOK, and commas
  const cleaned = valStr.replace(/[$,\s]/g, "").replace(/NOK|kr/i, "").trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
};

export default function OrderAdjustmentPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Load Order Details
  const orderDetail = useMemo(() => {
    const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
    const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : orderDetailRecords;
    const cleanId = orderId.replace("#", "");

    if (!savedDetailsRaw) {
      window.localStorage.setItem("vendor-order-details", JSON.stringify(orderDetailRecords));
    }

    const detail = currentDetails[cleanId] ?? orderDetailRecords[cleanId];
    if (!detail) return null;

    const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
    const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
    const mainOrder = currentOrders.find((o) => o.id.replace("#", "") === cleanId);

    const currentStatus = mainOrder ? mainOrder.status : (detail.status || "New");

    return {
      ...detail,
      status: currentStatus,
    };
  }, [orderId]);

  const [reason, setReason] = useState("");
  const [isReasonDropdownOpen, setIsReasonDropdownOpen] = useState(false);
  const [modifiedItems, setModifiedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedList, setSuggestedList] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  
  // Form values
  const [date, setDate] = useState("2026-03-25");
  const [time, setTime] = useState("14:30");
  const [personCount, setPersonCount] = useState(orderDetail?.guests || 20);
  const [address, setAddress] = useState(orderDetail?.logistics?.deliveryAddress || "Åsane #1234, Norway");
  const [apartment, setApartment] = useState("5");
  const [city, setCity] = useState(orderDetail?.customer?.city || "Bergen");
  const [postalCode, setPostalCode] = useState(orderDetail?.customer?.postalCode || "1235");

  // Filter suggestion list based on search
  const filteredSuggestions = useMemo(() => {
    if (!searchTerm) return MOCK_SUGGESTIONS;
    return MOCK_SUGGESTIONS.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Handle suggestion horizontal scroll
  const scrollSuggestions = () => {
    const el = document.getElementById("suggestion-slider");
    if (el) {
      el.scrollBy({ left: 160, behavior: "smooth" });
    }
  };

  // Checkbox toggle
  const toggleItem = (item) => {
    setModifiedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Add suggestion
  const addSuggestion = (item) => {
    if (!suggestedList.some(s => s.id === item.id)) {
      setSuggestedList(prev => [...prev, item]);
    }
  };

  // Remove suggestion
  const removeSuggestion = (itemId) => {
    setSuggestedList(prev => prev.filter(s => s.id !== itemId));
  };

  // Prices calculation
  const isUSD = useMemo(() => {
    const rawTotal = orderDetail?.financialSummary?.find(f => f.label.toLowerCase() === "total")?.value || "NOK 4,250";
    return rawTotal.includes("$");
  }, [orderDetail]);

  const formatCurrency = (amount) => {
    if (isUSD) {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `NOK ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
  };

  const oldTotal = useMemo(() => {
    const rawTotal = orderDetail?.financialSummary?.find(f => f.label.toLowerCase() === "total")?.value || "NOK 4,250";
    const cleanNum = parseCurrencyValue(rawTotal);
    return isNaN(cleanNum) ? (isUSD ? 425.00 : 4250) : cleanNum;
  }, [orderDetail, isUSD]);

  const newTotal = useMemo(() => {
    // 1. Calculate removed cost
    const removedCost = modifiedItems.reduce((sum, item) => {
      const price = ORIGINAL_ITEM_PRICES[item] || 0;
      const displayPrice = isUSD ? price / 10 : price;
      return sum + displayPrice;
    }, 0);

    // 2. Calculate added cost
    const addedCost = suggestedList.reduce((sum, item) => {
      const price = item.price;
      const displayPrice = isUSD ? price / 10 : price;
      return sum + displayPrice;
    }, 0);

    return Math.max(0, oldTotal - removedCost + addedCost);
  }, [oldTotal, modifiedItems, suggestedList, isUSD]);

  const handleAdjustOrderSubmit = async () => {
    if (!reason) {
      alert("Please select a reason for the change.");
      return;
    }

    const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
    const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : {};
    const cleanId = orderId.replace("#", "");
    
    // We update/generate details
    const existingDetail = currentDetails[cleanId] || orderDetail || {};
    
    // Format the date nicely, e.g. "25 March 2026"
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    let formattedDate = date; // fallback
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        formattedDate = `${parsedDate.getDate()} ${months[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;
      }
    } catch (e) {
      console.error(e);
    }

    // Format time, e.g. "02:30 PM"
    let formattedTime = time;
    try {
      const [hourStr, minStr] = time.split(":");
      const hour = parseInt(hourStr, 10);
      if (!isNaN(hour)) {
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        formattedTime = `${hour12}:${minStr} ${ampm}`;
      }
    } catch (e) {
      console.error(e);
    }

    // Create the updated financialSummary array
    const originalSummary = existingDetail.financialSummary || [];
    const newSummary = [];
    
    // Copy all rows except "total" and any previous adjustments
    originalSummary.forEach(row => {
      const labelLower = row.label.toLowerCase();
      if (
        labelLower !== "total" &&
        !labelLower.includes("removed items adjustment") &&
        !labelLower.includes("added items adjustment")
      ) {
        newSummary.push(row);
      }
    });

    // Add adjustments if applicable
    if (modifiedItems.length > 0) {
      const removedAmt = modifiedItems.reduce((sum, item) => sum + (isUSD ? (ORIGINAL_ITEM_PRICES[item] || 0) / 10 : (ORIGINAL_ITEM_PRICES[item] || 0)), 0);
      newSummary.push({
        label: `Removed Items Adjustment (${modifiedItems.join(", ")})`,
        value: `-${formatCurrency(removedAmt)}`
      });
    }

    if (suggestedList.length > 0) {
      const addedAmt = suggestedList.reduce((sum, item) => sum + (isUSD ? item.price / 10 : item.price), 0);
      newSummary.push({
        label: `Added Items Adjustment (${suggestedList.map(s => s.name).join(", ")})`,
        value: `+${formatCurrency(addedAmt)}`
      });
    }

    // Add updated total
    newSummary.push({
      label: "Total",
      value: formatCurrency(newTotal)
    });

    const updatedDetail = {
      ...orderDetail,
      ...existingDetail,
      status: "Modified",
      guests: personCount,
      date: formattedDate,
      time: formattedTime,
      note: additionalDetails ? `${additionalDetails.toUpperCase()}` : (existingDetail.note || orderDetail.note),
      logistics: {
        ...(existingDetail.logistics || orderDetail.logistics || {}),
        deliveryAddress: address,
      },
      customer: {
        ...(existingDetail.customer || orderDetail.customer || {}),
        city: city,
        postalCode: postalCode,
      },
      financialSummary: newSummary,
    };

    currentDetails[cleanId] = updatedDetail;
    window.localStorage.setItem("vendor-order-details", JSON.stringify(currentDetails));

    // Also update vendor-orders summaries
    const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
    if (savedOrdersRaw) {
      const currentOrders = JSON.parse(savedOrdersRaw);
      const idx = currentOrders.findIndex((o) => o.id.replace("#", "") === cleanId);
      if (idx !== -1) {
        currentOrders[idx] = {
          ...currentOrders[idx],
          status: "Modified",
          statusTone: "is-modified",
          actions: [{ label: "Start preparing", tone: "is-primary", hasDropdown: true }],
          guests: personCount,
          date: formattedDate,
          time: formattedTime,
        };
        window.localStorage.setItem("vendor-orders", JSON.stringify(currentOrders));
      }
    }

    await showOrderStatusUpdated(`Order #${orderId} successfully adjusted.`);
    navigate(`/orders/${orderId}`);
  };

  if (!orderDetail) {
    return (
      <section className="flex flex-col gap-3">
        <Link className="text-[13px] font-bold text-[#5d7fc9] no-underline" to="/orders">
          &lt; Back to Orders
        </Link>
        <div className="rounded-xl border border-[#dfd8cf] bg-white px-2 pb-2.5 pt-2 shadow-[0_2px_8px_rgba(42,27,18,0.06)]">
          <h1 className="type-h3">Order not found</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      {/* Back Link */}
      <header className="flex flex-col gap-1">
        <Link className="text-[13px] font-bold text-[#5d7fc9] no-underline" to={`/orders/${orderId}`}>
          &lt; Back to Order Details
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="m-0 text-[32px] font-extrabold leading-none text-[#19130f]">
            Order Adjustment
          </h1>
          <p className="m-0 text-[13px] font-semibold text-[#8a7a6d]">
            Let the customer know what needs to be changed in this order.
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="rounded-[16px] border border-[#dfd8cf] bg-white p-6 shadow-[0_2px_8px_rgba(42,27,18,0.06)]">
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(280px,0.85fr)] gap-6 max-[880px]:grid-cols-1">
          
          {/* Left Column: Form Fields */}
          <div className="flex flex-col gap-5">
            {/* Warning Alert Banner */}
            <div className="flex items-start gap-3 rounded-[10px] bg-[#fff8f2] border border-[#ffe2cc] p-3 text-[13px] font-semibold text-[#d96e39] leading-[1.45]">
              <AlertTriangle size={16} strokeWidth={2.4} className="shrink-0 mt-[2px]" />
              <span>
                <strong>Important:</strong> Please call the customer and confirm the changes with them before doing adjustment in order.
              </span>
            </div>

            {/* 1. Reason for Change */}
            <div className="flex flex-col gap-1.5 relative">
              <span className="text-[16px] font-extrabold text-[#1c1510]">1. Reason for Change</span>
              <span className="text-[13px] font-bold text-[#8a7a6d]">
                Please select the main reason for requesting changes.
              </span>
              <button
                className="w-full h-10 px-3 flex items-center justify-between rounded-[8px] border border-[#d8cec4] bg-white text-[13px] font-bold text-[#2b231e] text-left cursor-pointer hover:border-[#cf6e38] transition"
                onClick={() => setIsReasonDropdownOpen(!isReasonDropdownOpen)}
                type="button"
              >
                <span>{reason || "Select reason for changes"}</span>
                <ChevronRight size={16} className={`transform transition-transform ${isReasonDropdownOpen ? "rotate-90" : ""}`} />
              </button>

              {isReasonDropdownOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-20 rounded-[8px] border border-[#d8cec4] bg-white p-1 shadow-lg max-h-[180px] overflow-y-auto">
                  {REASON_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      className="w-full text-left px-3 py-2 text-[13px] font-bold text-[#44382e] hover:bg-[#faf7f4] rounded-[6px] transition cursor-pointer"
                      onClick={() => {
                        setReason(opt);
                        setIsReasonDropdownOpen(false);
                      }}
                      type="button"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Items to Modify */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[16px] font-extrabold text-[#1c1510]">2. Items to Modify</span>
              <span className="text-[13px] font-bold text-[#8a7a6d]">
                Select the items that need to be changed (checked items are treated as removed).
              </span>
              <div className="flex flex-col gap-2 rounded-[10px] border border-[#efe6de] p-1.5 bg-[#faf9f6]">
                {CHECKBOX_ITEMS.map((item) => {
                  const isChecked = modifiedItems.includes(item);
                  return (
                    <label
                      key={item}
                      className={`flex items-center justify-between p-2.5 rounded-[8px] border ${isChecked ? "border-[#fecaca] bg-[#fff8f8]" : "border-[#f2ece6] bg-white"} hover:bg-[#faf9f6] transition cursor-pointer`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item)}
                          className="h-4 w-4 accent-[#cf6e38]"
                        />
                        <img
                          alt={item}
                          src="/heroBg.webp"
                          className="h-8 w-[48px] rounded-[4px] object-cover border border-[#efe6de]"
                        />
                        <span className={`text-[14px] font-extrabold ${isChecked ? "text-red-700 line-through" : "text-[#2b231e]"}`}>
                          {item}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-[#8a7a6d]">
                        {formatCurrency(isUSD ? (ORIGINAL_ITEM_PRICES[item] || 0) / 10 : (ORIGINAL_ITEM_PRICES[item] || 0))}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Suggestion (Optional) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[16px] font-extrabold text-[#1c1510]">3. Suggestion (Optional)</span>
              <span className="text-[13px] font-bold text-[#8a7a6d]">
                Suggest alternative items that could better fit the customer's needs.
              </span>
              
              {/* Search Box */}
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-[#8a7a6d]" />
                <input
                  type="text"
                  placeholder="Search items to suggest..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[#d8cec4] bg-white text-[13px] font-semibold text-[#1c1510] placeholder-[#a49a90] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>

              {/* Suggestions Cards Slider */}
              <div className="relative mt-1">
                <div
                  id="suggestion-slider"
                  className="flex gap-2.5 overflow-x-auto pr-8 hide-scrollbar scroll-smooth pb-1"
                >
                  {filteredSuggestions.map((item) => (
                    <div
                      key={item.id}
                      className="w-[180px] shrink-0 p-3 rounded-[12px] border border-[#efe6de] bg-white flex flex-col gap-2 shadow-sm hover:shadow-md hover:border-[#cf6e38] transition duration-200"
                    >
                      <img
                        alt={item.name}
                        src={item.image}
                        className="h-24 w-full rounded-[8px] object-cover"
                      />
                      <div className="flex flex-col gap-0.5">
                        <strong className="text-[14px] font-extrabold text-[#1c1510]">{item.name}</strong>
                        <span className="text-[12px] font-semibold text-[#8a7a6d]">{item.serves}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className="text-[13px] font-extrabold text-[#cf6e38]">
                          {formatCurrency(isUSD ? item.price / 10 : item.price)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addSuggestion(item)}
                        className="w-full h-8 mt-1 rounded-[6px] bg-[#fff2ec] border border-[#ffe2cc] text-[13px] font-bold text-[#d96e39] cursor-pointer hover:bg-[#d96e39] hover:text-white hover:border-[#d96e39] transition active:scale-95 flex items-center justify-center"
                      >
                        + Add Item
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={scrollSuggestions}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#efe6de] text-[#7a6d63] shadow-md cursor-pointer hover:bg-[#faf7f4] transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Adjusted Items section */}
            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-extrabold text-[#1c1510]">Adjusted Items</span>
              {modifiedItems.length === 0 && suggestedList.length === 0 ? (
                <div className="text-[13px] font-medium text-[#8a7a6d] italic p-4 rounded-[12px] border border-dashed border-[#d8cec4] bg-[#faf9f6] text-center">
                  No items modified or added yet. Check items above or search suggestions to make adjustments.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
                  {/* Show Checked/Removed Items */}
                  {modifiedItems.map((item) => {
                    const priceVal = ORIGINAL_ITEM_PRICES[item] || 0;
                    const displayPrice = isUSD ? priceVal / 10 : priceVal;
                    return (
                      <div
                        key={`removed-${item}`}
                        className="flex items-center gap-3 p-3 rounded-[12px] border border-red-200 bg-[#fff5f5] hover:border-red-300 transition"
                      >
                        <div className="h-10 w-12 rounded-[6px] bg-red-100 flex items-center justify-center text-red-500 font-extrabold text-[12px] shrink-0 border border-red-200 uppercase tracking-wider">
                          Rem
                        </div>
                        <div className="flex flex-col leading-[1.3] flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-extrabold text-[#1c1510] line-through">{item}</span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 text-red-700 uppercase tracking-wider">
                              Removed
                            </span>
                          </div>
                          <span className="text-[13px] font-extrabold text-red-600">
                            -{formatCurrency(displayPrice)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleItem(item)} // unchecking restores the item
                          className="h-8 px-3 rounded-[6px] bg-white border border-red-300 text-[13px] font-extrabold text-red-700 cursor-pointer hover:bg-red-50 hover:border-red-400 transition active:scale-95"
                        >
                          Restore
                        </button>
                      </div>
                    );
                  })}

                  {/* Show Added Suggested Items */}
                  {suggestedList.map((item) => {
                    const displayPrice = isUSD ? item.price / 10 : item.price;
                    return (
                      <div
                        key={`added-${item.id}`}
                        className="flex items-center gap-3 p-3 rounded-[12px] border border-green-200 bg-[#f5fff5] hover:border-green-300 transition"
                      >
                        <img
                          alt={item.name}
                          src={item.image}
                          className="h-10 w-12 rounded-[6px] object-cover border border-green-200 shrink-0"
                        />
                        <div className="flex flex-col leading-[1.3] flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-extrabold text-[#1c1510]">{item.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-green-100 text-green-700 uppercase tracking-wider">
                              Added
                            </span>
                          </div>
                          <span className="text-[13px] font-extrabold text-green-600">
                            +{formatCurrency(displayPrice)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSuggestion(item.id)}
                          className="h-8 px-3 rounded-[6px] bg-white border border-green-300 text-[13px] font-extrabold text-green-700 cursor-pointer hover:bg-green-50 hover:border-green-400 transition active:scale-95"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[16px] font-extrabold text-[#1c1510]">Additional Details</span>
              <textarea
                placeholder="Please explain the changes you would like to make..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full min-h-[90px] p-3 rounded-[8px] border border-[#d8cec4] text-[13px] font-semibold text-[#1c1510] placeholder-[#a49a90] focus:border-[#cf6e38] focus:outline-none transition resize-y"
              />
            </div>

            {/* Form Fields: Date & Time Grid */}
            <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-extrabold text-[#1c1510]">Date</span>
                <div className="relative flex items-center">
                  <Calendar size={14} className="absolute left-3 text-[#8a7a6d]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[#d8cec4] text-[13px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-extrabold text-[#1c1510]">Time</span>
                <div className="relative flex items-center">
                  <Clock size={14} className="absolute left-3 text-[#8a7a6d]" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[#d8cec4] text-[13px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Counter: Person Count */}
            <div className="flex flex-col gap-1.5 max-w-[200px]">
              <span className="text-[13px] font-extrabold text-[#1c1510]">Person Count</span>
              <div className="flex items-center justify-between h-10 border border-[#d8cec4] rounded-[8px] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPersonCount(prev => Math.max(1, prev - 1))}
                  className="w-10 h-full flex items-center justify-center text-[#7a6d63] hover:bg-[#faf7f4] cursor-pointer transition"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="text-[14px] font-extrabold text-[#1c1510]">{personCount}</span>
                <button
                  type="button"
                  onClick={() => setPersonCount(prev => prev + 1)}
                  className="w-10 h-full flex items-center justify-center text-[#7a6d63] hover:bg-[#faf7f4] cursor-pointer transition"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-extrabold text-[#1c1510]">Address</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[13px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-extrabold text-[#1c1510]">Apartment/Floor (Optional)</span>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[13px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>
            </div>

            {/* City & Postal Code */}
            <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-extrabold text-[#1c1510]">City</span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[13px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-extrabold text-[#1c1510]">Postal Code</span>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[13px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary Panel */}
          <div className="flex flex-col">
            <div className="sticky top-[10px] rounded-[12px] bg-[#fff6ed] border border-[#f5ede4] p-4.5 flex flex-col gap-4 shadow-sm">
              <strong className="text-[16px] font-extrabold text-[#1c1510]">Order Summary</strong>
              
              <div className="border-t border-[#f2ece6] pt-3 flex flex-col gap-3 text-[13px]">
                <div className="flex items-start justify-between">
                  <span className="text-[#8a7a6d] font-bold">Order ID</span>
                  <span className="text-[#1c1510] font-extrabold text-right">#{orderDetail?.id || "ORD-12549"}</span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-[#8a7a6d] font-bold">Customer</span>
                  <span className="text-[#1c1510] font-extrabold text-right">
                    {orderDetail?.customer?.name || orderDetail?.customer || "John Doe"}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-[#8a7a6d] font-bold">Order Date</span>
                  <span className="text-[#1c1510] font-extrabold text-right">
                    {orderDetail?.date || "15 May, 2026"} - {orderDetail?.time || "10:30 AM"}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-[#8a7a6d] font-bold">Persons</span>
                  <span className="text-[#1c1510] font-extrabold text-right">{personCount}</span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="text-[#8a7a6d] font-bold">Delivery Address</span>
                  <span className="text-[#1c1510] font-extrabold text-right max-w-[150px] leading-[1.3] truncate">
                    {address}
                  </span>
                </div>

                {/* Subtotals & Fees */}
                {orderDetail?.financialSummary?.map((item) => {
                  if (item.label.toLowerCase() === "total" || item.label.toLowerCase().includes("adjustment")) return null;
                  return (
                    <div key={item.label} className="flex items-start justify-between">
                      <span className="text-[#8a7a6d] font-bold">{item.label}</span>
                      <span className="text-[#1c1510] font-extrabold text-right">{item.value}</span>
                    </div>
                  );
                })}

                {/* Removed Items Adjustment Row */}
                {modifiedItems.length > 0 && (
                  <div className="flex items-start justify-between text-red-600 font-bold">
                    <span>Removed Items Offset</span>
                    <span className="text-right">
                      -{formatCurrency(modifiedItems.reduce((sum, item) => sum + (isUSD ? (ORIGINAL_ITEM_PRICES[item] || 0) / 10 : (ORIGINAL_ITEM_PRICES[item] || 0)), 0))}
                    </span>
                  </div>
                )}

                {/* Added Items Adjustment Row */}
                {suggestedList.length > 0 && (
                  <div className="flex items-start justify-between text-green-600 font-bold">
                    <span>Added Items Offset</span>
                    <span className="text-right">
                      +{formatCurrency(suggestedList.reduce((sum, item) => sum + (isUSD ? item.price / 10 : item.price), 0))}
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between border-t border-[#f2ece6] pt-3">
                  <span className="text-[#8a7a6d] font-bold">Old Total Amount</span>
                  <span className="text-[#1c1510] font-extrabold text-right">
                    {formatCurrency(oldTotal)}
                  </span>
                </div>

                <div className="flex items-start justify-between border-t border-[#f2ece6] pt-3">
                  <span className="text-[#8a7a6d] font-bold">Updated Total Amount</span>
                  <span className="text-[#d96e39] font-black text-right text-[16px]">
                    {formatCurrency(newTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons at the Bottom */}
        <div className="mt-6 border-t border-[#efe6de] pt-4 flex justify-end gap-3.5">
          <Link
            to={`/orders/${orderId}`}
            className="h-10 inline-flex items-center justify-center cursor-pointer rounded-[8px] bg-white border border-[#d8cec4] px-6 text-[13px] font-extrabold text-[#2b231e] no-underline hover:bg-[#faf7f4] active:scale-95 transition"
          >
            Cancel
          </Link>
          <button
            className="h-10 cursor-pointer rounded-[8px] bg-[#d96e39] px-6 text-[13px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] hover:bg-[#cf6e38] active:scale-95 transition"
            onClick={handleAdjustOrderSubmit}
            type="button"
          >
            Adjust Order
          </button>
        </div>
      </div>
    </section>
  );
}
