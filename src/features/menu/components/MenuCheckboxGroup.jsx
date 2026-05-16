export default function MenuCheckboxGroup({ label, items, selectedItems, onToggle }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="type-subpara text-[#19130f]">{label}</span>
      <div className="grid grid-cols-2 gap-x-5 gap-y-2.5 rounded-[8px] border border-[#d6d0c9] bg-white px-3 py-3">
        {items.map((item) => {
          const isChecked = selectedItems.includes(item);

          return (
            <label
              key={item}
              className="flex items-center gap-2 text-[11px] font-semibold text-[#241a15]"
            >
              <input
                checked={isChecked}
                className="h-3.5 w-3.5 rounded-[3px] border-[#bdb5ad] text-[#cf6e38] focus:ring-[#cf6e38]"
                onChange={() => onToggle(item)}
                type="checkbox"
              />
              <span>{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
