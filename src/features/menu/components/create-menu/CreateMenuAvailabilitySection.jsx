import CreateMenuSectionCard from "./CreateMenuSectionCard";
import { Label, SelectInput, TextInput } from "./CreateMenuFields";

export default function CreateMenuAvailabilitySection({
  availabilityDays,
  blackoutDate,
  customDietary,
  disabled = false,
  dietaryOptions,
  leadTime,
  leadTimeOptions,
  onBlackoutDateChange,
  onCustomDietaryChange,
  onLeadTimeChange,
  selectedDays,
  selectedDietary,
  toggleDay,
  toggleDietary,
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
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border text-[12px] font-semibold transition ${
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

        <div className="mt-4 grid grid-cols-2 gap-3">
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
          <div>
            <Label>Blackout date</Label>
            <TextInput
              disabled={disabled}
              onChange={onBlackoutDateChange}
              placeholder="Select date to exclude..."
              value={blackoutDate}
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
              className={`cursor-pointer rounded-full border px-3 py-[8px] text-[12px] font-semibold transition ${
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

        <div className="mt-3">
          <Label>Custom Dietary</Label>
          <TextInput
            disabled={disabled}
            onChange={onCustomDietaryChange}
            placeholder="Type and enter..."
            value={customDietary}
          />
        </div>
      </div>
    </CreateMenuSectionCard>
  );
}
