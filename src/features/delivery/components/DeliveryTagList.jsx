export default function DeliveryTagList({ items, onRemove, disabled = false }) {
  if (!items.length) {
    return (
      <div className="mt-4 rounded-[14px] border border-dashed border-[#dfd5cc] bg-[#fffaf6] px-4 py-4 text-center">
        <p className="type-subpara text-[#9b8f84]">
          No delivery areas selected yet.
        </p>
      </div>
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

  function getAreaName(item) {
    if (typeof item === "string") {
      return item;
    }

    return item.name || "";
  }

  function getAreaPostCode(item) {
    if (typeof item === "string") {
      return "";
    }

    return item.postCode || "";
  }

  function isItemInactive(item) {
    if (typeof item === "string") return false;
    return item.isActive === false;
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-bold text-[#241c17]">Selected service areas</p>
          <p className="text-[12px] text-[#8b7d71]">
            Manage the locations currently available for delivery.
          </p>
        </div>
        <span className="inline-flex min-h-[28px] items-center rounded-full bg-[#fff2ea] px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#cf6e38]">
          {items.length} selected
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const inactive = isItemInactive(item);
        return (
          <div
            key={getItemId(item)}
            className={`rounded-[16px] border px-4 py-3 transition ${
              disabled
                ? "border-[#d9d2cb] bg-[#f6f3ef] text-[#8f8377]"
                : inactive
                  ? "border-[#e7d3c7] bg-[#fff7f2] text-[#9b8678]"
                  : "border-[#e3dad2] bg-white text-[#2b221d] shadow-[0_6px_16px_rgba(35,22,12,0.04)]"
            }`}
            title={inactive ? "This area is inactive and not visible to customers" : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-[#241c17]">
                  {getAreaName(item)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {getAreaPostCode(item) ? (
                    <span className="inline-flex min-h-[24px] items-center rounded-full bg-[#f7f1eb] px-2.5 text-[11px] font-semibold text-[#6f6258]">
                      Postcode {getAreaPostCode(item)}
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex min-h-[24px] items-center rounded-full px-2.5 text-[11px] font-bold uppercase tracking-[0.08em] ${
                      inactive
                        ? "bg-[#f4dfd2] text-[#a0674a]"
                        : "bg-[#eef8f0] text-[#2f8a4b]"
                    }`}
                  >
                    {inactive ? "Inactive" : "Active"}
                  </span>
                </div>
              </div>

              <button
                className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full border px-3 text-[12px] font-bold transition ${
                  disabled
                    ? "cursor-not-allowed border-[#ddd5ce] bg-[#f6f3ef] text-[#9b8f84]"
                    : "cursor-pointer border-[#ead7cf] bg-[#fff7f3] text-[#b45e39] hover:border-[#d9b9a8] hover:bg-[#fff1ea]"
                }`}
                disabled={disabled}
                onClick={() => onRemove(getItemId(item))}
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
