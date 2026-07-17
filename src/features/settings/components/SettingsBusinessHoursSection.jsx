import SettingsSectionCard from "./SettingsSectionCard";
import SettingsSelectField from "./SettingsSelectField";

const timeOptions = Array.from({ length: 24 }, (_, index) => {
  const value = `${String(index).padStart(2, "0")}:00`;

  return {
    value,
    label: value,
  };
});

function getCloseOptions(openValue) {
  const openIndex = timeOptions.findIndex((option) => option.value === openValue);

  if (openIndex === -1) {
    return timeOptions;
  }

  return timeOptions.slice(openIndex + 1);
}

export default function SettingsBusinessHoursSection({
  hours,
  onToggleDay,
  onChangeTime,
  disabled = false,
}) {
  return (
    <SettingsSectionCard
      description="Set your general store opening hours. These are shown on your profile and do not control customer delivery slot selection."
      title="Business Hours"
    >
      <div className="divide-y divide-[#eee7df]">
        {hours.map((item) => (
          (() => {
            const closeOptions = getCloseOptions(item.open);

            return (
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
                  options={timeOptions}
                  placeholder="Open"
                  value={item.open}
                />
              </div>
              <span className="px-1 font-semibold text-[#8a7c70]">-</span>
              <div className="w-[160px]">
                <SettingsSelectField
                  disabled={disabled || !item.enabled || !closeOptions.length}
                  label=""
                  onChange={(event) => onChangeTime(item.day, "close", event.target.value)}
                  options={closeOptions}
                  placeholder="Close"
                  value={item.close}
                />
              </div>
            </div>
          </div>
            );
          })()
        ))}
      </div>
    </SettingsSectionCard>
  );
}
