import SettingsBusinessHoursSection from "./SettingsBusinessHoursSection";
import SettingsSectionCard from "./SettingsSectionCard";
import SettingsSelectField from "./SettingsSelectField";
import SettingsTextField from "./SettingsTextField";
import SettingsToggleRow from "./SettingsToggleRow";

const cuisineOptions = [
  { value: "Italian", label: "Italian" },
  { value: "Asian Fusion", label: "Asian Fusion" },
  { value: "Middle Eastern", label: "Middle Eastern" },
];

const businessTypeOptions = [
  { value: "Catering Business", label: "Catering Business" },
  { value: "Cloud Kitchen", label: "Cloud Kitchen" },
  { value: "Restaurant", label: "Restaurant" },
];

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Norwegian", label: "Norwegian" },
];

const currencyOptions = [
  { value: "Norway (NOK)", label: "Norway (NOK)" },
  { value: "Euro (EUR)", label: "Euro (EUR)" },
];

const timeZoneOptions = [
  { value: "GMT +01:00", label: "GMT +01:00" },
  { value: "GMT +00:00", label: "GMT +00:00" },
];

export default function SettingsBusinessProfilePanel({
  handleBusinessHourChange,
  handleDeactivateStore,
  handleDeleteStore,
  handleFieldChange,
  handleNotificationToggle,
  handleResetAllSettings,
  handleToggleBusinessDay,
  settings,
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(260px,0.78fr)] gap-4 max-[1120px]:grid-cols-1">
      <div className="flex flex-col gap-3">
        <SettingsSectionCard
          description="Update how your brand and customers see your business."
          title="Business Information"
        >
          <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            <SettingsTextField
              label="Business Name"
              onChange={handleFieldChange("businessName")}
              placeholder="Enter business name"
              value={settings.businessName}
            />
            <SettingsTextField
              label="Business Email"
              onChange={handleFieldChange("businessEmail")}
              placeholder="Enter business email"
              value={settings.businessEmail}
            />
            <SettingsTextField
              label="Phone Number"
              onChange={handleFieldChange("phoneNumber")}
              placeholder="Enter phone number"
              value={settings.phoneNumber}
            />
            <SettingsTextField
              label="Business Address"
              onChange={handleFieldChange("businessAddress")}
              placeholder="Enter business address"
              value={settings.businessAddress}
            />
          </div>

          <div className="mt-3">
            <SettingsTextField
              label="Business Description"
              multiline
              onChange={handleFieldChange("businessDescription")}
              placeholder="Describe your business"
              value={settings.businessDescription}
            />
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          description="Set up your business operating details."
          title="Operating Information"
        >
          <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            <SettingsSelectField
              label="Cuisine Type"
              onChange={handleFieldChange("cuisineType")}
              options={cuisineOptions}
              placeholder="Select cuisine"
              value={settings.cuisineType}
            />
            <SettingsSelectField
              label="Business Type"
              onChange={handleFieldChange("businessType")}
              options={businessTypeOptions}
              placeholder="Select business type"
              value={settings.businessType}
            />
            <SettingsTextField
              label="Established Year (Optional)"
              onChange={handleFieldChange("establishedYear")}
              placeholder="Enter year"
              value={settings.establishedYear}
            />
            <SettingsTextField
              label="Tax / Organization Number (Optional)"
              onChange={handleFieldChange("taxId")}
              placeholder="Enter number"
              value={settings.taxId}
            />
          </div>
        </SettingsSectionCard>

        <SettingsBusinessHoursSection
          hours={settings.hours}
          onChangeTime={handleBusinessHourChange}
          onToggleDay={handleToggleBusinessDay}
        />
      </div>

      <div className="flex flex-col gap-3">
        <SettingsSectionCard
          description="Choose which alerts and updates you want to receive."
          title="Notification Preferences"
        >
          <SettingsToggleRow
            checked={settings.notifications.newOrder}
            helper="Receive instant alerts when a new order comes in."
            label="New Order"
            onToggle={() => handleNotificationToggle("newOrder")}
          />
          <SettingsToggleRow
            checked={settings.notifications.orderUpdates}
            helper="Know when the status of orders changes."
            label="Order Updates"
            onToggle={() => handleNotificationToggle("orderUpdates")}
          />
          <SettingsToggleRow
            checked={settings.notifications.reviewsRatings}
            helper="Get notified when a customer leaves feedback."
            label="Reviews & Ratings"
            onToggle={() => handleNotificationToggle("reviewsRatings")}
          />
          <SettingsToggleRow
            checked={settings.notifications.promosTips}
            helper="Receive business insights and platform tips."
            label="Promotions & Tips"
            onToggle={() => handleNotificationToggle("promosTips")}
          />
          <SettingsToggleRow
            checked={settings.notifications.emailNotifications}
            helper="Receive important updates in your email inbox."
            label="Email Notifications"
            onToggle={() => handleNotificationToggle("emailNotifications")}
          />
        </SettingsSectionCard>

        <SettingsSectionCard description="" title="Language & Region">
          <div className="space-y-3">
            <SettingsSelectField
              label="Language"
              onChange={handleFieldChange("language")}
              options={languageOptions}
              placeholder="Select language"
              value={settings.language}
            />
            <SettingsSelectField
              label="Region / Currency"
              onChange={handleFieldChange("currency")}
              options={currencyOptions}
              placeholder="Select currency"
              value={settings.currency}
            />
            <SettingsSelectField
              label="Time Zone"
              onChange={handleFieldChange("timeZone")}
              options={timeZoneOptions}
              placeholder="Select time zone"
              value={settings.timeZone}
            />
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          description="These actions are permanent and cannot be undone."
          title="Danger Zone"
          tone="danger"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[#f0dfd3] bg-white px-3 py-3">
              <div>
                <p className="text-[12px] font-bold text-[#201914]">Reset All Settings</p>
                <p className="mt-1 text-[11px] text-[#8a7c70]">
                  Return all settings to their default values.
                </p>
              </div>
              <button
                className="cursor-pointer rounded-[6px] border border-[#d7cfc7] bg-white px-3 py-1.5 text-[10px] font-bold text-[#2b221d]"
                onClick={handleResetAllSettings}
                type="button"
              >
                Reset
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[#f0dfd3] bg-white px-3 py-3">
              <div>
                <p className="text-[12px] font-bold text-[#201914]">Deactivate Store</p>
                <p className="mt-1 text-[11px] text-[#8a7c70]">
                  Temporarily hide your store from customers.
                </p>
              </div>
              <button
                className="cursor-pointer rounded-[6px] border border-[#f0c8bf] bg-[#fff3ef] px-3 py-1.5 text-[10px] font-bold text-[#d96e39]"
                onClick={handleDeactivateStore}
                type="button"
              >
                Deactivate
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[#f0dfd3] bg-white px-3 py-3">
              <div>
                <p className="text-[12px] font-bold text-[#201914]">Delete Store</p>
                <p className="mt-1 text-[11px] text-[#8a7c70]">
                  Permanently remove your store data.
                </p>
              </div>
              <button
                className="cursor-pointer rounded-[6px] border border-[#f1c2b6] bg-[#fff1ee] px-3 py-1.5 text-[10px] font-bold text-[#d2542f]"
                onClick={handleDeleteStore}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </SettingsSectionCard>
      </div>
    </div>
  );
}
