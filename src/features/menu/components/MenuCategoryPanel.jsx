export default function MenuCategoryPanel({
  categories,
  selectedCategory,
  newCategory,
  onCategorySelect,
  onNewCategoryChange,
}) {
  return (
    <div className="rounded-[10px] border border-[#d3cdc6] bg-white px-4 py-4">
      <div className="flex flex-col gap-1">
        <span className="type-subpara text-[#19130f]">Category</span>
        <p className="m-0 text-[11px] font-bold text-[#1f1915]">Select or Create Category</p>
        <p className="m-0 text-[10px] font-medium text-[#a69a90]">
          Organize your add-on for better management
        </p>
      </div>

      <div className="mt-4">
        <p className="m-0 text-[10px] font-extrabold tracking-[0.03em] text-[#37312c]">
          CHOOSE A CATEGORY
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;

            return (
              <button
                key={category}
                className={`rounded-full border px-3 py-1.5 text-[9px] font-bold transition-colors duration-150 ${
                  isActive
                    ? "border-[#d56e3a] bg-[#fff2ea] text-[#ba582d]"
                    : "border-[#d4cdc5] bg-white text-[#4c433c]"
                }`}
                onClick={() => onCategorySelect(category)}
                type="button"
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <p className="m-0 text-[10px] font-extrabold tracking-[0.03em] text-[#37312c]">
          OR CREATE A NEW CATEGORY
        </p>
        <input
          className="type-subpara mt-2 h-[34px] w-full rounded-[7px] border border-[#cdc6be] bg-[#fbfaf8] px-3 text-[#211a16] outline-none transition duration-150 placeholder:text-[#afa49c] focus:border-[#cf6e38] focus:bg-white"
          onChange={(event) => onNewCategoryChange(event.target.value)}
          placeholder="Enter category name (e.g., Sauces, Premium add-ons)"
          type="text"
          value={newCategory}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          className="h-8 rounded-[5px] border border-[#c8c1b9] bg-white px-3.5 text-[10px] font-bold text-[#302721]"
          type="button"
        >
          Cancel
        </button>
        <button
          className="h-8 rounded-[5px] bg-[#d86c37] px-3.5 text-[10px] font-bold text-white"
          type="button"
        >
          Save Category
        </button>
      </div>
    </div>
  );
}
