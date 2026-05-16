export default function ReviewsFiltersBar({
  activeFilter,
  filters,
  onFilterChange,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#ddd5ce] bg-white px-3 py-3 shadow-[0_3px_10px_rgba(43,30,20,0.04)] max-[760px]:flex-col max-[760px]:items-start">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`min-w-[34px] rounded-[8px] px-3 py-[7px] text-[11px] font-bold ${
              activeFilter === filter
                ? "bg-[#de6f39] text-white"
                : "border border-[#ded6cf] bg-white text-[#6f645b]"
            }`}
            onClick={() => onFilterChange(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-[8px] border border-[#dcd4cc] bg-white px-3 py-[7px] text-[10px] font-bold text-[#2b231d]"
          type="button"
        >
          Last 30 days
        </button>
        <button
          className="rounded-[8px] border border-[#dcd4cc] bg-white px-3 py-[7px] text-[10px] font-bold text-[#2b231d]"
          type="button"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
