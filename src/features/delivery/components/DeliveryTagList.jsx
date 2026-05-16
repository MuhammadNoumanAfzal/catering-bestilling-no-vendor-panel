export default function DeliveryTagList({ items }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="type-subpara inline-flex items-center rounded-full border border-[#b9b1aa] bg-white px-3 py-[7px] text-[#2b221d]"
        >
          {item} ×
        </span>
      ))}
    </div>
  );
}
