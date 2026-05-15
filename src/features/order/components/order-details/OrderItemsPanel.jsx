import { X } from "lucide-react";
import { useState } from "react";
import DetailPanel from "./DetailPanel";

function MenuItemModal({ details, itemName, onClose }) {
  if (!details) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Order item details"
    >
      <div
        className="relative w-full max-w-[520px] rounded-[14px] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4ddd5] bg-white text-[#5b524b]"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h3 className="text-center text-[22px] font-extrabold text-[#17120e]">Order details</h3>

        <div className="mt-4 grid grid-cols-4 gap-2 overflow-hidden rounded-[10px]">
          {[...Array(4)].map((_, index) => (
            <div
              key={`${itemName}-${index}`}
              className={`h-[86px] rounded-[8px] bg-cover bg-center ${index === 1 ? "col-span-2" : ""}`}
              style={{ backgroundImage: 'url("/heroBg.webp")' }}
            />
          ))}
        </div>

        <div className="mt-3.5 flex flex-wrap justify-between gap-x-3 gap-y-1.5 text-[11px] font-semibold text-[#7a6c61]">
          <span>Food Item</span>
          <span>Customer Theme</span>
          <span>Chef choice</span>
          <span>Order #12453</span>
        </div>

        <div className="mt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-[32px] font-extrabold leading-[1.15] text-[#17120e]">
                {details.title}
              </h4>
              {details.facts?.map((fact) => (
                <p key={fact} className="mt-1 text-[14px] font-medium leading-[1.55] text-[#72665d]">
                  • {fact}
                </p>
              ))}
            </div>
            <span className="shrink-0 pt-1 text-[28px] font-bold text-[#17120e]">{details.price}</span>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[22px] font-extrabold text-[#17120e]">Items</div>
          <div className="mt-2.5 space-y-2">
            {details.items?.map((item) => (
              <p key={item} className="text-[14px] font-medium leading-[1.6] text-[#62564f]">
                • {item}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          {details.extras?.map((item) => (
            <p key={item} className="text-[14px] font-medium leading-[1.55] text-[#62564f]">
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrderItemsPanel({ orderItem, note, addOns }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <DetailPanel title="Order Details">
        <div className="rounded-[10px] bg-[#f4f7fb] p-4">
          <div className="flex items-start gap-3">
            <div
              className="h-[76px] w-[76px] shrink-0 rounded-[10px] bg-cover bg-center"
              style={{ backgroundImage: 'url("/heroBg.webp")' }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <strong className="block text-[19px] font-extrabold leading-[1.2] text-[#17120e] sm:text-[20px]">
                {orderItem.name}
              </strong>
              <p className="mt-1.5 text-[13px] font-medium leading-[1.55] text-[#6f6358]">
                {orderItem.quantity}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-[11px] font-extrabold tracking-[0.04em] text-[#9b9086]">
              {orderItem.description}
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-x-4 gap-y-1.5 md:grid-cols-2">
              {orderItem.includedItems.map((item) => (
                <span
                  key={item}
                  className="flex items-start gap-1.5 text-[13px] font-semibold leading-[1.45] text-[#54483f]"
                >
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#74706c]" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
            <button
              className="mt-3 border-0 bg-transparent p-0 text-[11px] font-bold text-[#75695f]"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              View details
            </button>
          </div>
        </div>

        <div className="mt-4">
          <span className="block text-[11px] font-extrabold tracking-[0.04em] text-[#8a7a6d]">
            ADD ON
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {addOns.map((addon) => (
              <span
                key={addon}
                className="inline-flex min-h-6 items-center rounded-full border border-[#d2cbc3] bg-[#918780] px-[10px] text-[10px] font-semibold text-white"
              >
                {addon}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 text-[11px] font-extrabold tracking-[0.04em] text-[#8a7a6d]">
          SPECIAL INSTRUCTIONS
        </div>
        <div className="mt-2 rounded-md bg-[#ffc8b5] px-3 py-3 text-[10px] font-semibold uppercase leading-[1.5] italic text-[#c76d3f]">
          {note}
        </div>
      </DetailPanel>

      {isModalOpen ? (
        <MenuItemModal
          details={orderItem.modalDetails}
          itemName={orderItem.name}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </>
  );
}
