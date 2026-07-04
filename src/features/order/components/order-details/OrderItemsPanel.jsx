import { useState } from "react";
import DetailPanel from "./DetailPanel";
import OrderDetailModal from "../OrderDetailModal";

export default function OrderItemsPanel({ orderItem, note, addOns, orderId, order }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const heroImage = orderItem?.image || order?.raw?.orderCarts?.[0]?.item?.coverImage?.fileUrl || "";
  const specialInstructions = note || "No special instructions were returned by the API.";

  return (
    <>
      <DetailPanel title="Order Details">
        <div className="rounded-[10px] bg-[#f4f7fb] p-4">
          <div className="flex items-start gap-3">
            <div
              className="h-[76px] w-[76px] shrink-0 rounded-[10px] border border-[#e5ddd6] bg-[#fffdfb] bg-cover bg-center"
              style={heroImage ? { backgroundImage: `url("${heroImage}")` } : undefined}
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
          {specialInstructions}
        </div>
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
