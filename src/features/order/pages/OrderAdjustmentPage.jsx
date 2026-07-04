import { AlertTriangle, ChevronRight, Search, Calendar, Clock, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { showOrderStatusUpdated, showVendorErrorAlert } from "../../../utils/vendorAlerts";
import {
  createVendorOrderAdjustment,
  getVendorOrderDetail,
  searchVendorAdjustmentItems,
} from "../api/orderApi";
import { mapVendorOrderDetail } from "../api/orderMappers";

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
  "Grilled chicken": 2500, // kr 2,500 / kr 250.00
  "Fresh salad": 800,     // kr 800 / kr 80.00
  "Bread": 300,           // kr 300 / kr 30.00
  "Sauces": 200,          // kr 200 / kr 20.00
  "Dessert": 1200,        // kr 1,200 / kr 120.00
};

const parseCurrencyValue = (valStr) => {
  if (!valStr) return 0;
  // Remove currency symbols/text like $, kr, NOK, and commas
  const cleaned = valStr.replace(/[$,\s]/g, "").replace(/NOK|kr/i, "").trim();
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
};

const REASON_ENUM_MAP = {
  "Item unavailable": "ITEM_UNAVAILABLE",
  "Price adjustment": "OTHER",
  "Delivery time issue": "DELIVERY_TIME_CONFLICT",
  "Minimum guest count issue": "OTHER",
  "Need item replacement": "OTHER",
  "Cancel Order": "OTHER",
  "Reject Order": "OTHER",
};

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `adj-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mapErrorsByField(errors) {
  if (!Array.isArray(errors)) {
    return {};
  }

  return errors.reduce((accumulator, error) => {
    if (error?.field && error?.message && !accumulator[error.field]) {
      accumulator[error.field] = error.message;
    }

    return accumulator;
  }, {});
}

export default function OrderAdjustmentPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const decodedOrderId = useMemo(() => decodeURIComponent(orderId || ""), [orderId]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [reason, setReason] = useState("");
  const [isReasonDropdownOpen, setIsReasonDropdownOpen] = useState(false);
  const [modifiedItems, setModifiedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedList, setSuggestedList] = useState([]);
  const [availableSuggestions, setAvailableSuggestions] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  
  // Form values
  const [date, setDate] = useState("2026-03-25");
  const [time, setTime] = useState("14:30");
  const [personCount, setPersonCount] = useState(20);
  const [address, setAddress] = useState("Åsane #1234, Norway");
  const [apartment, setApartment] = useState("5");
  const [city, setCity] = useState("Bergen");
  const [postalCode, setPostalCode] = useState("1235");

  useEffect(() => {
    let isCancelled = false;

    async function loadOrderDetail() {
      setIsLoading(true);

      try {
        const result = await getVendorOrderDetail(decodedOrderId);
        if (isCancelled) {
          return;
        }

        const mappedOrder = mapVendorOrderDetail(result, decodedOrderId);
        setOrderDetail(mappedOrder);
        setPersonCount(mappedOrder?.guests || 20);
        setAddress(mappedOrder?.logistics?.deliveryAddress || "Asane #1234, Norway");
        setCity(mappedOrder?.customer?.city || "Bergen");
        setPostalCode(mappedOrder?.customer?.postalCode || "1235");
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error instanceof Error ? error.message : "Unable to load the order details.",
          );
          setOrderDetail(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    if (decodedOrderId) {
      loadOrderDetail();
    }

    return () => {
      isCancelled = true;
    };
  }, [decodedOrderId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadSuggestions() {
      const query = searchTerm.trim();

      if (!query) {
        setAvailableSuggestions([]);
        return;
      }

      setIsSuggestionLoading(true);

      try {
        const items = await searchVendorAdjustmentItems({ search: query, first: 10 });
        if (!isCancelled) {
          setAvailableSuggestions(items);
        }
      } catch (error) {
        if (!isCancelled) {
          setAvailableSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSuggestionLoading(false);
        }
      }
    }

    const timeoutId = setTimeout(loadSuggestions, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
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
    const rawTotal = orderDetail?.financialSummary?.find(f => f.label.toLowerCase() === "total")?.value || "kr 4,250";
    return rawTotal.includes("$") || rawTotal.includes("kr");
  }, [orderDetail]);

  const formatCurrency = (amount) => {
    return `kr ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const oldTotal = useMemo(() => {
    const rawTotal = orderDetail?.financialSummary?.find(f => f.label.toLowerCase() === "total")?.value || "kr 4,250";
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
      setFormErrors({ reason: "Please select a reason for the change." });
      return;
    }

    setFormErrors({});
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const removedItems = (orderDetail?.raw?.orderCarts || [])
        .filter((cart) => modifiedItems.includes(cart?.item?.title))
        .map((cart) => cart?.item?.id)
        .filter(Boolean);

      const addedItems = suggestedList
        .map((item) => item.backendId || null)
        .filter(Boolean);

      const vendorNote = [
        additionalDetails.trim(),
        suggestedList.length ? `Suggested additions: ${suggestedList.map((item) => item.name).join(", ")}` : "",
        modifiedItems.length ? `Requested removals: ${modifiedItems.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const payload = await createVendorOrderAdjustment({
        orderId: decodedOrderId,
        reason: REASON_ENUM_MAP[reason] || "OTHER",
        vendorNote,
        proposedEventDate: date || null,
        proposedDeliveryWindowStart: time ? `${time}:00` : null,
        proposedDeliveryWindowEnd: null,
        proposedGuestCount: personCount,
        proposedAddressLine1: address || null,
        proposedAddressLine2: apartment || null,
        proposedCity: city || null,
        proposedPostalCode: postalCode || null,
        removedItems,
        addedItems,
        ...(orderDetail?.version ? { version: orderDetail.version } : {}),
        idempotencyKey: createIdempotencyKey(),
      });

      if (!payload?.success) {
        setFormErrors(mapErrorsByField(payload?.errors));
        setSubmitError(payload?.message || "Unable to submit the order adjustment.");
        return;
      }

      await showOrderStatusUpdated(`Order ${orderDetail?.id || decodedOrderId} adjustment submitted successfully.`);
      navigate(`/orders/${encodeURIComponent(decodedOrderId)}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit the order adjustment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="flex min-h-[360px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#cf6e38] border-t-transparent" />
      </section>
    );
  }

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
        <Link
          className="text-[13px] font-bold text-[#5d7fc9] no-underline"
          to={`/orders/${encodeURIComponent(decodedOrderId)}`}
        >
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

            {submitError ? (
              <div className="rounded-[10px] border border-[#ffd0cc] bg-[#fff2f1] px-3 py-3 text-[13px] font-semibold text-[#b42318]">
                {submitError}
              </div>
            ) : null}

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
              {formErrors.reason ? (
                <span className="text-[12px] font-bold text-[#b42318]">{formErrors.reason}</span>
              ) : null}
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
                  {availableSuggestions.map((item) => (
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
                {isSuggestionLoading ? (
                  <div className="mt-2 text-[12px] font-semibold text-[#8a7a6d]">Loading suggestions...</div>
                ) : null}
                {!isSuggestionLoading && searchTerm.trim() && availableSuggestions.length === 0 ? (
                  <div className="mt-2 text-[12px] font-semibold text-[#8a7a6d]">No matching items found.</div>
                ) : null}
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
                {formErrors.proposedEventDate ? (
                  <span className="text-[12px] font-bold text-[#b42318]">{formErrors.proposedEventDate}</span>
                ) : null}
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
                {formErrors.proposedDeliveryWindowStart ? (
                  <span className="text-[12px] font-bold text-[#b42318]">{formErrors.proposedDeliveryWindowStart}</span>
                ) : null}
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
              {formErrors.proposedGuestCount ? (
                <span className="text-[12px] font-bold text-[#b42318]">{formErrors.proposedGuestCount}</span>
              ) : null}
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
                {formErrors.proposedAddressLine1 ? (
                  <span className="text-[12px] font-bold text-[#b42318]">{formErrors.proposedAddressLine1}</span>
                ) : null}
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
                {formErrors.proposedCity ? (
                  <span className="text-[12px] font-bold text-[#b42318]">{formErrors.proposedCity}</span>
                ) : null}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-extrabold text-[#1c1510]">Postal Code</span>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#d8cec4] text-[13px] font-bold text-[#1c1510] focus:border-[#cf6e38] focus:outline-none transition"
                />
                {formErrors.proposedPostalCode ? (
                  <span className="text-[12px] font-bold text-[#b42318]">{formErrors.proposedPostalCode}</span>
                ) : null}
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
                    {orderDetail?.date || "15 May, 2026"} - {orderDetail?.time || "10:30"}
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
            className="h-10 cursor-pointer rounded-[8px] bg-[#d96e39] px-6 text-[13px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] hover:bg-[#cf6e38] active:scale-95 transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={handleAdjustOrderSubmit}
            type="button"
          >
            {isSubmitting ? "Submitting..." : "Adjust Order"}
          </button>
        </div>
      </div>
    </section>
  );
}
