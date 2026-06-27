export default function DeliverySchedulePicker({
  days,
  activeDays,
  onToggleDay,
  disabled = false,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {days.map((day) => {
        const dayValue = typeof day === "string" ? day : day.value;
        const dayLabel = typeof day === "string" ? day : day.label;
        const isActive = activeDays.includes(dayValue);

        return (
          <button
            key={dayValue}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold transition duration-150 ${
              isActive
                ? "border-[#ef8b5d] bg-[#fff1ea] text-[#d16d3a]"
                : "border-[#bdb6af] bg-[#d9d9d9] text-[#5d5650]"
            } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
            disabled={disabled}
            onClick={() => onToggleDay(dayValue)}
            type="button"
          >
            {dayLabel}
          </button>
        );
      })}
    </div>
  );
}
