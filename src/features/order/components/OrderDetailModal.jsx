import { ChevronDown, X, Calendar, Clock, MapPin, Users, AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getVendorOrderDetail } from "../api/orderApi";
import { mapVendorOrderDetail } from "../api/orderMappers";
import { showVendorErrorAlert } from "../../../utils/vendorAlerts";

const statusToneClasses = {
  "is-new": "border border-[#bde3f9] bg-[#e3f4ff] text-[#1d70a2]",
  "is-ready": "border border-[#b6f0c6] bg-[#e6fcf0] text-[#1c873b]",
  "is-preparing": "border border-[#e7d4ff] bg-[#f5ecff] text-[#6322ad]",
  "is-accepted": "border border-[#cbdcff] bg-[#ecf2ff] text-[#245ce6]",
  "is-delivery": "border border-[#fcd5c0] bg-[#fff2eb] text-[#c4551d]",
  "is-reject": "border border-[#ffd0cc] bg-[#fff2f1] text-[#dc2626]",
  "is-canceled": "border border-[#ffd0cc] bg-[#fff2f1] text-[#dc2626]",
  "is-delivered": "border border-[#c1f5b6] bg-[#edfcf2] text-[#156e10]",
  "is-modified": "border border-[#fed7aa] bg-[#fff7ed] text-[#ea580c]",
};

