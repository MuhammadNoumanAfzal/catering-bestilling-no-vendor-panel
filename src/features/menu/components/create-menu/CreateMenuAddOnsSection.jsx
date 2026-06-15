import { Search } from "lucide-react";

import CreateMenuSectionCard from "./CreateMenuSectionCard";

export default function CreateMenuAddOnsSection({
  addOnSearch,
  disabled = false,
  filteredAddOns,
  onSearchChange,
  selectedAddOnIds,
  toggleAddOn,
}) {
  return (
    <CreateMenuSectionCard description="Add add-ons from the list" title="Optional add-on">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8e84]"
          size={14}
        />
        <input
          className="h-[40px] w-full rounded-full bg-[#f1f4f6] pl-9 pr-3 text-[14px] text-[#1f1814] outline-none placeholder:text-[#a59b93] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={disabled}
          onChange={onSearchChange}
          placeholder="Search"
          type="text"
          value={addOnSearch}
        />
      </div>

      <div className="mt-3 max-h-[270px] overflow-y-auto rounded-[10px] border border-[#e5ddd4]">
        {filteredAddOns.map((item) => {
          const isSelected = selectedAddOnIds.includes(item.id);

          return (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 border-b border-[#eee6df] px-3 py-2.5 last:border-b-0"
            >
              <input
                checked={isSelected}
                className="accent-[#cf6e38]"
                disabled={disabled}
                onChange={() => toggleAddOn(item.id)}
                type="checkbox"
              />
              <img
                alt={item.name}
                className="h-9 w-9 rounded-[8px] object-cover"
                src={item.image}
              />
              <span className="min-w-0 flex-1 text-[13px] font-semibold text-[#201914]">
                {item.name}
              </span>
              <span className="text-[13px] font-bold text-[#201914]">{item.price}</span>
            </label>
          );
        })}
      </div>
    </CreateMenuSectionCard>
  );
}
