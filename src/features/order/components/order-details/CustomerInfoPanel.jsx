import { CircleAlert, UserRound, X } from "lucide-react";
import { useState } from "react";
import DetailPanel from "./DetailPanel";

function Field({ label, value, fullWidth = false }) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "md:col-span-2" : ""}`}>
      <span className="text-[16px]  text-[#8a7a6d]">{label}</span>
      <strong className="text-[13px] font-extrabold text-[#17120e]">{value}</strong>
    </div>
  );
}

function HistoryStatus({ status, tone }) {
  const toneClasses = {
    delivered: "bg-[#dff7d9] text-[#248d32] border-[#b9ebb0]",
    canceled: "bg-[#ffdede] text-[#d84a4a] border-[#f1b9b9]",
  };

  return (
    <span
      className={`inline-flex min-h-5 items-center rounded-full border px-2 text-[9px] font-extrabold ${
        toneClasses[tone] ?? toneClasses.delivered
      }`}
    >
      {status}
    </span>
  );
}

function OrderHistoryDrawer({ customer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/35" onClick={onClose}>
      <aside
        className="flex h-full w-full max-w-[340px] flex-col bg-white px-4 pb-5 pt-3 shadow-[-8px_0_30px_rgba(0,0,0,0.12)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[24px] font-extrabold leading-[1.15] text-[#17120e]">Order History</h3>
            <p className="mt-1 text-[12px] font-medium text-[#8a7a6d]">{customer.name}</p>
          </div>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#e6ddd4] bg-white text-[#6d6259]"
            onClick={onClose}
            type="button"
            aria-label="Close order history"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 overflow-y-auto pr-1">
          {customer.historyOrders?.map((order) => (
            <article
              key={order.id}
              className="rounded-[10px] border border-[#cfc7bf] bg-white px-3 py-3 shadow-[0_1px_4px_rgba(38,23,14,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.04em] text-[#9a8f86]">
                  {order.id}
                </span>
                <HistoryStatus status={order.status} tone={order.statusTone} />
              </div>

              <h4 className="mt-1.5 text-[18px] font-extrabold leading-[1.2] text-[#17120e]">
                {order.title}
              </h4>

              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.03em] text-[#8b8077]">
                <span>{order.date}</span>
                <span>{order.guests}</span>
              </div>

              <div className="mt-2 text-[14px] font-extrabold text-[#17120e]">{order.amount}</div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default function CustomerInfoPanel({ customer }) {
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

      {isHistoryOpen ? (
        <OrderHistoryDrawer customer={customer} onClose={() => setIsHistoryOpen(false)} />
      ) : null}
    </>
  );
}
