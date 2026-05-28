const toneClasses = {
  "is-danger":
    "border-[#efc1bc] bg-[linear-gradient(180deg,#fff9f8_0%,#fffefe_100%)] shadow-[inset_4px_0_0_#d64537]",
  "is-warning":
    "border-[#f0d176] bg-[linear-gradient(180deg,#fffdf5_0%,#fffefd_100%)] shadow-[inset_4px_0_0_#f3b300]",
};

const badgeToneClasses = {
  "is-danger": "bg-[#ffe6e3] text-[#df674f]",
  "is-warning": "bg-[#fff0cf] text-[#d49700]",
};

export default function OrderCard({ onPrimaryAction, onSecondaryAction, order }) {
  return (
    <article
      className={`flex items-end justify-between gap-4 rounded-[14px] border px-3 pb-3 pt-[14px] ${
        toneClasses[order.tone] ?? toneClasses["is-danger"]
      } max-[720px]:flex-col max-[720px]:items-stretch`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
          <div>
            <div className="flex items-center gap-2">
              <strong className="type-h3 text-[#18120e]">{order.id}</strong>
              <span
                className={`type-subpara inline-flex items-center rounded-full px-2 py-[3px] text-[10px] font-bold ${
                  badgeToneClasses[order.tone] ?? badgeToneClasses["is-danger"]
                }`}
              >
                {order.statusLabel}
              </span>
            </div>
            <h3 className="type-h4 mt-[7px] text-[17px] text-[#1b1510]">
              {order.title}
            </h3>
          </div>
          <strong className="type-h5 text-[#1b1510]">{order.amount}</strong>
        </div>

        <p className="type-para mt-[10px] flex flex-wrap gap-[10px] text-[11px] font-bold text-[#211914]">
          <span>{order.guests}</span>
          <span>{order.timing}</span>
        </p>
        <p className="type-para mt-1 text-[11px] font-semibold text-[#382d26]">
          {order.address}
        </p>
      </div>

      <div className="flex items-center gap-2 max-[720px]:flex-col max-[720px]:items-stretch">
        <button
          className="type-para min-h-9 cursor-pointer min-w-[120px] rounded border-0 bg-[#cf6e38] px-[16px] text-[10px] font-bold text-white"
          onClick={() => onPrimaryAction?.(order)}
          type="button"
        >
          Start Preparing
        </button>
        <button
          className="type-para min-h-9 cursor-pointer min-w-[120px] rounded border border-[#b8b4af] bg-white px-[16px] text-[10px] font-bold text-[#2f2822]"
          onClick={() => onSecondaryAction?.(order)}
          type="button"
        >
          View Details
        </button>
      </div>
    </article>
  );
}
