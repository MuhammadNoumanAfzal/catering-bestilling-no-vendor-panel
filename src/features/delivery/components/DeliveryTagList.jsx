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

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={getItemId(item)}
          className={`type-subpara inline-flex items-center gap-1 rounded-full border border-[#b9b1aa] bg-white px-3 py-[7px] text-[#2b221d] transition ${
            disabled
              ? "cursor-not-allowed bg-[#f6f3ef] text-[#8f8377]"
              : "cursor-pointer hover:border-[#8d8176]"
          }`}
          disabled={disabled}
          onClick={() => onRemove(getItemId(item))}
          type="button"
        >
          <span>{getItemLabel(item)}</span>
          <span
            aria-hidden="true"
            className="text-[13px] leading-none text-[#6e6259]"
          >
            &times;
          </span>
        </button>
      ))}
    </div>
  );
}
