import { CircleAlert, UserRound, X } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import DetailPanel from "./DetailPanel";
import { getVendorCustomerOrderHistory } from "../../api/orderApi";

function Field({ label, value, fullWidth = false }) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "md:col-span-2" : ""}`}>
      <span className="text-[16px]  text-[#8a7a6d]">{label}</span>
      <strong className="text-[13px] font-extrabold text-[#17120e]">{value}</strong>
    </div>
  );
}

function HistoryStatus({ status, tone }) {
  const norm = `${status ?? ""}`.toLowerCase();
  
  let bg = "bg-[#faf7f4] text-[#80766d] border-[#ebdcd0]";
  
  if (norm.includes("confirm") || norm.includes("accept")) {
    bg = "bg-[#e2f7e3] text-[#218131] border-[#c0ebd1]";
  } else if (norm.includes("prepar")) {
    bg = "bg-[#fff3db] text-[#cf7d15] border-[#fde5bd]";
  } else if (norm.includes("cancel") || norm.includes("reject") || tone === "canceled") {
    bg = "bg-[#ffe6e6] text-[#cc3b3b] border-[#fcc8c8]";
  } else if (norm.includes("deliver") || norm.includes("complet")) {
    bg = "bg-[#e8f2ff] text-[#2968c9] border-[#cbe1ff]";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${bg}`}
    >
      {status}
    </span>
  );
}

function OrderHistoryDrawer({ customer, orderId, onClose }) {
  const [historyOrders, setHistoryOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadHistory() {
      if (!orderId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const response = await getVendorCustomerOrderHistory({ orderId });
        if (isCancelled) return;

        const rawHistory = response?.vendorCustomerOrderHistory || [];
        const mapped = rawHistory.map((item) => {
          const dateObj = new Date(item.deliveryDate || item.placedAt);
          const dateLabel = !Number.isNaN(dateObj.getTime())
            ? dateObj.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Date unavailable";

          const statusVal = item.status || "";
          const statusLabelVal = item.statusLabel || "";
          const isCanceled =
            /cancel/i.test(statusVal) ||
            /reject/i.test(statusVal) ||
            /cancel/i.test(statusLabelVal) ||
            /reject/i.test(statusLabelVal);

          const calculatedGrandTotal = parseFloat(
            item.pricing?.grandTotal || item.finalPrice || 0,
          );

          return {
            id: item.orderNumber || `#${item.id}`,
            status: item.statusLabel || item.status || "Unknown",
            statusTone: isCanceled ? "canceled" : "delivered",
            title: item.eventName || "Order",
            date: dateLabel,
            guests: `${item.guestCount || 0} guest${item.guestCount !== 1 ? "s" : ""}`,
            amount: `kr ${calculatedGrandTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          };
        });

        setHistoryOrders(mapped);
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to load order history.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [orderId]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[3px]"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      onClick={onClose}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.aside
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full w-full max-w-[420px] flex-col border-l border-[#efe8e0] bg-gradient-to-b from-[#fdfbf7] to-[#ffffff] p-6 shadow-[-10px_0_40px_rgba(26,20,16,0.15)]"
        exit={{ opacity: 0.95, x: 28 }}
        initial={{ opacity: 0.95, x: 28 }}
        onClick={(event) => event.stopPropagation()}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#ebdcd0]/60 pb-4">
          <div>
            <h3 className="text-[22px] font-black tracking-tight text-[#1a120b]">Order History</h3>
            <p className="mt-0.5 text-[13px] font-medium text-[#7a6f63]">{customer.name}</p>
          </div>
          <button
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e6ddd4] bg-white text-[#766c61] shadow-sm transition-all duration-200 hover:border-[#cf6e38]/60 hover:bg-[#faf6f2] hover:text-[#cf6e38] active:scale-95"
            onClick={onClose}
            type="button"
            aria-label="Close order history"
          >
            <X size={16} />
          </button>
        </div>

        <div className="hide-scrollbar mt-5 flex flex-col gap-4 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#cf6e38] border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-[16px] border border-red-200 bg-red-50 p-4 text-[13px] font-semibold leading-[1.6] text-red-700 shadow-sm">
              {error}
            </div>
          ) : historyOrders.length > 0 ? (
            historyOrders.map((order) => (
              <article
                key={order.id}
                className="group relative rounded-[20px] border border-[#ebdcd0]/70 bg-white p-5 shadow-[0_4px_20px_rgba(40,28,18,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cf6e38]/30 hover:shadow-[0_8px_30px_rgba(40,28,18,0.08)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold tracking-wider text-[#8a7f75] uppercase">
                    {order.id}
                  </span>
                  <HistoryStatus status={order.status} tone={order.statusTone} />
                </div>

                <h4 className="mt-2.5 text-[16px] font-extrabold leading-snug text-[#1f1f1f] transition-colors group-hover:text-[#cf6e38]">
                  {order.title}
                </h4>

                <div className="my-3.5 border-t border-[#f5ece4]/80" />

                <div className="flex items-center justify-between gap-3 text-[12px] font-medium text-[#766c61]">
                  <span>{order.date}</span>
                  <span>{order.guests}</span>
                </div>

                <div className="mt-3.5 text-[18px] font-black text-[#cf6e38]">
                  {order.amount}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[16px] border border-[#e6ddd4] bg-[#faf7f4] p-5 text-[13px] font-medium leading-[1.6] text-[#7a6f63] text-center">
              No previous orders found for this customer.
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

export default function CustomerInfoPanel({ customer, orderId }) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      <DetailPanel title="Customer Information" titleIcon={UserRound}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Name" value={customer.name} />
          <Field label="Organization" value={customer.organization} />
          <Field label="Postal Code" value={customer.postalCode} />
          <Field label="City" value={customer.city} />
          <Field fullWidth label="Email Address" value={customer.email} />
        </div>

        <div className="mt-[14px] flex items-center justify-between gap-2.5 rounded-[10px] bg-[#edf5ff] px-3 py-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4f5f73]">
            <CircleAlert size={15} strokeWidth={2.1} className="text-[#1e1e1e]" />
            {customer.historyText}
          </span>
          <button
            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-[#3e72d7]"
            onClick={() => setIsHistoryOpen(true)}
            type="button"
          >
            View Order history
          </button>
        </div>
      </DetailPanel>

      <AnimatePresence>
        {isHistoryOpen ? (
          <OrderHistoryDrawer
            customer={customer}
            orderId={orderId}
            onClose={() => setIsHistoryOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
