import { Eye, Pencil, Trash2 } from "lucide-react";

const toneClasses = {
  active: "bg-[#2fca52] text-white",
  paused: "bg-[#ffd86f] text-[#8a6200]",
  draft: "bg-[#dbe7ff] text-[#6d84d6]",
};

export default function MenuOfferingCard({ item, onDelete, onEdit, onView }) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-[#ddd4cb] bg-white shadow-[0_2px_10px_rgba(43,30,20,0.03)]">
      <div className="relative h-[126px] bg-[#ece7e2]">
        <img alt={item.title} className="h-full w-full object-cover" src={item.image} />
        <span className="absolute left-2 top-2 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-[#2a211b]">
          {item.status}
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

          <span
            className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${
              toneClasses[item.tone]
            }`}
          >
            {item.status}
          </span>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-[#eee6df] pt-2.5">
          <div className="flex items-center gap-3.5">
            <button
              className="cursor-pointer text-[#8d8075] hover:text-[#17120e] active:scale-90 transition"
              onClick={() => onView(item)}
              type="button"
            >
              <Eye size={19} />
            </button>
            <button
              className="cursor-pointer text-[#d96e39] hover:text-[#c75e2c] active:scale-90 transition"
              onClick={() => onEdit(item)}
              type="button"
            >
              <Pencil size={19} />
            </button>
            <button
              className="cursor-pointer text-[#8d8075] hover:text-[#ff2918] active:scale-90 transition"
              onClick={() => onDelete(item)}
              type="button"
            >
              <Trash2 size={19} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
