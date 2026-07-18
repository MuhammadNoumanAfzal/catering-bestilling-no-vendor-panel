import SettingsBusinessHoursSection from "./SettingsBusinessHoursSection";
import SettingsSpecialClosuresSection from "./SettingsSpecialClosuresSection";
import SettingsSectionCard from "./SettingsSectionCard";
import SettingsSelectField from "./SettingsSelectField";
import SettingsTextField from "./SettingsTextField";
import SettingsToggleRow from "./SettingsToggleRow";

export default function SettingsBusinessProfilePanel({
  businessTypeOptions,
  closureTypeOptions,
  cuisineOptions,
  currencyOptions,
  disabled = false,
  handleBusinessHourChange,
  handleDeactivateStore,
  handleDeleteStore,
  handleFieldChange,
  handleNotificationToggle,
  handleResetAllSettings,
  handleToggleBusinessDay,
  languageOptions,
  settings,
  handleSaveClosure,
  handleDeleteClosure,
  timeZoneOptions,
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(260px,0.78fr)] gap-4 max-[1120px]:grid-cols-1">
      <div className="flex min-w-0 flex-col gap-3">
        <SettingsSectionCard
          description="Update how your brand and customers see your business."
          title="Business Information"
        >
          <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            <SettingsTextField
              disabled={disabled}
              label="Business Name"
              onChange={handleFieldChange("businessName")}
              placeholder="Enter business name"
              value={settings.businessName}
            />
            <SettingsTextField
              disabled={disabled}
              label="Business Email"
              onChange={handleFieldChange("businessEmail")}
              placeholder="Enter business email"
              value={settings.businessEmail}
            />
            <SettingsTextField
              disabled={disabled}
              label="Phone Number"
              onChange={handleFieldChange("phoneNumber")}
              placeholder="Enter phone number"
              value={settings.phoneNumber}
            />
            <SettingsTextField
              disabled={disabled}
              label="Business Address"
              onChange={handleFieldChange("businessAddress")}
              placeholder="Enter business address"
              value={settings.businessAddress}
            />
            <SettingsTextField
              disabled
              label="Postal Code"
              onChange={handleFieldChange("postalCode")}
              placeholder="Enter postal code"
              value={settings.postalCode}
            />
          </div>

          <div className="mt-3">
            <SettingsTextField
              disabled={disabled}
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
            <div className="flex flex-col gap-3">
              <SettingsSelectField
                disabled={disabled}
                label="Cuisine Type"
                onChange={handleFieldChange("cuisineType")}
                options={cuisineOptions}
                placeholder="Select cuisine"
                value={settings.cuisineType}
              />
              {settings.customCuisineType || settings.cuisineType === "Custom" ? (
                <SettingsTextField
                  disabled={disabled}
                  label="Custom Cuisine"
                  onChange={handleFieldChange("customCuisineType")}
                  placeholder="Enter custom cuisine"
                  value={settings.customCuisineType || ""}
                />
              ) : null}
            </div>
            <div className="flex flex-col gap-3">
              <SettingsSelectField
                disabled={disabled}
                label="Business Type"
                onChange={handleFieldChange("businessType")}
                options={businessTypeOptions}
                placeholder="Select business type"
                value={settings.businessType}
              />
              {settings.customBusinessType || settings.businessType === "Custom" ? (
                <SettingsTextField
                  disabled={disabled}
                  label="Custom Business Type"
                  onChange={handleFieldChange("customBusinessType")}
                  placeholder="Enter custom business type"
                  value={settings.customBusinessType || ""}
                />
              ) : null}
            </div>
            <SettingsTextField
              disabled={disabled}
              label="Established Year (Optional)"
              onChange={handleFieldChange("establishedYear")}
              placeholder="Enter year"
              value={settings.establishedYear}
            />
            <SettingsTextField
              disabled={disabled}
              label="Tax / Organization Number (Optional)"
              onChange={handleFieldChange("taxId")}
              placeholder="Enter number"
              value={settings.taxId}
            />
          </div>
        </SettingsSectionCard>

        <SettingsBusinessHoursSection
          disabled={disabled}
          hours={settings.hours}
          onChangeTime={handleBusinessHourChange}
          onToggleDay={handleToggleBusinessDay}
        />

        <div id="special-closures-section">
          <SettingsSpecialClosuresSection
            closureTypeOptions={closureTypeOptions}
            closures={settings.closures}
            disabled={disabled}
            onAddOrUpdateClosure={handleSaveClosure}
            onDeleteClosure={handleDeleteClosure}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <SettingsSectionCard
          description="Choose which alerts and updates you want to receive."
          title="Notification Preferences"
        >
          <SettingsToggleRow
            checked={settings.notifications.newOrder}
            disabled={disabled}
            helper="Receive instant alerts when a new order comes in."
            label="New Order"
            onToggle={() => handleNotificationToggle("newOrder")}
          />
          <SettingsToggleRow
            checked={settings.notifications.orderUpdates}
            disabled={disabled}
            helper="Know when the status of orders changes."
            label="Order Updates"
            onToggle={() => handleNotificationToggle("orderUpdates")}
          />
          <SettingsToggleRow
            checked={settings.notifications.reviewsRatings}
            disabled={disabled}
            helper="Get notified when a customer leaves feedback."
            label="Reviews & Ratings"
            onToggle={() => handleNotificationToggle("reviewsRatings")}
          />
          <SettingsToggleRow
            checked={settings.notifications.promos_tips}
            disabled={disabled}
            helper="Receive business insights and platform tips."
            label="Promotions & Tips"
            onToggle={() => handleNotificationToggle("promos_tips")}
          />
          <SettingsToggleRow
            checked={settings.notifications.emailNotifications}
            disabled={disabled}
            helper="Receive important updates in your email inbox."
            label="Email Notifications"
            onToggle={() => handleNotificationToggle("emailNotifications")}
          />
          <SettingsToggleRow
            checked={settings.notifications.pushNotifications}
            disabled={disabled}
            helper="Receive push alerts on supported devices."
            label="Push Notifications"
            onToggle={() => handleNotificationToggle("pushNotifications")}
          />
          <SettingsToggleRow
            checked={settings.notifications.smsNotifications}
            disabled={disabled}
            helper="Receive important alerts by SMS."
            label="SMS Notifications"
            onToggle={() => handleNotificationToggle("smsNotifications")}
          />
        </SettingsSectionCard>

        <SettingsSectionCard description="" title="Language & Region">
          <div className="space-y-3">
            <SettingsSelectField
              disabled={disabled}
              label="Language"
              onChange={handleFieldChange("language")}
              options={languageOptions}
              placeholder="Select language"
              value={settings.language}
            />
            <SettingsSelectField
              disabled={disabled}
              label="Region / Currency"
              onChange={handleFieldChange("currency")}
              options={currencyOptions}
              placeholder="Select currency"
              value={settings.currency}
            />
            <SettingsSelectField
              disabled={disabled}
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
                className="cursor-pointer rounded-[6px] border border-[#d7cfc7] bg-white px-3 py-1.5 text-[10px] font-bold text-[#2b221d] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
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
                className="cursor-pointer rounded-[6px] border border-[#f0c8bf] bg-[#fff3ef] px-3 py-1.5 text-[10px] font-bold text-[#d96e39] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
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
                className="cursor-pointer rounded-[6px] border border-[#f1c2b6] bg-[#fff1ee] px-3 py-1.5 text-[10px] font-bold text-[#d2542f] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
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
