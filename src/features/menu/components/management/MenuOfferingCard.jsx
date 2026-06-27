import { Copy, Pencil, Trash2 } from "lucide-react";

const toneClasses = {
  active: "bg-[#2fca52] text-white",
  paused: "bg-[#ffd86f] text-[#8a6200]",
  draft: "bg-[#dbe7ff] text-[#6d84d6]",
};

export default function MenuOfferingCard({
  actionsDisabled = false,
  item,
  onDelete,
  onEdit,
  onView,
  onDuplicate,
  onToggleStatus,
}) {
  const isActive = item.status === "Active";

  return (
    <article className="overflow-hidden rounded-[14px] border border-[#ddd4cb] bg-white shadow-[0_2px_10px_rgba(43,30,20,0.03)]">
      <div className="relative h-[126px] bg-[#ece7e2]">
        <img alt={item.title} className="h-full w-full object-cover" src={item.image} />
        <span
          className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[12px] font-bold ${
            isActive
              ? "bg-white text-[#2a211b]"
              : item.status === "Paused" || item.status === "Pause"
                ? "bg-[#ffa800] text-white"
                : "bg-white text-[#2a211b]"
          }`}
        >
          {item.status === "Paused" ? "Pause" : item.status}
        </span>
        <span className="absolute right-2 top-2 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-[#2a211b]">
          {item.badge}
        </span>
      </div>

      <div className="p-3.5">
        <h3 className="m-0 type-h4 text-[#17120e]">{item.title}</h3>
        <p className="mt-2 min-h-[56px] text-[14px] font-medium leading-[1.5] text-[#7d7064]">
          {item.description}
        </p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <strong className="block text-[21px] font-extrabold text-[#17120e]">
              {item.price}
            </strong>
            <span className="mt-1 block text-[13px] font-medium text-[#9a8f86]">
              {item.meta}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-[#eee6df] pt-3">
          <div className="flex items-center gap-5">
            <button
              className="flex flex-col items-center gap-1 cursor-pointer text-[#8d8075] transition hover:text-[#17120e] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={actionsDisabled}
              onClick={() => onEdit(item)}
              type="button"
            >
              <Pencil size={18} />
              <span className="text-[11px] font-bold">Edit</span>
            </button>

            <button
              className="flex flex-col items-center gap-1 cursor-pointer text-[#8d8075] transition hover:text-[#17120e] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={actionsDisabled}
              onClick={() => onDuplicate(item)}
              type="button"
            >
              <Copy size={18} />
              <span className="text-[11px] font-bold">Duplicate</span>
            </button>

            <button
              className="flex flex-col items-center gap-1 cursor-pointer text-[#8d8075] transition hover:text-[#ff2918] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={actionsDisabled}
              onClick={() => onDelete(item)}
              type="button"
            >
              <Trash2 size={18} />
              <span className="text-[11px] font-bold">Delete</span>
            </button>
          </div>

          <button
            onClick={() => onToggleStatus(item)}
            type="button"
            disabled={actionsDisabled}
            className={`relative flex items-center h-[28px] w-[76px] rounded-full transition-colors duration-200 focus:outline-none ${
              isActive ? "bg-[#00c82a]" : "bg-[#ffa800]"
            } ${actionsDisabled ? "cursor-not-allowed opacity-45" : ""}`}
          >
            <span
              className={`absolute top-[2px] h-[24px] w-[24px] rounded-full bg-white transition-all duration-200 shadow-sm ${
                isActive ? "left-[50px]" : "left-[2px]"
              }`}
            />
            <span
              className={`w-full text-[11px] font-bold text-white select-none transition-all duration-200 ${
                isActive ? "text-left pl-3.5" : "text-right pr-3.5"
              }`}
            >
              {isActive ? "Active" : "Pause"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
