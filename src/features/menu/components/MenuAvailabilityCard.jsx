export default function MenuAvailabilityCard({ enabled, onToggle }) {
  return (
    <div className="rounded-[8px] bg-[#f2efeb] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="type-subpara m-0 text-[#19130f]">Available immediately</p>
          <p className="mt-1 text-[10px] font-medium text-[#b1a79f]">Will be visible on active menus</p>
        </div>

        <button
          aria-pressed={enabled}
          className={`relative mt-0.5 h-4.5 w-7 rounded-full transition-colors duration-150 ${
            enabled ? "bg-[#db7747]" : "bg-[#d0c8c1]"
          }`}
          onClick={onToggle}
          type="button"
        >
          <span
            className={`absolute top-[2px] h-3 w-3 rounded-full bg-white transition-transform duration-150 ${
              enabled ? "translate-x-[14px]" : "translate-x-[2px]"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