function renderStatusBadge(status, statusTone) {
  const toneClass = statusToneClasses[statusTone] ?? statusToneClasses["is-new"];
  
  let dotClass = "h-1.5 w-1.5 rounded-full ";
  if (status === "New") {
    dotClass += "bg-[#1d70a2] animate-pulse";
  } else if (status === "Accepted") {
    dotClass += "bg-[#245ce6]";
  } else if (status === "Preparing") {
    dotClass += "bg-[#6322ad] animate-pulse";
  } else if (status === "Ready") {
    dotClass += "bg-[#1c873b]";
  } else if (status === "Out for delivery" || status === "Out for Delivery") {
    dotClass += "bg-[#c4551d] animate-pulse";
  } else if (status === "Delivered") {
    dotClass += "bg-[#156e10]";
  } else if (status === "Modified") {
    dotClass += "bg-[#ea580c] animate-pulse";
  } else {
    dotClass += "bg-[#dc2626]";
  }

  return (
    <span className={`inline-flex min-h-[22px] items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold leading-none shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${toneClass}`}>
      <span className={dotClass} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export default function OrderDetailModal({ orderId, onClose, order, orderDetail }) {
  const [expandedItem, setExpandedItem] = useState(null);
  const [fetchedOrderDetail, setFetchedOrderDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadOrderDetail() {
      if (!orderId) {
        return;
      }

      setIsLoading(true);

      try {
        const result = await getVendorOrderDetail(orderId);
        if (isCancelled) {
          return;
        }

        setFetchedOrderDetail(mapVendorOrderDetail(result, orderId));
      } catch (error) {
        if (!isCancelled) {
          setFetchedOrderDetail(null);
          await showVendorErrorAlert(
            error instanceof Error ? error.message : "Unable to load the order details.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadOrderDetail();

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  const orderData = useMemo(() => {
    const detailSource = fetchedOrderDetail || orderDetail;
    if (!detailSource) {
      return null;
    }

    const rawItems = Array.isArray(detailSource?.raw?.items) ? detailSource.raw.items : [];
    const carts = Array.isArray(detailSource?.raw?.orderCarts) ? detailSource.raw.orderCarts : [];
    const items =
      rawItems.length > 0
        ? rawItems.map((item, index) => ({
            key: item?.id || `${detailSource.id}-item-${index}`,
            name: item?.productName || item?.name || "Item",
            description: item?.description || "",
            image: item?.imageUrl || item?.coverImage?.fileUrl || "",
            quantity: Number(item?.quantity ?? 0) || 0,
            price: item?.lineTotal ?? item?.price ?? 0,
            menuItems: [],
          }))
        : carts.map((cart, index) => {
            const item = cart?.item || {};
            return {
              key: cart?.id || item?.id || `${detailSource.id}-item-${index}`,
              name: item?.name || "Item",
              description: item?.description || "",
              image: item?.coverImage?.fileUrl || "",
              quantity: Number(cart?.quantity ?? 0) || 0,
              price: cart?.totalPriceWithTax ?? cart?.priceWithTax ?? 0,
              menuItems: item.menuItems || [],
            };
          });

    return {
      status: detailSource.status || order?.status || "New",
      statusTone: detailSource.statusTone || order?.statusTone || "is-new",
      customer: detailSource.customer?.name || "Customer unavailable",
      id: detailSource.id || (orderId?.startsWith?.("#") ? orderId : `#${orderId}`),
      price:
        detailSource.orderItem?.modalDetails?.price ||
        detailSource.financialSummary?.find?.((item) => item.label === "Order Total" || item.label === "Total")?.value ||
        "kr 0.00",
      qty: detailSource.guests || 0,
      name: detailSource.orderItem?.modalDetails?.title || detailSource.orderItem?.name || "Order",
      date: detailSource.date || "Not specified",
      time: detailSource.time || "Not specified",
      address: detailSource.logistics?.deliveryAddress || "Not specified",
      note: detailSource.note || "",
      tableware: detailSource.tableware || null,
      items,
      bannerImage: items[0]?.image || "",
    };
  }, [fetchedOrderDetail, order?.status, order?.statusTone, orderDetail, orderId]);

  if (isLoading && !orderData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
        <div className="flex min-h-[220px] w-full max-w-[500px] items-center justify-center rounded-[16px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#cf6e38] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  const renderAllergenPill = (allergen) => {
    const clean = allergen.trim();
    if (clean.toLowerCase() === "none") {
      return (
        <span key={clean} className="rounded-[4px] bg-[#f2ece6] px-2 py-0.5 text-[12px] font-extrabold text-[#7a6d63]">
          None
        </span>
      );
    }
    const isSafe = clean.toLowerCase().includes("free") || clean.toLowerCase().includes("vegan") || clean.toLowerCase().includes("vegetarian");
    const bg = isSafe ? "bg-green-50 text-green-700 border border-green-200" : "bg-[#fff2ec] text-[#d96e39] border border-[#ffe2cc]";
    return (
      <span key={clean} className={`rounded-[4px] px-2 py-0.5 text-[12px] font-extrabold ${bg}`}>
        {clean}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-[2px]">
      <div className="relative w-full max-w-[500px] rounded-[16px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] my-auto max-h-[calc(100vh-32px)] flex flex-col">
        {/* Close button top-right */}
        <button
          className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#efe6de] bg-white text-[#7a6d63] hover:bg-[#faf7f4] hover:text-[#181310] transition"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        {/* Modal Header */}
        <div className="border-b border-[#efe6de] pb-3 mb-4 text-center">
          <h3 className="text-[18px] m-0 font-extrabold text-[#17120e]">Order Details</h3>
        </div>

        {/* Scroll Container */}
        <div className="flex-1 overflow-y-auto pr-0.5 hide-scrollbar flex flex-col gap-4">
          {/* Banner Image with overlaid badge */}
          <div className="relative h-[160px] w-full rounded-[12px] overflow-hidden border border-[#efe6de] shadow-[0_2px_8px_rgba(0,0,0,0.06)] shrink-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-[#f7f2ec]"
              style={orderData.bannerImage ? { backgroundImage: `url("${orderData.bannerImage}")` } : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Overlay Status Badge */}
            <div className="absolute top-3 right-3 z-10 shadow-md rounded-full bg-white/95 p-0.5">
              {renderStatusBadge(orderData.status, orderData.statusTone)}
            </div>

            {/* Overlay Details */}
            <div className="absolute bottom-3 left-3 text-white flex flex-col gap-0.5">
              <span className="text-[13px] font-bold tracking-wider text-amber-200 uppercase">
                {orderData.id}
              </span>
              <strong className="text-[16px] font-black leading-tight drop-shadow-sm">
                {orderData.customer}
              </strong>
            </div>
          </div>

          {/* Logistics Section */}
          <div className="p-3.5 rounded-[12px] border border-[#f2ece6] bg-[#faf9f6] flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 text-[14px] text-[#5c5046]">
              <Calendar size={15} className="text-[#cf6e38] shrink-0" />
              <span>Event Date: <strong className="font-bold text-[#2b231e]">{orderData.date}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-[14px] text-[#5c5046]">
              <Clock size={15} className="text-[#cf6e38] shrink-0" />
              <span>Delivery Window: <strong className="font-bold text-[#2b231e]">{orderData.time}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-[14px] text-[#5c5046]">
              <Users size={15} className="text-[#cf6e38] shrink-0" />
              <span>Guest Count: <strong className="font-bold text-[#2b231e]">{orderData.qty} persons</strong></span>
            </div>
            <div className="flex items-start gap-2.5 text-[14px] text-[#5c5046] leading-[1.35]">
              <MapPin size={15} className="text-[#cf6e38] shrink-0 mt-[1px]" />
              <span>Delivery Address: <strong className="font-bold text-[#2b231e]">{orderData.address}</strong></span>
            </div>
          </div>

          {/* Tableware Section */}
          {orderData.tableware && (
            <div className="p-3.5 rounded-[12px] border border-[#f2ece6] bg-[#faf9f6] flex flex-col gap-2">
              <span className="text-[14px] font-bold text-[#8a7a6d] border-b border-[#f2ece6] pb-1">Tableware Selection</span>
              <div className="flex flex-wrap gap-2.5 mt-1">
                <span className={`rounded-[4px] px-2 py-0.5 text-[12px] font-extrabold ${orderData.tableware.napkins ? "bg-green-50 text-green-700 border border-green-200" : "bg-[#f2ece6] text-[#7a6d63]"}`}>
                  Napkins: {orderData.tableware.napkins ? "Yes" : "No"}
                </span>
                <span className={`rounded-[4px] px-2 py-0.5 text-[12px] font-extrabold ${orderData.tableware.utensils ? "bg-green-50 text-green-700 border border-green-200" : "bg-[#f2ece6] text-[#7a6d63]"}`}>
                  Utensils: {orderData.tableware.utensils ? "Yes" : "No"}
                </span>
                <span className={`rounded-[4px] px-2 py-0.5 text-[12px] font-extrabold ${orderData.tableware.platesBowls ? "bg-green-50 text-green-700 border border-green-200" : "bg-[#f2ece6] text-[#7a6d63]"}`}>
                  Plates/Bowls: {orderData.tableware.platesBowls ? "Yes" : "No"}
                </span>
              </div>
              {orderData.tableware.instructions && (
                <div className="mt-1 text-[13px] bg-[#fffbf0] border border-[#fef08a] rounded-[6px] p-2 text-[#854d0e] font-semibold leading-[1.3]">
                  <strong className="block text-[10px] uppercase tracking-wider text-[#a16207]/75">Instructions:</strong>
                  {orderData.tableware.instructions}
                </div>
              )}
            </div>
          )}

          {/* Customer Special Note Banner */}
          {orderData.note && (
            <div className="flex items-start gap-3 rounded-[10px] bg-[#fffbf0] border border-[#fef08a] p-3 text-[14px] font-semibold text-[#854d0e] leading-[1.4]">
              <AlertTriangle size={16} strokeWidth={2.4} className="shrink-0 mt-[2px] text-[#a16207]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-[#a16207]/75">Customer Note & Allergy Alert</span>
                <span className="font-bold">{orderData.note}</span>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="flex flex-col gap-2">
            <h4 className="text-[16px] m-0 font-extrabold text-[#17120e] border-b border-[#f2ece6] pb-1.5">
              Catering Package Items
            </h4>
            
            {/* Main Package Summary Card */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-[10px] border border-[#efe6de] bg-gradient-to-r from-amber-50/20 to-orange-50/20">
              <span className="text-[15px] font-extrabold text-[#2b231e] capitalize flex-1">
                {orderData.name}
              </span>
              <span className="text-[15px] font-black text-[#cf6e38] shrink-0">
                {orderData.price}
              </span>
            </div>

            {/* Sub-items Accordion List */}
            <div className="flex flex-col gap-2 pl-2">
              {orderData.items.map((item) => {
                const isExpanded = expandedItem === item.name;

                return (
                  <div
                    key={item.name}
                    className="flex flex-col rounded-[10px] border border-[#f2ece6] bg-[#faf9f6] overflow-hidden transition-all duration-200"
                  >
                    {/* Collapsible Header */}
                    <button
                      className="flex items-center justify-between gap-3 p-2 cursor-pointer text-left w-full hover:bg-[#f5f1ec] transition"
                      onClick={() => setExpandedItem(isExpanded ? null : item.name)}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            alt={item.name}
                            className="h-9 w-[56px] shrink-0 rounded-[6px] object-cover border border-[#efe6de]"
                            src={item.image}
                          />
                        ) : (
                          <div className="h-9 w-[56px] shrink-0 rounded-[6px] border border-[#efe6de] bg-[#f7f2ec]" />
                        )}
                        <span className="text-[14px] font-bold text-[#3a312a]">{item.name}</span>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ece6e0] text-[#7a6d63] transition-transform duration-200 ${
                          isExpanded ? "rotate-180 bg-[#d96e39] text-white" : ""
                        }`}
                      >
                        <ChevronDown size={11} />
                      </span>
                    </button>

                    {/* Collapsible Body */}
                    {isExpanded && (
                      <div className="border-t border-[#f2ece6] bg-white px-3 py-2.5 text-[14px] leading-[1.45] text-[#5c5046] animate-[fadeIn_150ms_ease]">
                        <p className="font-semibold m-0">
                          {item.description || "No description available from API."}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] text-[#9c8f82]">
                          <span>Quantity: {item.quantity || 0}</span>
                        </div>
                        {item.menuItems && item.menuItems.length > 0 && (
                          <div className="mt-3 border-t border-[#efe6de] pt-2">
                            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#8a7a6d] mb-1">Included Items:</span>
                            <div className="grid grid-cols-1 gap-1 pl-1">
                              {item.menuItems.map((mi) => (
                                <span key={mi.id || mi.title} className="flex items-center gap-1.5 text-[13px] text-[#4a3f35] font-semibold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#9c8f82]" />
                                  {mi.title || mi.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {orderData.items.length === 0 ? (
                <div className="rounded-[10px] border border-[#f2ece6] bg-[#faf9f6] p-3 text-[14px] font-semibold text-[#5c5046]">
                  No item details were returned by the API for this order.
                </div>
              ) : null}
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="mt-4 border-t border-[#efe6de] pt-3 flex justify-end shrink-0">
          <button
            className="h-9 cursor-pointer rounded-[8px] bg-[#d96e39] px-6 text-[14px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] hover:bg-[#cf6e38] active:scale-95 transition"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
