import SettingsSectionCard from "./SettingsSectionCard";
import SettingsSelectField from "./SettingsSelectField";

const timeOptions = [
  { value: "08:00-12:00", label: "08:00 - 12:00" },
  { value: "13:00-17:00", label: "13:00 - 17:00" },
  { value: "09:00-17:00", label: "09:00 - 17:00" },
  { value: "10:00-18:00", label: "10:00 - 18:00" },
  { value: "08:00-16:00", label: "08:00 - 16:00" },
  { value: "12:00-20:00", label: "12:00 - 20:00" },
  { value: "Closed", label: "Closed" },
];

export default function SettingsBusinessHoursSection({
  hours,
  onToggleDay,
  onChangeTime,
  disabled = false,
  options = timeOptions,
}) {
  return (
    <SettingsSectionCard
      description="Set your general business hours. These will show to customers."
      title="Business Hours"
    >
      <div className="divide-y divide-[#eee7df]">
        {hours.map((item) => (
          <div
            key={item.day}
            className="flex items-center justify-between gap-4 py-3 max-[760px]:flex-col max-[760px]:items-stretch"
          >
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onToggleDay(item.day)}
                className={`relative inline-flex h-5 w-[38px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.enabled ? "bg-[#cf6e38]" : "bg-[#bdb2a9]"
                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.enabled ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
              <span className={`text-[14px] font-bold ${item.enabled ? "text-[#2b221d]" : "text-[#8a7c70]"}`}>
                {item.day}
              </span>
            </div>

            <div className="flex items-center gap-2 max-[760px]:justify-between">
              <div className="w-[160px]">
                <SettingsSelectField
                  disabled={disabled || !item.enabled}
                  label=""
                  onChange={(event) => onChangeTime(item.day, "open", event.target.value)}
                  options={options}
                  placeholder="Select hours"
                  value={item.open}
                />
              </div>
              <span className="px-1 font-semibold text-[#8a7c70]">-</span>
              <div className="w-[160px]">
                <SettingsSelectField
                  disabled={disabled || !item.enabled}
                  label=""
                  onChange={(event) => onChangeTime(item.day, "close", event.target.value)}
                  options={options}
                  placeholder="Select hours"
                  value={item.close}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingsSectionCard>
  );
}
