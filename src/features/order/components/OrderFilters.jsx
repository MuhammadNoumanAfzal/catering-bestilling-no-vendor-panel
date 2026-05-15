export default function OrderFilters({ filters, activeFilter, selectedCount, onFilterChange }) {
  return (
    <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-[#eee7df] px-2 pb-0.5 pt-[14px] max-[960px]:flex-col max-[960px]:items-start">
      <span className="text-[13px] font-extrabold text-[#17120e]">{selectedCount} Selected</span>
      <div className="flex flex-wrap justify-end gap-1.5 max-[960px]:justify-start">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`min-h-6 rounded-full border border-[#3f3731] px-[11px] text-[12px] font-extrabold leading-none ${
              activeFilter === filter ? "bg-[#17120e] text-white" : "bg-white text-[#17120e]"
            }`}
            onClick={() => onFilterChange(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
}
