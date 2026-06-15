import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

const mockSubItems = [
  {
    name: "Grilled chicken",
    image: "/heroBg.webp",
    desc: "Juicy breast pieces marinaded in lemon herb seasoning and grilled over hot charcoal.",
    allergens: "None",
  },
  {
    name: "Fresh salad",
    image: "/heroBg.webp",
    desc: "Crisp cucumbers, vine-ripened tomatoes, red onions, and bell peppers tossed in house vinaigrette.",
    allergens: "Gluten-Free, Vegan",
  },
  {
    name: "Bread",
    image: "/heroBg.webp",
    desc: "Freshly baked warm pita flatbread served in a basket.",
    allergens: "Gluten",
  },
  {
    name: "Sauces",
    image: "/heroBg.webp",
    desc: "Signature garlic paste, spicy muhammara dip, and sesame tahini sauce.",
    allergens: "Sesame, Nuts",
  },
  {
    name: "Dessert",
    image: "/heroBg.webp",
    desc: "Assorted fresh mini doughnuts and sweet baklava pastries.",
    allergens: "Dairy, Nuts, Gluten",
  },
];

export default function OrderNotificationDetail({ notification, onClose }) {
  const [expandedItem, setExpandedItem] = useState(null);

  // Extract values dynamically from detail rows
  const statusRow = notification.detailRows.find((r) => r.label === "Status" || r.label === "Stage");
  const status = statusRow ? statusRow.value : "Accepted";

  const customerRow = notification.detailRows.find((r) => r.label === "Customer" || r.label === "Requested By");
  const customer = customerRow ? customerRow.value : "Thomas";

  const orderIdRow = notification.detailRows.find((r) => r.label === "Order ID");
  const orderId = orderIdRow
    ? orderIdRow.value
    : notification.title.match(/#\w+/)
    ? notification.title.match(/#\w+/)[0]
    : "#12549";

  const amountRow = notification.detailRows.find((r) => r.label === "Amount");
  const price = amountRow ? amountRow.value : "$435.00";

  const itemsRow = notification.detailRows.find((r) => r.label === "Items");
  const itemsVal = itemsRow ? itemsRow.value : "15 Tasty Super Star Package";
  const firstWord = itemsVal.split(" ")[0];
  const isNumber = !isNaN(firstWord);
  const qty = isNumber ? firstWord : "15";
  const itemName = isNumber ? itemsVal.substring(firstWord.length).trim() : itemsVal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-[2px]">
      <div className="relative w-full max-w-[480px] rounded-[16px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] my-auto max-h-[calc(100vh-32px)] flex flex-col">
        
        <button
          className="absolute right-4 top-4 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#efe6de] bg-white text-[#7a6d63] hover:bg-[#faf7f4] hover:text-[#181310] transition"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="border-b border-[#efe6de] pb-3 mb-3 text-center">
          <h3 className="type-h3 m-0 font-extrabold text-[#17120e]">Order details</h3>
        </div>

        <div className="flex-1 overflow-y-auto pr-0.5 hide-scrollbar">
          {/* Banner Image */}
          <div
            className="h-[160px] w-full rounded-[12px] bg-cover bg-center border border-[#efe6de] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            style={{ backgroundImage: 'url("/heroBg.webp")' }}
          />

          {/* Status / Info Row */}
          <div className="mt-3.5 flex items-center justify-between gap-4 border-b border-[#f2ece6] pb-2.5 text-[12px] sm:text-[13px] font-semibold whitespace-nowrap overflow-x-auto hide-scrollbar">
            <span className="text-[#7a6d63]">
              Status: <strong className="font-bold text-[#2ca24f]">{status}</strong>
            </span>
            <span className="text-[#7a6d63]">
              Customer: <strong className="font-extrabold text-[#1c1510]">{customer}</strong>
            </span>
            <span className="text-[#7a6d63]">
              Order ID: <strong className="font-extrabold text-[#1c1510]">{orderId}</strong>
            </span>
          </div>

          {/* Items title */}
          <div className="mt-4 pt-1">
            <h4 className="type-h4 m-0 font-extrabold text-[#17120e]">Items</h4>
          </div>

          {/* Main Item details */}
          <div className="mt-3 flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3">
              <span className="type-h5 font-extrabold text-[#8c7f73]">{qty}</span>
              <span className="type-h5 font-extrabold text-[#3a312a] capitalize">{itemName}</span>
            </div>
            <span className="type-h5 font-extrabold text-[#3a312a]">{price}</span>
          </div>

          {/* Sub-items Collapsible List */}
          <div className="mt-4 flex flex-col gap-2.5 pl-3">
            {mockSubItems.map((item) => {
              const isExpanded = expandedItem === item.name;

              return (
                <div
                  key={item.name}
                  className="flex flex-col rounded-[10px] border border-[#f2ece6] bg-[#faf9f6] overflow-hidden transition-all duration-200"
                >
                  {/* Collapsible Header */}
                  <button
                    className="flex items-center justify-between gap-3 p-2.5 cursor-pointer text-left w-full hover:bg-[#f5f1ec] transition"
                    onClick={() => setExpandedItem(isExpanded ? null : item.name)}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        alt={item.name}
                        className="h-9 w-[56px] shrink-0 rounded-[6px] object-cover border border-[#efe6de]"
                        src={item.image}
                      />
                      <span className="text-[13px] font-bold text-[#3a312a]">{item.name}</span>
                    </div>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ece6e0] text-[#7a6d63] transition-transform duration-200 ${isExpanded ? "rotate-180 bg-[#d96e39] text-white" : ""}`}>
                      <ChevronDown size={11} />
                    </span>
                  </button>

                  {/* Collapsible Body */}
                  {isExpanded && (
                    <div className="border-t border-[#f2ece6] bg-white px-4 py-3 text-[12px] leading-[1.5] text-[#5c5046] animate-[fadeIn_150ms_ease]">
                      <p className="font-semibold m-0">{item.desc}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#9c8f82]">Allergens:</span>
                        <span className="rounded-[4px] bg-[#fff2ec] px-1.5 py-0.5 text-[10px] font-extrabold text-[#d96e39]">{item.allergens}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 border-t border-[#efe6de] pt-3 flex justify-end">
          <button
            className="h-8 cursor-pointer rounded-[6px] bg-[#d96e39] px-5 text-[12px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] active:scale-95 transition"
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
