import i18n from "../../../../i18n";
import { CircleAlert, UserRound, X } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailPanel from "./DetailPanel";
import { getVendorCustomerOrderHistory } from "../../api/orderApi";

function Field({ label, value, fullWidth = false }) {
  const displayValue = `${value ?? ""}`.trim();

  if (!displayValue || displayValue === "-") {
    return null;
  }

  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${fullWidth ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <span className="text-[14px] text-[#8a7a6d]">{label}</span>
      <strong
        className={`text-[13px] font-extrabold text-[#17120e] ${
          fullWidth ? "break-all leading-[1.35]" : "truncate"
        }`}
        title={displayValue}
      >
        {displayValue}
      </strong>
    </div>
  );
}

const statusKeyByLabel = { New: "new", Accepted: "accepted", Preparing: "preparing", Ready: "ready", "Out for delivery": "outForDelivery", Delivered: "delivered", Canceled: "canceled", Modified: "modified" };

function HistoryStatus({ status, tone, t }) {
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
      {t(`orders.${statusKeyByLabel[status] || "status"}`, { defaultValue: status })}
    </span>
  );
}

function OrderHistoryDrawer({ customer, orderId, onClose }) {
  const { t } = useTranslation();
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
            : t("orders.detail.dateUnavailable", { defaultValue: "Date unavailable" });

          const statusVal = item.status || "";
          const statusLabelVal = item.statusLabel || "";
          const isCanceled =
            /cancel/i.test(statusVal) ||
            /reject/i.test(statusVal) ||
            /cancel/i.test(statusLabelVal) ||
            /reject/i.test(statusLabelVal);

          const calculatedGrandTotal = parseFloat(
            item.pricing?.grandTotal ?? item.finalPrice ?? 0,
          );

          return {
            id: item.orderNumber || `#${item.id}`,
            status: item.statusLabel || item.status || t("orders.detail.unknown", { defaultValue: "Unknown" }),
            statusTone: isCanceled ? "canceled" : "delivered",
            title: item.eventName || t("orders.detail.order", { defaultValue: "Order" }),
            date: dateLabel,
            guests: t("orders.detail.guestCount", { count: item.guestCount || 0, defaultValue: `${item.guestCount || 0} guests` }),
            amount: `kr ${calculatedGrandTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          };
        });

        setHistoryOrders(mapped);
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || i18n.t("vendorMessages.historyFailed"));
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
            <h3 className="text-[22px] font-black tracking-tight text-[#1a120b]">{t("orders.detail.orderHistory", { defaultValue: "Order History" })}</h3>
            <p className="mt-0.5 text-[13px] font-medium text-[#7a6f63]">{customer.name}</p>
          </div>
          <button
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#e6ddd4] bg-white text-[#766c61] shadow-sm transition-all duration-200 hover:border-[#cf6e38]/60 hover:bg-[#faf6f2] hover:text-[#cf6e38] active:scale-95"
            onClick={onClose}
            type="button"
            aria-label={t("orders.detail.closeOrderHistory", { defaultValue: "Close order history" })}
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
                  <HistoryStatus status={order.status} tone={order.statusTone} t={t} />
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
              {t("orders.detail.noPreviousOrders", { defaultValue: "No previous orders found for this customer." })}
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

export default function CustomerInfoPanel({ customer, orderId }) {
  const { t } = useTranslation();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const organization = `${customer.organization ?? ""}`.trim();
  const hasOrganization =
    Boolean(organization) &&
    organization !== "-" &&
    !/^private\s+client$/i.test(organization);
  const isCorporate = /^corporate/i.test(`${customer.customerType ?? ""}`.trim());

  return (
    <>
      <DetailPanel title={t("orders.detail.customerContact", { defaultValue: "Customer & Contact" })} titleIcon={UserRound}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
          <Field label={isCorporate ? t("orders.detail.company", { defaultValue: "Company" }) : t("orders.detail.name", { defaultValue: "Name" })} value={customer.name} />
          {hasOrganization ? <Field label={t("orders.detail.organization", { defaultValue: "Organization" })} value={organization} /> : null}
          {isCorporate ? <Field label={t("orders.detail.contact", { defaultValue: "Contact" })} value={customer.contactName} /> : null}
          <Field label={t("orders.detail.type", { defaultValue: "Type" })} value={t(`orders.customerTypes.${customer.customerType}`, { defaultValue: customer.customerType })} />
          <Field label={t("orders.detail.orgNo", { defaultValue: "Org No." })} value={customer.organizationNumber} />
          <Field label={t("orders.detail.invoiceRef", { defaultValue: "Invoice Ref." })} value={customer.invoiceReference} />
          <Field label={t("orders.detail.postalCode", { defaultValue: "Postal Code" })} value={customer.postalCode} />
          <Field label={t("orders.detail.city", { defaultValue: "City" })} value={customer.city} />
          <Field fullWidth label={t("orders.detail.emailAddress", { defaultValue: "Email Address" })} value={customer.email} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2.5 rounded-[10px] bg-[#edf5ff] px-3 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4f5f73]">
            <CircleAlert size={15} strokeWidth={2.1} className="text-[#1e1e1e]" />
            {t(customer.detailsVisible ? "orders.contactHistory" : "orders.contactHidden")}
          </span>
          <button
            className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-[#3e72d7]"
            onClick={() => setIsHistoryOpen(true)}
            type="button"
          >
            {t("orders.detail.viewOrderHistory", { defaultValue: "View Order history" })}
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
