export default function DeliverySchedulePicker({ days, activeDays, onToggleDay }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {days.map((day) => {
        const isActive = activeDays.includes(day);

        return (
          <button
            key={day}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-bold transition duration-150 ${
              isActive
                ? "border-[#ef8b5d] bg-[#fff1ea] text-[#d16d3a]"
                : "border-[#bdb6af] bg-[#d9d9d9] text-[#5d5650]"
            }`}
            onClick={() => onToggleDay(day)}
            type="button"
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}
