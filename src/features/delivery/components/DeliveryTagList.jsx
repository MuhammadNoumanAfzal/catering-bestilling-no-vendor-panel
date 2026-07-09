export default function DeliveryTagList({ items, onRemove, disabled = false }) {
  if (!items.length) {
    return (
      <p className="type-subpara mt-3 text-[#9b8f84]">
        No delivery areas selected yet.
      </p>
    );
  }

  function getItemId(item) {
    return typeof item === "string" ? item : item.id;
  }

  function getItemLabel(item) {
    if (typeof item === "string") {
      return item;
    }

    const name = item.name || "";
    const postCode = item.postCode || "";
    return postCode ? `${name} (${postCode})` : name;
  }

  function isItemInactive(item) {
    if (typeof item === "string") return false;
    return item.isActive === false;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => {
        const inactive = isItemInactive(item);
        return (
          <button
            key={getItemId(item)}
            className={`type-subpara inline-flex items-center gap-1.5 rounded-full border px-3 py-[7px] transition ${
              disabled
                ? "cursor-not-allowed border-[#d9d2cb] bg-[#f6f3ef] text-[#8f8377]"
                : inactive
                  ? "cursor-pointer border-[#d9c9bd] bg-[#fdf5f0] text-[#9b8678] hover:border-[#c4a898]"
                  : "cursor-pointer border-[#b9b1aa] bg-white text-[#2b221d] hover:border-[#8d8176]"
            }`}
            disabled={disabled}
            onClick={() => onRemove(getItemId(item))}
            type="button"
            title={inactive ? "This area is inactive and not visible to customers" : undefined}
          >
            <span>{getItemLabel(item)}</span>
            {inactive && !disabled ? (
              <span className="rounded-full bg-[#f0d9cc] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#a0674a]">
                Inactive
              </span>
            ) : null}
            <span
              aria-hidden="true"
              className="text-[13px] leading-none text-[#6e6259]"
            >
              &times;
            </span>
          </button>
        );
      })}
    </div>
  );
}

