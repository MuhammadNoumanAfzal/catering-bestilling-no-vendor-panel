import { AlertTriangle, ChevronRight, Minus, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { showOrderStatusUpdated, showVendorErrorAlert } from "../../../utils/vendorAlerts";
import {
  createVendorOrderAdjustment,
  getVendorOrderDetail,
  searchVendorAdjustmentItems,
} from "../api/orderApi";
import { mapVendorOrderDetail, normalizeBackendStatus } from "../api/orderMappers";
import { savePendingAdjustment } from "../utils/pendingAdjustments";

const REASON_OPTIONS = [
  "Item unavailable",
  "Need item replacement",
];

const REASON_ENUM_MAP = {
  "Item unavailable": "ITEM_UNAVAILABLE",
  "Need item replacement": "OTHER",
};

function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `adj-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function extractDatabaseId(id) {
  if (!id) return null;
  const strId = String(id).trim();

  try {
    let base64 = strId;
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const decoded = atob(base64);
    if (decoded.includes(":")) {
      const parts = decoded.split(":");
      return parts[parts.length - 1];
    }
  } catch {
    // Ignore error and return original id
  }

  return strId;
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

function parseCurrencyValue(value) {
  if (typeof value === "number") {
    return value;
  }

  const cleaned = String(value || "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(amount) {
  return `kr ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeString(value) {
  return value == null ? "" : String(value);
}

function canAdjustOrder(status) {
  const normalizedStatus = normalizeBackendStatus(status);
  return normalizedStatus !== "Delivered" && normalizedStatus !== "Canceled";
}

function hasOpenAdjustmentRequest(adjustment) {
  const normalizedStatus = `${adjustment?.status ?? ""}`.trim().toUpperCase();
  if (!normalizedStatus) {
    return false;
  }

  return !["APPROVED", "REJECTED", "DECLINED", "CANCELED", "CANCELLED", "DELIVERED"].includes(
    normalizedStatus,
  );
}

function buildRemovableItems(orderDetail) {
  const orderItems = Array.isArray(orderDetail?.raw?.items) ? orderDetail.raw.items : [];
  const carts = Array.isArray(orderDetail?.raw?.orderCarts) ? orderDetail.raw.orderCarts : [];

  if (orderItems.length > 0) {
    return orderItems.map((item, index) => {
      const product = item?.product || {};
      const selectedAddons = Array.isArray(item?.selectedAddons) ? item.selectedAddons : [];
      const addonsLabel = selectedAddons
        .map((addon) => addon?.name || addon?.title || "")
        .filter(Boolean)
        .join(", ");

      return {
        id: item?.id || product?.id || `order-item-${index}`,
        itemId: item?.id || null,
        productId: item?.productId || product?.id || null,
        name: item?.productName || product?.name || item?.name || "Order item",
        quantity: Number(item?.quantity ?? 0) || 0,
        totalPrice: parseCurrencyValue(item?.lineTotal ?? item?.lineSubtotal ?? item?.unitPrice),
        image: product?.coverImage?.fileUrl || "",
        description: product?.description || item?.description || addonsLabel,
        menuItems: Array.isArray(product?.menuItems) ? product.menuItems : [],
      };
    });
  }

  return carts.map((cart, index) => {
    const item = cart?.item || {};

    return {
      id: cart?.id || item?.id || `cart-${index}`,
      itemId: cart?.id || item?.id || null,
      productId: item?.id || null,
      name: item?.title || item?.name || "Order item",
      quantity: Number(cart?.quantity ?? 0) || 0,
      totalPrice: parseCurrencyValue(cart?.totalPriceWithTax ?? cart?.priceWithTax),
      image: item?.coverImage?.fileUrl || "",
      description: item?.description || "",
      menuItems: Array.isArray(item?.menuItems) ? item.menuItems : [],
    };
  });
}

export default function OrderAdjustmentPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const decodedOrderId = useMemo(() => decodeURIComponent(orderId || ""), [orderId]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [reason, setReason] = useState("");
  const [isReasonDropdownOpen, setIsReasonDropdownOpen] = useState(false);
  const [modifiedItemIds, setModifiedItemIds] = useState([]);
  const [modifiedItemQuantities, setModifiedItemQuantities] = useState({});
  const [requestedMenuItemChanges, setRequestedMenuItemChanges] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestedList, setSuggestedList] = useState([]);
  const [availableSuggestions, setAvailableSuggestions] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);

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
        if (!canAdjustOrder(mappedOrder?.status)) {
          await showVendorErrorAlert(
            "Order adjustment is only available before an order is delivered or canceled.",
            "Adjustment unavailable",
          );
          navigate(`/orders/${encodeURIComponent(decodedOrderId)}`);
          return;
        }

        const hasPendingCustomerModification =
          `${mappedOrder?.raw?.pendingModificationRequest?.status ?? ""}`.trim().toUpperCase() === "PENDING";
        const existingAdjustment = Array.isArray(mappedOrder?.adjustments)
          ? mappedOrder.adjustments[0]
          : null;

        if (hasPendingCustomerModification || hasOpenAdjustmentRequest(existingAdjustment)) {
          await showVendorErrorAlert(
            hasPendingCustomerModification
              ? "A customer modification request is already pending for this order. Please resolve it from the order details page first."
              : "A vendor adjustment is already pending for this order. Please wait for the customer to respond from the order details page.",
            "Adjustment unavailable",
          );
          navigate(`/orders/${encodeURIComponent(decodedOrderId)}`);
          return;
        }

        setOrderDetail(mappedOrder);
        setModifiedItemIds([]);
        setSuggestedList([]);
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
      } catch {
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

  const removableItems = useMemo(() => buildRemovableItems(orderDetail), [orderDetail]);

  const modifiedItems = useMemo(
    () =>
      removableItems
        .filter((item) => modifiedItemIds.includes(item.id))
        .map((item) => ({
          ...item,
          adjustmentQuantity: Math.min(
            item.quantity,
            Math.max(1, Number(modifiedItemQuantities[item.id] || item.quantity)),
          ),
        })),
    [modifiedItemIds, modifiedItemQuantities, removableItems],
  );

  const oldTotal = useMemo(() => {
    const totalLine = orderDetail?.financialSummary?.find(
      (item) => normalizeString(item.label).toLowerCase() === "total",
    );

    return parseCurrencyValue(totalLine?.value);
  }, [orderDetail]);

  const removedCost = useMemo(
    () =>
      modifiedItems.reduce(
        (sum, item) => sum + item.totalPrice * (item.adjustmentQuantity / Math.max(1, item.quantity)),
        0,
      ),
    [modifiedItems],
  );

  const addedCost = useMemo(
    () => suggestedList.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [suggestedList],
  );

  const newTotal = useMemo(
    () => Math.max(0, oldTotal - removedCost + addedCost),
    [addedCost, oldTotal, removedCost],
  );

  const hasPricingChanges = useMemo(
    () =>
      modifiedItemIds.length > 0 ||
      suggestedList.length > 0,
    [modifiedItemIds.length, suggestedList.length],
  );

  const effectiveNewTotal = hasPricingChanges ? newTotal : oldTotal;

  const hasFormChanges = useMemo(() => {
    return (
      Boolean(reason) ||
      modifiedItemIds.length > 0 ||
      Object.keys(requestedMenuItemChanges).length > 0 ||
      suggestedList.length > 0 ||
      Boolean(normalizeString(additionalDetails).trim())
    );
  }, [
    additionalDetails,
    modifiedItemIds.length,
    requestedMenuItemChanges,
    reason,
    suggestedList.length,
  ]);

  function toggleItem(itemId) {
    setModifiedItemIds((currentIds) =>
      currentIds.includes(itemId) ? currentIds.filter((currentId) => currentId !== itemId) : [...currentIds, itemId],
    );
    const item = removableItems.find((currentItem) => currentItem.id === itemId);
    if (item) {
      setModifiedItemQuantities((current) => ({ ...current, [itemId]: current[itemId] || item.quantity }));
    }
  }

  function updateModifiedQuantity(itemId, change) {
    const item = removableItems.find((currentItem) => currentItem.id === itemId);
    if (!item) return;
    setModifiedItemQuantities((current) => ({
      ...current,
      [itemId]: Math.min(item.quantity, Math.max(1, Number(current[itemId] || item.quantity) + change)),
    }));
  }

  function toggleMenuItemChange(orderItem, menuItem) {
    const key = `${orderItem.id}:${menuItem.id || menuItem.title || menuItem.name}`;

    setRequestedMenuItemChanges((current) => {
      if (current[key]) {
        const remaining = { ...current };
        delete remaining[key];
        return remaining;
      }

      return {
        ...current,
        [key]: {
          menuName: orderItem.name,
          itemName: menuItem.title || menuItem.name || "Included item",
        },
      };
    });
  }

  function addSuggestion(item) {
    setSuggestedList((currentItems) =>
      currentItems.some((currentItem) => currentItem.id === item.id)
        ? currentItems
        : [...currentItems, { ...item, quantity: 1 }],
    );
  }

  function updateSuggestionQuantity(itemId, change) {
    setSuggestedList((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, Number(item.quantity || 1) + change) }
          : item,
      ),
    );
  }

  function removeSuggestion(itemId) {
    setSuggestedList((currentItems) =>
      currentItems.filter((currentItem) => currentItem.id !== itemId),
    );
  }

  function scrollSuggestions() {
    const element = document.getElementById("suggestion-slider");
    if (element) {
      element.scrollBy({ left: 160, behavior: "smooth" });
    }
  }

  async function handleAdjustOrderSubmit() {
    if (!hasFormChanges) {
      await showVendorErrorAlert(
        "Please make at least one change before submitting the order adjustment.",
        "Nothing to Submit",
      );
      return;
    }

      if (!reason) {
        setFormErrors({ reason: "Please select a reason for the change." });
        await showVendorErrorAlert("Please select a reason for the change.", "Validation Error");
        return;
      }

      setFormErrors({});
    setSubmitError("");
    setIsSubmitting(true);

    let removedItemsJson = [];
    let addedItemsJson = [];

    try {
      removedItemsJson = modifiedItems
        .map((item) => ({
          productId: item.productId || item.backendId || item.id || null,
          quantity: item.adjustmentQuantity,
        }))
        .filter((item) => item.productId);

      addedItemsJson = suggestedList
        .map((item) => ({
          productId: item.backendId || item.id || null,
          quantity: Math.max(1, Number(item.quantity ?? 1) || 1),
          ...(Array.isArray(item.selectedAddons) && item.selectedAddons.length > 0
            ? { selectedAddons: item.selectedAddons }
            : {}),
        }))
        .filter(Boolean);

      const vendorNote = [
        additionalDetails.trim(),
        suggestedList.length
          ? `Suggested additions: ${suggestedList.map((item) => item.name).join(", ")}`
          : "",
        modifiedItems.length
          ? `Requested removals: ${modifiedItems.map((item) => item.name).join(", ")}`
          : "",
        Object.values(requestedMenuItemChanges).length
          ? `Requested included-dish changes: ${Object.values(requestedMenuItemChanges).map((item) => `${item.menuName} - ${item.itemName}`).join(", ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const mutationInput = {
        orderId: orderDetail?.rawId || decodedOrderId,
        reason: REASON_ENUM_MAP[reason] || "OTHER",
        vendorNote,
        removedItemsJson,
        addedItemsJson,
        idempotencyKey: createIdempotencyKey(),
      };

      if (hasPricingChanges) {
        mutationInput.oldTotal = oldTotal;
        mutationInput.newTotal = newTotal;
      }

      const payload = await createVendorOrderAdjustment(mutationInput);

      if (!payload?.success) {
        setFormErrors(mapErrorsByField(payload?.errors));
        const errMsg = payload?.message || "Unable to submit the order adjustment.";
        setSubmitError(errMsg);
        console.error("Order adjustment submission failed:", {
          mutationInput,
          errors: payload?.errors,
        });
        await showVendorErrorAlert(errMsg, "Adjustment Rejected");
        return;
      }

      savePendingAdjustment(orderDetail?.rawId || decodedOrderId, {
        id: payload?.adjustment?.id || createIdempotencyKey(),
        status: payload?.adjustment?.status || "PENDING",
        reason,
        vendorNote,
        removedItemsJson,
        addedItemsJson,
        removedItemNames: modifiedItems.map((item) => item.name),
        addedItemNames: suggestedList.map((item) => item.name),
        proposedEventDate: null,
        proposedDeliveryWindowStart: null,
        proposedGuestCount: null,
        proposedAddressLine1: null,
        proposedAddressLine2: null,
        proposedCity: null,
        proposedPostalCode: null,
        oldTotal: hasPricingChanges ? oldTotal : null,
        newTotal: hasPricingChanges ? newTotal : null,
        createdOn: payload?.adjustment?.createdOn || new Date().toISOString(),
      });

      await showOrderStatusUpdated(
        `Order ${orderDetail?.id || decodedOrderId} adjustment submitted successfully.`,
      );
      navigate(`/orders/${encodeURIComponent(decodedOrderId)}`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unable to submit the order adjustment.";
      setSubmitError(errMsg);
      console.error("Order adjustment submit error:", error, {
        orderId: orderDetail?.rawId || decodedOrderId,
        removedItemsJson,
        addedItemsJson,
      });
      await showVendorErrorAlert(errMsg, "Submission Error");
    } finally {
      setIsSubmitting(false);
    }
  }

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

      <div className="rounded-[16px] border border-[#dfd8cf] bg-white p-6 shadow-[0_2px_8px_rgba(42,27,18,0.06)]">
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(280px,0.85fr)] gap-6 max-[880px]:grid-cols-1">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 rounded-[10px] border border-[#ffe2cc] bg-[#fff8f2] p-3 text-[13px] font-semibold leading-[1.45] text-[#d96e39]">
              <AlertTriangle size={16} strokeWidth={2.4} className="mt-[2px] shrink-0" />
              <span>
                <strong>Important:</strong> Please call the customer and confirm the
                changes with them before doing adjustment in order.
              </span>
            </div>

            {submitError ? (
              <div className="rounded-[10px] border border-[#ffd0cc] bg-[#fff2f1] px-3 py-3 text-[13px] font-semibold text-[#b42318]">
                {submitError}
              </div>
            ) : null}

            <div className="relative flex flex-col gap-1.5">
              <span className="text-[16px] font-extrabold text-[#1c1510]">1. Reason for Change</span>
              <span className="text-[13px] font-bold text-[#8a7a6d]">
                Please select the main reason for requesting changes.
              </span>
              <button
                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#d8cec4] bg-white px-3 text-left text-[13px] font-bold text-[#2b231e] transition hover:border-[#cf6e38]"
                onClick={() => setIsReasonDropdownOpen((current) => !current)}
                type="button"
              >
                <span>{reason || "Select reason for changes"}</span>
                <ChevronRight
                  size={16}
                  className={`transform transition-transform ${
                    isReasonDropdownOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              {isReasonDropdownOpen ? (
                <div className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-[180px] w-full overflow-y-auto rounded-[8px] border border-[#d8cec4] bg-white p-1 shadow-lg">
                  {REASON_OPTIONS.map((option) => (
                    <button
                      key={option}
                      className="w-full cursor-pointer rounded-[6px] px-3 py-2 text-left text-[13px] font-bold text-[#44382e] transition hover:bg-[#faf7f4]"
                      onClick={() => {
                        setReason(option);
                        setIsReasonDropdownOpen(false);
                      }}
                      type="button"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}

              {formErrors.reason ? (
                <span className="text-[12px] font-bold text-[#b42318]">{formErrors.reason}</span>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[16px] font-extrabold text-[#1c1510]">2. Items to Modify</span>
              <span className="text-[13px] font-bold text-[#8a7a6d]">
                Select an order item, then choose how many should be removed or replaced.
              </span>
              <div className="flex flex-col gap-2 rounded-[10px] border border-[#efe6de] bg-[#faf9f6] p-1.5">
                {removableItems.length > 0 ? removableItems.map((item) => {
                  const isChecked = modifiedItemIds.includes(item.id);

                  return (
                    <article
                      key={item.id}
                      className={`rounded-[12px] border p-3.5 transition ${
                        isChecked
                          ? "border-[#fecaca] bg-[#fff8f8]"
                          : "border-[#f2ece6] bg-white hover:bg-[#faf9f6]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 h-4 w-4 shrink-0 accent-[#cf6e38]"
                        />
                        {item.image ? (
                          <img
                            alt={item.name}
                            src={item.image}
                            className="h-12 w-16 shrink-0 rounded-[8px] border border-[#efe6de] object-cover"
                          />
                        ) : (
                          <div className="h-12 w-16 shrink-0 rounded-[8px] border border-[#efe6de] bg-[#f7f2ec]" />
                        )}
                        <div className="flex min-w-0 flex-col">
                          <span
                            className={`text-[14px] font-extrabold ${
                              isChecked ? "text-red-700 line-through" : "text-[#2b231e]"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="mt-0.5 text-[11px] font-semibold text-[#8a7a6d]">
                            Ordered quantity: {item.quantity}
                          </span>
                          {item.description ? (
                            <span className="mt-1 text-[11px] leading-5 text-[#88796e]">
                              {item.description}
                            </span>
                          ) : null}
                        </div>
                        </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[14px] font-extrabold text-[#2b231e]">{formatCurrency(item.totalPrice)}</span>
                        {isChecked ? (
                          <div className="flex items-center rounded-[7px] border border-[#f1c5c0] bg-white">
                            <button className="flex h-7 w-7 items-center justify-center text-red-700 disabled:opacity-40" disabled={(modifiedItemQuantities[item.id] || item.quantity) <= 1} onClick={() => updateModifiedQuantity(item.id, -1)} type="button"><Minus size={13} /></button>
                            <span className="min-w-7 text-center text-[12px] font-extrabold text-red-700">{modifiedItemQuantities[item.id] || item.quantity}</span>
                            <button className="flex h-7 w-7 items-center justify-center text-red-700 disabled:opacity-40" disabled={(modifiedItemQuantities[item.id] || item.quantity) >= item.quantity} onClick={() => updateModifiedQuantity(item.id, 1)} type="button"><Plus size={13} /></button>
                          </div>
                        ) : null}
                      </div>
                      </div>
                      {item.menuItems.length ? (
                        <div className="mt-3 border-t border-[#eee5de] pt-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8a7a6d]">Included dishes</span>
                            <span className="text-[10px] font-semibold text-[#a18f81]">Select a dish to request a change</span>
                          </div>
                          <div className="grid gap-2 lg:grid-cols-2">
                            {item.menuItems.map((menuItem, menuItemIndex) => {
                              const menuItemKey = `${item.id}:${menuItem.id || menuItem.title || menuItem.name}`;
                              const isRequested = Boolean(requestedMenuItemChanges[menuItemKey]);

                              return (
                                <div key={menuItemKey} className={`flex items-start justify-between gap-3 rounded-[8px] border px-3 py-2.5 ${isRequested ? "border-[#f1c0a8] bg-[#fff7f1]" : "border-[#eee5de] bg-[#fcfbfa]"}`}>
                                  <div className="min-w-0">
                                    <p className="m-0 text-[12px] font-extrabold text-[#3d3028]">{menuItemIndex + 1}. {menuItem.title || menuItem.name || "Included item"}</p>
                                    {menuItem.description ? <p className="mt-1 text-[11px] leading-4 text-[#817268]">{menuItem.description}</p> : null}
                                  </div>
                                  <button
                                    className={`shrink-0 rounded-[6px] border px-2.5 py-1.5 text-[10px] font-bold transition ${isRequested ? "border-[#d96e39] bg-[#d96e39] text-white" : "border-[#ddd2c8] bg-white text-[#6f6258] hover:border-[#d96e39] hover:text-[#c75c2b]"}`}
                                    onClick={() => toggleMenuItemChange(item, menuItem)}
                                    type="button"
                                  >
                                    {isRequested ? "Requested" : "Request change"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                }) : (
                  <div className="rounded-[8px] border border-dashed border-[#d8cec4] bg-white px-4 py-4 text-[13px] font-semibold text-[#8a7a6d]">
                    No removable order items were returned by the API for this order.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[16px] font-extrabold text-[#1c1510]">3. Suggestion (Optional)</span>
              <span className="text-[13px] font-bold text-[#8a7a6d]">
                Suggest alternative items that could better fit the customer's needs.
              </span>

              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-[#8a7a6d]" />
                <input
                  type="text"
                  placeholder="Search items to suggest..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="h-10 w-full rounded-[8px] border border-[#d8cec4] bg-white pl-9 pr-3 text-[13px] font-semibold text-[#1c1510] placeholder-[#a49a90] transition focus:border-[#cf6e38] focus:outline-none"
                />
              </div>

              <div className="relative mt-1">
                <div
                  id="suggestion-slider"
                  className="hide-scrollbar flex gap-2.5 overflow-x-auto scroll-smooth pb-1 pr-8"
                >
                  {availableSuggestions.map((item) => (
                    <div
                      key={item.id}
                      className="flex w-[180px] shrink-0 flex-col gap-2 rounded-[12px] border border-[#efe6de] bg-white p-3 shadow-sm transition duration-200 hover:border-[#cf6e38] hover:shadow-md"
                    >
                      {item.image ? (
                        <img
                          alt={item.name}
                          src={item.image}
                          className="h-24 w-full rounded-[8px] object-cover"
                        />
                      ) : (
                        <div className="h-24 w-full rounded-[8px] bg-[#f7f2ec]" />
                      )}
                      <div className="flex flex-col gap-0.5">
                        <strong className="text-[14px] font-extrabold text-[#1c1510]">{item.name}</strong>
                        <span className="text-[12px] font-semibold text-[#8a7a6d]">
                          {item.description || "No description available"}
                        </span>
                      </div>
                      <span className="mt-1 text-[13px] font-extrabold text-[#cf6e38]">
                        {formatCurrency(item.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => addSuggestion(item)}
                        className="mt-1 flex h-8 w-full cursor-pointer items-center justify-center rounded-[6px] border border-[#ffe2cc] bg-[#fff2ec] text-[13px] font-bold text-[#d96e39] transition hover:border-[#d96e39] hover:bg-[#d96e39] hover:text-white active:scale-95"
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
                  className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#efe6de] bg-white text-[#7a6d63] shadow-md transition hover:bg-[#faf7f4]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-extrabold text-[#1c1510]">Adjusted Items</span>
              {modifiedItems.length === 0 && suggestedList.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[#d8cec4] bg-[#faf9f6] p-4 text-center text-[13px] font-medium italic text-[#8a7a6d]">
                  No items modified or added yet. Select order items above or search suggestions to make adjustments.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
                  {modifiedItems.map((item) => (
                    <div
                      key={`removed-${item.id}`}
                      className="flex min-w-0 flex-wrap items-start gap-3 rounded-[12px] border border-red-200 bg-[#fff5f5] p-3 transition hover:border-red-300"
                    >
                      <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-[6px] border border-red-200 bg-red-100 text-[12px] font-extrabold uppercase tracking-wider text-red-500">
                        Rem
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col leading-[1.3]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="break-words text-[14px] font-extrabold text-[#1c1510] line-through">{item.name}</span>
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-red-700">
                            Removed
                          </span>
                        </div>
                        <span className="text-[13px] font-extrabold text-red-600">
                          -{formatCurrency(item.totalPrice * (item.adjustmentQuantity / Math.max(1, item.quantity)))} ({item.adjustmentQuantity} item{item.adjustmentQuantity === 1 ? "" : "s"})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="ml-auto h-8 shrink-0 cursor-pointer rounded-[6px] border border-red-300 bg-white px-3 text-[13px] font-extrabold text-red-700 transition hover:border-red-400 hover:bg-red-50 active:scale-95"
                      >
                        Restore
                      </button>
                    </div>
                  ))}

                  {suggestedList.map((item) => (
                    <div
                      key={`added-${item.id}`}
                      className="flex min-w-0 flex-wrap items-start gap-3 rounded-[12px] border border-green-200 bg-[#f5fff5] p-3 transition hover:border-green-300"
                    >
                      {item.image ? (
                        <img
                          alt={item.name}
                          src={item.image}
                          className="h-10 w-12 shrink-0 rounded-[6px] border border-green-200 object-cover"
                        />
                      ) : (
                        <div className="h-10 w-12 shrink-0 rounded-[6px] border border-green-200 bg-[#eef9ef]" />
                      )}
                      <div className="flex min-w-0 flex-1 flex-col leading-[1.3]">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="break-words text-[14px] font-extrabold text-[#1c1510]">{item.name}</span>
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-green-700">
                            Added
                          </span>
                        </div>
                        <span className="text-[13px] font-extrabold text-green-600">
                          +{formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}
                        </span>
                      </div>
                      <div className="flex items-center rounded-[7px] border border-green-300 bg-white">
                        <button className="flex h-7 w-7 items-center justify-center text-green-700 disabled:opacity-40" disabled={Number(item.quantity || 1) <= 1} onClick={() => updateSuggestionQuantity(item.id, -1)} type="button"><Minus size={13} /></button>
                        <span className="min-w-7 text-center text-[12px] font-extrabold text-green-700">{item.quantity || 1}</span>
                        <button className="flex h-7 w-7 items-center justify-center text-green-700" onClick={() => updateSuggestionQuantity(item.id, 1)} type="button"><Plus size={13} /></button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSuggestion(item.id)}
                        className="ml-auto h-8 shrink-0 cursor-pointer rounded-[6px] border border-green-300 bg-white px-3 text-[13px] font-extrabold text-green-700 transition hover:border-green-400 hover:bg-green-50 active:scale-95"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[16px] font-extrabold text-[#1c1510]">Additional Details</span>
              <textarea
                placeholder="Please explain the changes you would like to make..."
                value={additionalDetails}
                onChange={(event) => setAdditionalDetails(event.target.value)}
                className="min-h-[90px] w-full resize-y rounded-[8px] border border-[#d8cec4] p-3 text-[13px] font-semibold text-[#1c1510] placeholder-[#a49a90] transition focus:border-[#cf6e38] focus:outline-none"
              />
            </div>

            <div className="rounded-[10px] border border-[#efe6de] bg-[#fcf8f4] px-4 py-3 text-[13px] font-semibold leading-[1.6] text-[#6f655d]">
              Vendors can only request item removals or replacement suggestions from this screen.
              Event date, time, guest count, and delivery address remain locked.
            </div>
          </div>

          <div className="flex flex-col">
            <div className="sticky top-[10px] flex flex-col gap-4 rounded-[12px] border border-[#f5ede4] bg-[#fff6ed] p-4.5 shadow-sm">
              <strong className="text-[16px] font-extrabold text-[#1c1510]">Order Summary</strong>

              <div className="flex flex-col gap-3 border-t border-[#f2ece6] pt-3 text-[13px]">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#8a7a6d]">Order ID</span>
                  <span className="text-right font-extrabold text-[#1c1510]">{orderDetail.id}</span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#8a7a6d]">Customer</span>
                  <span className="text-right font-extrabold text-[#1c1510]">
                    {orderDetail.customer?.name || "Customer unavailable"}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#8a7a6d]">Order Date</span>
                  <span className="text-right font-extrabold text-[#1c1510]">
                    {orderDetail.date} - {orderDetail.time || "-"}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#8a7a6d]">Persons</span>
                  <span className="text-right font-extrabold text-[#1c1510]">{orderDetail.guests}</span>
                </div>

                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#8a7a6d]">Delivery Address</span>
                  <span className="max-w-[170px] text-right font-extrabold leading-[1.3] text-[#1c1510]">
                    {orderDetail.logistics?.fullAddress || orderDetail.logistics?.deliveryAddress || "-"}
                  </span>
                </div>

                {orderDetail.financialSummary?.map((item) => {
                  const label = normalizeString(item.label).toLowerCase();
                  if (label === "total" || label.includes("adjustment")) {
                    return null;
                  }

                  return (
                    <div key={item.label} className="flex items-start justify-between">
                      <span className="font-bold text-[#8a7a6d]">{item.label}</span>
                      <span className="text-right font-extrabold text-[#1c1510]">{item.value}</span>
                    </div>
                  );
                })}

                {modifiedItems.length > 0 ? (
                  <div className="flex items-start justify-between font-bold text-red-600">
                    <span>Removed Items Offset</span>
                    <span className="text-right">-{formatCurrency(removedCost)}</span>
                  </div>
                ) : null}

                {suggestedList.length > 0 ? (
                  <div className="flex items-start justify-between font-bold text-green-600">
                    <span>Added Items Offset</span>
                    <span className="text-right">+{formatCurrency(addedCost)}</span>
                  </div>
                ) : null}

                <div className="flex items-start justify-between border-t border-[#f2ece6] pt-3">
                  <span className="font-bold text-[#8a7a6d]">Old Total Amount</span>
                  <span className="text-right font-extrabold text-[#1c1510]">
                    {formatCurrency(oldTotal)}
                  </span>
                </div>

                <div className="flex items-start justify-between border-t border-[#f2ece6] pt-3">
                  <span className="font-bold text-[#8a7a6d]">
                    {hasPricingChanges ? "Updated Total Amount" : "Price Impact"}
                  </span>
                  <span className="text-right text-[16px] font-black text-[#d96e39]">
                    {hasPricingChanges ? formatCurrency(effectiveNewTotal) : "No price change"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3.5 border-t border-[#efe6de] pt-4">
          <Link
            to={`/orders/${orderId}`}
            className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d8cec4] bg-white px-6 text-[13px] font-extrabold text-[#2b231e] no-underline transition hover:bg-[#faf7f4] active:scale-95"
          >
            Cancel
          </Link>
          <button
            className="h-10 cursor-pointer rounded-[8px] bg-[#d96e39] px-6 text-[13px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] transition hover:bg-[#cf6e38] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !hasFormChanges}
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
