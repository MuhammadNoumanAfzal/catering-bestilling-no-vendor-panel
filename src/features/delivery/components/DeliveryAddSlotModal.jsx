import { X } from "lucide-react";
import { deliveryDays } from "../data/deliveryData";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hours = String(Math.floor(index / 4)).padStart(2, "0");
  const minutes = String((index % 4) * 15).padStart(2, "0");
  return `${hours}:${minutes}`;
});

export default function DeliveryAddSlotModal({
  activeDays = [],
  draftSlot,
  onClose,
  onDraftChange,
  onSave,
  error = "",
}) {
  const selectableDays = deliveryDays.filter((day) => activeDays.includes(day.value));
  const isReadyToSave = draftSlot.day && draftSlot.start && draftSlot.end;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6">
      <div
        aria-modal="true"
        className="w-full max-w-[460px] rounded-[14px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)]"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="type-subpara m-0 text-[#d86f39]">Custom Time Slot</p>
            <h2 className="type-h4 mt-1 text-[#1c1510]">Add delivery slot</h2>
          </div>
          <button
            className="cursor-pointer text-[#473d36]"
            onClick={onClose}
            type="button"
          >
            <X size={16} />
          </button>
        </div>

        <p className="type-para mt-3 text-[#6f6258]">
          Enter the delivery time range you want customers to choose from.
        </p>

        <label className="mt-4 flex flex-col gap-1">
          <span className="type-para text-[#1a1410]">Delivery day</span>
          <select
            autoFocus
            className={`type-para h-[42px] rounded-[8px] border bg-white px-3 text-[#201712] outline-none transition focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
              error ? "border-[#d25545]" : "border-[#cec5bd]"
            }`}
            onChange={(event) => onDraftChange({
              ...draftSlot,
              day: event.target.value,
            })}
            value={draftSlot.day}
          >
            {selectableDays.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 flex flex-col gap-1">
          <span className="type-para text-[#1a1410]">Delivery time slot</span>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="type-subpara text-[#6f6258]">Start time</span>
              <select
                className={`type-para h-[42px] rounded-[8px] border bg-white px-3 text-[#201712] outline-none transition focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
                  error ? "border-[#d25545]" : "border-[#cec5bd]"
                }`}
                onChange={(event) => onDraftChange({
                  ...draftSlot,
                  start: event.target.value,
                })}
                value={draftSlot.start}
              >
                <option value="">Select time</option>
                {TIME_OPTIONS.map((timeOption) => (
                  <option key={timeOption} value={timeOption}>
                    {timeOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="type-subpara text-[#6f6258]">End time</span>
              <select
                className={`type-para h-[42px] rounded-[8px] border bg-white px-3 text-[#201712] outline-none transition focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] ${
                  error ? "border-[#d25545]" : "border-[#cec5bd]"
                }`}
                onChange={(event) => onDraftChange({
                  ...draftSlot,
                  end: event.target.value,
                })}
                value={draftSlot.end}
              >
                <option value="">Select time</option>
                {TIME_OPTIONS.map((timeOption) => (
                  <option key={timeOption} value={timeOption}>
                    {timeOption}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error ? (
            <span className="type-subpara text-[#d25545]">{error}</span>
          ) : null}
        </label>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="type-subpara cursor-pointer rounded-[8px] border border-[#cfc7bf] bg-white px-4 py-[9px] text-[#241c17]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="type-subpara cursor-pointer rounded-[8px] bg-[#de6f39] px-4 py-[9px] text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isReadyToSave}
            onClick={onSave}
            type="button"
          >
            Add Slot
          </button>
        </div>
      </div>
    </div>
  );
}
