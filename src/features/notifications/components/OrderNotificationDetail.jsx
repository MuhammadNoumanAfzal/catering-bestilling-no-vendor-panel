import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { deriveOrderSummary } from "../api/notificationsMappers";

export default function OrderNotificationDetail({
  notification,
  onClose,
  isLoading = false,
}) {
  const [expandedItem, setExpandedItem] = useState(null);
  const orderSummary = deriveOrderSummary(notification);
  const fallbackRows = Array.isArray(notification.detailRows) ? notification.detailRows : [];

  const statusRow = fallbackRows.find((row) => row.label === "Status" || row.label === "Stage");
  const customerRow = fallbackRows.find((row) => row.label === "Customer" || row.label === "Requested By");
  const orderIdRow = fallbackRows.find((row) => row.label === "Order ID");
  const amountRow = fallbackRows.find((row) => row.label === "Amount");

  const firstItem = orderSummary?.items?.[0];
  const displayStatus = orderSummary?.status || statusRow?.value || "--";
  const displayAmount = orderSummary?.amount || amountRow?.value || "--";
  const displayCustomer = orderSummary?.customer || customerRow?.value || "--";
  const displayOrderId = orderSummary?.orderId || orderIdRow?.value || "--";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="relative my-auto flex max-h-[calc(100vh-32px)] w-full max-w-[480px] flex-col rounded-[16px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
        <button
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#efe6de] bg-white text-[#7a6d63] transition hover:bg-[#faf7f4] hover:text-[#181310]"
          onClick={onClose}
          type="button"
        >
          <X size={15} />
        </button>

        <div className="mb-3 border-b border-[#efe6de] pb-3 text-center">
          <h3 className="type-h3 m-0 font-extrabold text-[#17120e]">Order details</h3>
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto pr-0.5">
          {orderSummary?.coverImageUrl ? (
            <div
              className="h-[160px] w-full rounded-[12px] border border-[#efe6de] bg-cover bg-center shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              style={{ backgroundImage: `url("${orderSummary.coverImageUrl}")` }}
            />
          ) : (
            <div className="flex h-[160px] w-full items-center justify-center rounded-[12px] border border-[#efe6de] bg-[#faf7f4] text-[13px] font-semibold text-[#7a6d63] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              Order preview not available
            </div>
          )}

          <div className="hide-scrollbar mt-3.5 flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap border-b border-[#f2ece6] pb-2.5 text-[12px] font-semibold sm:text-[13px]">
            <span className="text-[#7a6d63]">
              Status:{" "}
              <strong className="font-bold text-[#2ca24f]">
                {displayStatus}
              </strong>
            </span>
            <span className="text-[#7a6d63]">
              Customer:{" "}
              <strong className="font-extrabold text-[#1c1510]">
                {displayCustomer}
              </strong>
            </span>
            <span className="text-[#7a6d63]">
              Order ID:{" "}
              <strong className="font-extrabold text-[#1c1510]">
                {displayOrderId}
              </strong>
            </span>
          </div>

          <div className="mt-4 pt-1">
            <h4 className="type-h4 m-0 font-extrabold text-[#17120e]">Items</h4>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              <div className="h-5 w-full animate-pulse rounded bg-[#ecdcd0]" />
              <div className="h-16 w-full animate-pulse rounded bg-[#f4ede7]" />
              <div className="h-16 w-full animate-pulse rounded bg-[#f4ede7]" />
            </div>
          ) : (
            <>
              <div className="mt-3 flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3">
                  <span className="type-h5 font-extrabold text-[#8c7f73]">
                    {firstItem?.quantity || "--"}
                  </span>
                  <span className="type-h5 font-extrabold text-[#3a312a] capitalize">
                    {firstItem?.name || orderSummary?.itemsSummary || "--"}
                  </span>
                </div>
                <span className="type-h5 font-extrabold text-[#3a312a]">
                  {displayAmount}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 pl-3">
                {orderSummary?.items?.length ? (
              orderSummary.items.map((item) => {
                const isExpanded = expandedItem === item.id;

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-[10px] border border-[#f2ece6] bg-[#faf9f6] transition-all duration-200"
                  >
                    <button
                      className="flex w-full cursor-pointer items-center justify-between gap-3 p-2.5 text-left transition hover:bg-[#f5f1ec]"
                      onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            alt={item.name}
                            className="h-9 w-[56px] shrink-0 rounded-[6px] border border-[#efe6de] object-cover"
                            src={item.imageUrl}
                          />
                        ) : (
                          <div className="flex h-9 w-[56px] shrink-0 items-center justify-center rounded-[6px] border border-[#efe6de] bg-[#f4ede7] text-[10px] font-bold uppercase tracking-[0.06em] text-[#8c7f73]">
                            Item
                          </div>
                        )}
                        <span className="text-[13px] font-bold text-[#3a312a]">
                          {item.name}
                        </span>
                      </div>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ece6e0] text-[#7a6d63] transition-transform duration-200 ${
                          isExpanded ? "rotate-180 bg-[#d96e39] text-white" : ""
                        }`}
                      >
                        <ChevronDown size={11} />
                      </span>
                    </button>

                    {isExpanded ? (
                      <div className="animate-[fadeIn_150ms_ease] border-t border-[#f2ece6] bg-white px-4 py-3 text-[12px] leading-[1.5] text-[#5c5046]">
                        {item.description ? (
                          <p className="m-0 font-semibold">{item.description}</p>
                        ) : (
                          <p className="m-0 font-semibold">No extra description provided.</p>
                        )}
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#9c8f82]">
                            Allergens:
                          </span>
                          <span className="rounded-[4px] bg-[#fff2ec] px-1.5 py-0.5 text-[10px] font-extrabold text-[#d96e39]">
                            {Array.isArray(item.allergens) && item.allergens.length
                              ? item.allergens.join(", ")
                              : "None"}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
                ) : (
                  <div className="rounded-[10px] border border-[#f2ece6] bg-[#faf9f6] px-4 py-3 text-[13px] font-semibold text-[#5c5046]">
                    Order item details are not available for this notification yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex justify-end border-t border-[#efe6de] pt-3">
          <button
            className="h-8 cursor-pointer rounded-[6px] bg-[#d96e39] px-5 text-[12px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] transition active:scale-95"
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
