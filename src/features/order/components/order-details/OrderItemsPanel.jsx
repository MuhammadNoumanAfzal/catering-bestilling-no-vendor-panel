import { X } from "lucide-react";
import { useState } from "react";
import DetailPanel from "./DetailPanel";

function MenuItemModal({ details, onClose }) {
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
        className="relative w-full max-w-[600px] overflow-hidden rounded-[14px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e4ddd5] bg-white cursor-pointer text-[#5b524b]"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="border-b border-[#e9e0d8] px-5 py-4">
          <h3 className="text-center type-h3 font-extrabold text-[#17120e]">Order details</h3>
        </div>

        <div className="px-4 pb-4 pt-3">
          <div
            className="h-[174px] w-full rounded-[14px] bg-cover bg-center"
            style={{ backgroundImage: 'url("/heroBg.webp")' }}
            aria-hidden="true"
          />

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
            <span className="text-[#7b6f64]">
              Status: <strong className="font-bold text-[#2ca24f]">Accepted</strong>
            </span>
            <span className="text-[#7b6f64]">
              Customer: <strong className="font-bold text-[#17120e]">Thomas</strong>
            </span>
            <span className="text-[#7b6f64]">
              Order ID: <strong className="font-bold text-[#17120e]">#12549</strong>
            </span>
          </div>

          <div className="mt-5">
            <h4 className="text-[22px] font-extrabold text-[#17120e]">Items</h4>

            <div className="mt-3 flex items-start justify-between gap-3">
              <span className="type-h5 font-semibold leading-none text-[#7f7368]">15</span>
              <div className="min-w-0 flex-1 type-h5 font-extrabold leading-[1.3] text-[#6d6259]">
                Tasty Super Star Package
              </div>
              <span className="shrink-0 text-[16px] font-bold text-[#6d6259]">{details.price}</span>
            </div>

            <div className="mt-3 space-y-2.5 pl-4 text-[#75695f]">
              {details.items?.map((item) => (
                <p key={item} className="list-item type-para font-medium leading-[1.35]">
                  {item}
                </p>
              ))}
              {details.extras?.map((item) => (
                <p key={item} className="list-item type-para font-medium leading-[1.35]">
                  {item}
                </p>
              ))}
            </div>
          </div>
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
              <p className="mt-1.5 text-[16px] font-medium leading-[1.55] text-[#6f6358]">
                {orderItem.quantity}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-[16px] font-extrabold tracking-[0.04em] text-[#9b9086]">
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
              className="mt-3 inline-flex h-9 cursor-pointer items-center justify-center rounded-[8px] border border-[#d8d1ca] bg-white px-4 text-[14px] font-semibold text-[#75695f]"
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              View details
            </button>
          </div>
        </div>

        <div className="mt-4">
          <span className="block text-[16px] font-extrabold tracking-[0.04em] text-[#8a7a6d]">
            ADD ON
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {addOns.map((addon) => (
              <span
                key={addon}
                className="inline-flex min-h-6 items-center rounded-full border border-[#d2cbc3] bg-[#918780] px-[10px] text-[14px] font-semibold text-white"
              >
                {addon}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 text-[16px] font-extrabold tracking-[0.04em] text-[#8a7a6d]">
          SPECIAL INSTRUCTIONS
        </div>
        <div className="mt-2 rounded-md bg-[#ffc8b5] px-3 py-3 text-[14px] font-semibold uppercase leading-[1.5] italic text-[#c76d3f]">
          {note}
        </div>
      </DetailPanel>

      {isModalOpen ? (
        <MenuItemModal details={orderItem.modalDetails} onClose={() => setIsModalOpen(false)} />
      ) : null}
    </>
  );
}
