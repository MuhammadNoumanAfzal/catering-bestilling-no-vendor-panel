import { AlertTriangle, ChevronRight, X, Search, Calendar, Clock, Minus, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { showOrderStatusUpdated } from "../../../utils/vendorAlerts";

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

export default function OrderAdjustmentModal({ orderDetail, onClose, onSave }) {
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
  const oldTotal = useMemo(() => {
    const rawTotal = orderDetail?.financialSummary?.find(f => f.label.toLowerCase() === "total")?.value || "NOK 4,250";
    // Convert to number if possible, or default to 4250
    const cleanNum = parseInt(rawTotal.replace(/[^0-9]/g, ""), 10);
    return isNaN(cleanNum) ? 4250 : cleanNum;
  }, [orderDetail]);

  const newTotal = useMemo(() => {
    const suggestionsCost = suggestedList.reduce((sum, item) => sum + item.price, 0);
    return oldTotal + suggestionsCost;
  }, [oldTotal, suggestedList]);

  const handleAdjustOrderSubmit = async () => {
    if (!reason) {
      alert("Please select a reason for the change.");
      return;
    }

    // Save logic
    const adjustmentDetails = {
      reason,
      modifiedItems,
      suggestedList,
      additionalDetails,
      date,
      time,
      personCount,
      address,
      apartment,
      city,
      postalCode,
      newTotal,
    };

    if (onSave) {
      onSave(adjustmentDetails);
    } else {
      await showOrderStatusUpdated(`Order ${orderDetail.id} successfully adjusted.`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-[2px]">
      <div className="relative w-full max-w-[1020px] rounded-[16px] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)] my-auto max-h-[calc(100vh-32px)] flex flex-col">
        {/* Close Button */}
        <button
          className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#efe6de] bg-white text-[#7a6d63] hover:bg-[#faf7f4] hover:text-[#181310] transition"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#efe6de] pb-4 mb-4">
          <h2 className="type-h2 m-0 font-extrabold text-[#1c1510]">Order Adjustment</h2>
          <p className="m-0 text-[12px] font-semibold text-[#8a7a6d]">
            Let the customer know what needs to be changed in this order.
          </p>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-[minmax(0,1.5fr)_minmax(280px,0.85fr)] gap-6 max-[880px]:grid-cols-1 hide-scrollbar">
          
          {/* Left Column: Form Fields */}
          <div className="flex flex-col gap-5">
            {/* Warning Alert Banner */}
            <div className="flex items-start gap-3 rounded-[10px] bg-[#fff8f2] border border-[#ffe2cc] p-3 text-[12px] font-semibold text-[#d96e39] leading-[1.45]">
              <AlertTriangle size={16} strokeWidth={2.4} className="shrink-0 mt-[2px]" />
              <span>
                <strong>Important:</strong> Please call the customer and confirm the changes with them before doing adjustment in order.
              </span>
            </div>

            {/* 1. Reason for Change */}
            <div className="flex flex-col gap-1.5 relative">
              <span className="text-[14px] font-extrabold text-[#1c1510]">1. Reason for Change</span>
              <span className="text-[11px] font-bold text-[#8a7a6d]">
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
                      className="w-full text-left px-3 py-2 text-[12px] font-bold text-[#44382e] hover:bg-[#faf7f4] rounded-[6px] transition cursor-pointer"
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
              <span className="text-[14px] font-extrabold text-[#1c1510]">2. Items to Modify</span>
              <span className="text-[11px] font-bold text-[#8a7a6d]">
                Select the items that need to be changed.
              </span>
              <div className="flex flex-col gap-2 rounded-[10px] border border-[#efe6de] p-1.5 bg-[#faf9f6]">
                {CHECKBOX_ITEMS.map((item) => {
                  const isChecked = modifiedItems.includes(item);
                  return (
                    <label
                      key={item}
                      className="flex items-center justify-between p-2.5 rounded-[8px] border border-[#f2ece6] bg-white hover:bg-[#faf9f6] transition cursor-pointer"
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
                        <span className="text-[12px] font-extrabold text-[#2b231e]">{item}</span>
                      </div>
                      <ChevronRight size={14} className="text-[#a49a90]" />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Suggestion (Optional) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[14px] font-extrabold text-[#1c1510]">3. Suggestion (Optional)</span>
              <span className="text-[11px] font-bold text-[#8a7a6d]">
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
                  className="w-full h-9 pl-9 pr-3 rounded-[8px] border border-[#d8cec4] bg-white text-[12px] font-semibold text-[#1c1510] placeholder-[#a49a90] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>

              {/* Suggestions Cards Slider */}
              <div className="relative mt-1">
                <div
                  id="suggestion-slider"
                  className="flex gap-2.5 overflow-x-auto pr-8 hide-scrollbar scroll-smooth"
                >
                  {filteredSuggestions.map((item) => (
                    <div
                      key={item.id}
                      className="w-[160px] shrink-0 p-2 rounded-[8px] border border-[#efe6de] bg-white flex flex-col gap-1.5"
                    >
                      <img
                        alt={item.name}
                        src={item.image}
                        className="h-20 w-full rounded-[6px] object-cover"
                      />
                      <div className="flex flex-col leading-[1.2]">
                        <strong className="text-[11px] font-extrabold text-[#1c1510]">{item.name}</strong>
                        <span className="text-[9px] font-bold text-[#8a7a6d]">{item.serves}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-auto">
                        <span className="text-[10px] font-extrabold text-[#cf6e38]">{item.priceStr}</span>
                        <button
                          type="button"
                          onClick={() => addSuggestion(item)}
                          className="h-5 px-2.5 rounded-[4px] bg-[#fff2ec] border border-[#ffe2cc] text-[9.5px] font-extrabold text-[#d96e39] cursor-pointer hover:bg-[#d96e39] hover:text-white transition active:scale-95"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={scrollSuggestions}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-[#efe6de] text-[#7a6d63] shadow-md cursor-pointer hover:bg-[#faf7f4] transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Adjusted Items section (Only renders if suggest list not empty) */}
            {suggestedList.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-extrabold text-[#1c1510]">Adjusted Items</span>
                <div className="flex flex-wrap gap-2">
                  {suggestedList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-[8px] border border-[#efe6de] bg-white w-[190px]"
                    >
                      <img
                        alt={item.name}
                        src={item.image}
                        className="h-10 w-12 rounded-[4px] object-cover"
                      />
                      <div className="flex flex-col leading-[1.2] flex-1">
                        <span className="text-[10px] font-extrabold text-[#1c1510]">{item.name}</span>
                        <span className="text-[10px] font-extrabold text-[#cf6e38]">{item.priceStr}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSuggestion(item.id)}
                        className="h-5 px-2 rounded-[4px] bg-[#ffebeb] border border-[#ffd1d1] text-[9.5px] font-extrabold text-[#dc1010] cursor-pointer hover:bg-[#dc1010] hover:text-white transition active:scale-95"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[14px] font-extrabold text-[#1c1510]">Additional Details</span>
              <textarea
                placeholder="Please explain the changes you would like to make..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full min-h-[90px] p-3 rounded-[8px] border border-[#d8cec4] text-[12px] font-semibold text-[#1c1510] placeholder-[#a49a90] focus:border-[#cf6e38] focus:outline-none transition resize-y"
              />
            </div>

            {/* Form Fields: Date & Time Grid */}
            <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#1c1510]">Date</span>
                <div className="relative flex items-center">
                  <Calendar size={14} className="absolute left-3 text-[#8a7a6d]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[#d8cec4] text-[12px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#1c1510]">Time</span>
                <div className="relative flex items-center">
                  <Clock size={14} className="absolute left-3 text-[#8a7a6d]" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-[8px] border border-[#d8cec4] text-[12px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Counter: Person Count */}
            <div className="flex flex-col gap-1.5 max-w-[200px]">
              <span className="text-[12px] font-extrabold text-[#1c1510]">Person Count</span>
              <div className="flex items-center justify-between h-10 border border-[#d8cec4] rounded-[8px] bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPersonCount(prev => Math.max(1, prev - 1))}
                  className="w-10 h-full flex items-center justify-center text-[#7a6d63] hover:bg-[#faf7f4] cursor-pointer transition"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="text-[13px] font-extrabold text-[#1c1510]">{personCount}</span>
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
                <span className="text-[12px] font-extrabold text-[#1c1510]">Address</span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[12px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#1c1510]">Apartment/Floor (Optional)</span>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[12px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>
            </div>

            {/* City & Postal Code */}
            <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#1c1510]">City</span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[12px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-extrabold text-[#1c1510]">Postal Code</span>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[12px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary Panel */}
          <div className="flex flex-col">
            <div className="sticky top-0 rounded-[12px] bg-[#fff6ed] border border-[#f5ede4] p-4.5 flex flex-col gap-4">
              <strong className="text-[15px] font-extrabold text-[#1c1510]">Order Summary</strong>
              
              <div className="border-t border-[#f2ece6] pt-3 flex flex-col gap-3 text-[11px] sm:text-[12px]">
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

                <div className="flex items-start justify-between border-t border-[#f2ece6] pt-3">
                  <span className="text-[#8a7a6d] font-bold">Old Total Amount</span>
                  <span className="text-[#1c1510] font-extrabold text-right">
                    NOK {oldTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-start justify-between border-t border-[#f2ece6] pt-3">
                  <span className="text-[#8a7a6d] font-bold">Updated Total Amount</span>
                  <span className="text-[#d96e39] font-black text-right text-[14px]">
                    NOK {newTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="mt-4 border-t border-[#efe6de] pt-4 flex justify-end gap-3.5">
          <button
            className="h-10 cursor-pointer rounded-[8px] bg-white border border-[#d8cec4] px-6 text-[12px] font-extrabold text-[#2b231e] hover:bg-[#faf7f4] active:scale-95 transition"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 cursor-pointer rounded-[8px] bg-[#d96e39] px-6 text-[12px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] hover:bg-[#cf6e38] active:scale-95 transition"
            onClick={handleAdjustOrderSubmit}
            type="button"
          >
            Adjust Order
          </button>
        </div>

      </div>
    </div>
  );
}
