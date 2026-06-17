import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label, SelectInput, TextInput, ToggleSwitch } from "./CreateMenuFields";

export default function CreateMenuAvailabilitySection({
  availabilityDays,
  disabled = false,
  dietaryOptions,
  leadTime,
  leadTimeOptions,
  onLeadTimeChange,
  selectedDays,
  selectedDietary,
  toggleDay,
  toggleDietary,
  hasAvailabilityWindow,
  onHasAvailabilityWindowChange,
  availabilityStart,
  onAvailabilityStartChange,
  availabilityEnd,
  onAvailabilityEndChange,
}) {
  return (
    <CreateMenuSectionCard
      description="General details about this catering package."
      title="Availability"
    >
      <div>
        <div className="flex flex-wrap gap-3">
          {availabilityDays.map((day) => {
            const isActive = selectedDays.includes(day);

            return (
              <button
                key={day}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-[13px] font-bold transition ${
                  isActive
                    ? "border-[#cf6e38] bg-[#fff0e9] text-[#cf6e38]"
                    : "border-[#bdb2a9] bg-white text-[#29211d]"
                } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                disabled={disabled}
                onClick={() => toggleDay(day)}
                type="button"
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <div>
            <Label>Min. Lead Time (Days)</Label>
            <SelectInput
              disabled={disabled}
              onChange={onLeadTimeChange}
              options={leadTimeOptions}
              placeholder="24"
              value={leadTime}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-[#e7ded6] pt-4">
        <Label>Dietary Tags</Label>
        <div className="flex flex-wrap gap-2">
          {dietaryOptions.map((tag) => {
            const isActive = selectedDietary.includes(tag);

            return (
              <button
                key={tag}
              className={`cursor-pointer rounded-full border px-3 py-[8px] text-[13px] font-semibold transition ${
                  isActive
                    ? "border-[#cf6e38] bg-[#fff0e9] text-[#cf6e38]"
                    : "border-[#bdb2a9] bg-white text-[#29211d]"
                } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                disabled={disabled}
                onClick={() => toggleDietary(tag)}
                type="button"
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 border-t border-[#e7ded6] pt-4">
        <span className="mb-1 block text-[14px] font-bold text-[#211913]">
          Delivery Availability Window (Optional)
        </span>
        <p className="mb-3 text-[12px] font-medium text-[#746a62] leading-tight">
          Choose the date range when customers can order this menu for delivery.
        </p>

        <div className="mb-4">
          <ToggleSwitch
            checked={hasAvailabilityWindow}
            disabled={disabled}
            onChange={onHasAvailabilityWindowChange}
            label="Enable Availability Window"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <span className="mb-1 block text-[11px] font-bold text-[#7b6d62] uppercase tracking-wide">
              Available From
            </span>
            <TextInput
              disabled={disabled || !hasAvailabilityWindow}
              onChange={onAvailabilityStartChange}
              placeholder="Select start date..."
              type="date"
              value={availabilityStart}
            />
          </div>
          <span className="mt-5 text-[#9a8e85] font-bold">—</span>
          <div className="flex-1">
            <span className="mb-1 block text-[11px] font-bold text-[#7b6d62] uppercase tracking-wide">
              Available Until
            </span>
            <TextInput
              disabled={disabled || !hasAvailabilityWindow}
              onChange={onAvailabilityEndChange}
              placeholder="Select end date..."
              type="date"
              value={availabilityEnd}
            />
          </div>
        </div>
      </div>
    </CreateMenuSectionCard>
  );
}
