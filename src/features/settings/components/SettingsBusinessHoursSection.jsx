import SettingsSectionCard from "./SettingsSectionCard";
import SettingsSelectField from "./SettingsSelectField";

const timeOptions = [
  { value: "08:00-12:00", label: "08:00 AM - 12:00 PM" },
  { value: "09:00-05:00", label: "09:00 AM - 05:00 PM" },
  { value: "10:00-06:00", label: "10:00 AM - 06:00 PM" },
  { value: "Closed", label: "Closed" },
];

export default function SettingsBusinessHoursSection({
  hours,
  onToggleDay,
  onChangeTime,
}) {
  return (
    <SettingsSectionCard
      description="Set your general business hours. These will show to customers."
      title="Business Hours"
    >
      <div className="space-y-2">
        {hours.map((item) => (
          <div
            key={item.day}
            className="flex items-center gap-3 rounded-[8px] border border-[#e8dfd7] bg-[#fffdfb] px-3 py-2 max-[760px]:flex-col max-[760px]:items-stretch"
          >
            <button
              className="flex min-w-[110px] cursor-pointer items-center gap-2 text-left text-[14px] font-semibold text-[#2b221d]"
              onClick={() => onToggleDay(item.day)}
              type="button"
            >
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                  item.enabled ? "border-[#d96e39]" : "border-[#bdb2a9]"
                }`}
              >
                {item.enabled ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d96e39]" />
                ) : null}
              </span>
              {item.day}
            </button>

            <div className="grid flex-1 grid-cols-2 gap-3 max-[760px]:grid-cols-1">
              <SettingsSelectField
                disabled={!item.enabled}
                label=""
                onChange={(event) => onChangeTime(item.day, "open", event.target.value)}
                options={timeOptions}
                placeholder="Opening hours"
                value={item.open}
              />
              <SettingsSelectField
                disabled={!item.enabled}
                label=""
                onChange={(event) => onChangeTime(item.day, "close", event.target.value)}
                options={timeOptions}
                placeholder="Closing hours"
                value={item.close}
              />
            </div>
          </div>
        ))}
      </div>
    </SettingsSectionCard>
  );
}
