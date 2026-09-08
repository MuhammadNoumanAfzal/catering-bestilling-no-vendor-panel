import { useState } from "react";
import { Plus } from "lucide-react";
import DetailPanel from "./DetailPanel";
import OrderDetailModal from "../OrderDetailModal";

const currencyFormatter = new Intl.NumberFormat("nb-NO", {
  currency: "NOK",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  style: "currency",
});

function formatAddonPrice(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? currencyFormatter.format(amount) : "Included";
}

export default function OrderItemsPanel({ orderItem, note, addOns, orderId, order }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const heroImage = orderItem?.image || order?.raw?.orderCarts?.[0]?.item?.coverImage?.fileUrl || "";
  const hasSpecialInstructions = Boolean(`${note ?? ""}`.trim());
  const visibleAddOns = Array.isArray(addOns) ? addOns.filter((addon) => addon?.name) : [];

  return (
    <>
      <DetailPanel title="Menu Items">
        <div className="rounded-[10px] bg-[#f4f7fb] p-3">
          <div className="flex items-start gap-3">
            <div
              className="h-[68px] w-[74px] shrink-0 rounded-[9px] border border-[#e5ddd6] bg-[#fffdfb] bg-cover bg-center"
              style={heroImage ? { backgroundImage: `url("${heroImage}")` } : undefined}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <strong className="block text-[18px] font-extrabold leading-[1.2] text-[#17120e] sm:text-[19px]">
                {orderItem.name}
              </strong>
              <p className="mt-1 text-[14px] font-medium leading-[1.45] text-[#6f6358]">
                {orderItem.quantity}
              </p>
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-[14px] font-bold leading-[1.45] text-[#8d837b]">
              {orderItem.description}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2">
              {orderItem.includedItems.map((item) => (
                <span
                  key={item}
                  className="flex items-start gap-1.5 text-[12px] font-semibold leading-[1.4] text-[#54483f]"
                >
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#74706c]" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
            <button
              className="mt-2.5 inline-flex h-8 cursor-pointer items-center justify-center rounded-[8px] border border-[#d8d1ca] bg-white px-3 text-[13px] font-semibold text-[#75695f]"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              View details
            </button>
          </div>
        </div>

        {visibleAddOns.length > 0 ? (
          <div className="mt-3">
            <span className="block text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8a7a6d]">
              Add-ons
            </span>
            <div className="mt-1.5 overflow-hidden rounded-[10px] border border-[#eadfd5] bg-white">
              {visibleAddOns.map((addon) => (
                <div
                  key={addon.id || addon.name}
                  className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-[#f0e7df] px-3 py-2 last:border-b-0"
                >
                  {addon.image ? (
                    <div
                      className="h-11 w-11 rounded-[8px] border border-[#eadfd5] bg-[#fffaf6] bg-cover bg-center"
                      style={{ backgroundImage: `url("${addon.image}")` }}
                      aria-hidden="true"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#f1dfd1] bg-[#fff5ee] text-[#cf6e38]">
                      <Plus size={18} strokeWidth={2.2} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="m-0 truncate text-[13px] font-extrabold text-[#211813]">{addon.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-[1.35] text-[#7d7066]">
                      {[addon.description, addon.detail, addon.parentItemName ? `For ${addon.parentItemName}` : ""]
                        .filter(Boolean)
                        .join(" - ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="m-0 text-[13px] font-extrabold text-[#cf6e38]">
                      {formatAddonPrice(addon.totalPrice)}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[#8a7a6d]">Qty {addon.quantity || 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {hasSpecialInstructions ? (
          <>
            <div className="mt-4 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#8a7a6d]">
              Special instructions
            </div>
            <div className="mt-2 rounded-md border border-[#f2d8c7] bg-[#fff7f1] px-3 py-3 text-[14px] font-semibold leading-[1.5] text-[#7a4f3b]">
              {note}
            </div>
          </>
        ) : null}
      </DetailPanel>

      {isModalOpen ? (
        <OrderDetailModal
          order={order}
          orderDetail={order}
          orderId={orderId}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </>
  );
}
