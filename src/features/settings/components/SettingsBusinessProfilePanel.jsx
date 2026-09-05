import SettingsSpecialClosuresSection from "./SettingsSpecialClosuresSection";
import SettingsSectionCard from "./SettingsSectionCard";
import SettingsSelectField from "./SettingsSelectField";
import SettingsTextField from "./SettingsTextField";
import SettingsToggleRow from "./SettingsToggleRow";
import { useTranslation } from "react-i18next";
import { getCurrentYear, getTodayDateValue, sanitizeYearInput } from "../../../utils/dateValidation";

const NORWAY_TIME_ZONE = "Europe/Oslo";

export default function SettingsBusinessProfilePanel({
  businessTypeOptions,
  closureTypeOptions,
  cuisineOptions,
  currencyOptions,
  disabled = false,
  fieldErrors = {},
  handleDeactivateStore,
  handleDeleteStore,
  handleFieldChange,
  handleNotificationToggle,
  handleResetAllSettings,
  handleSave,
  hasUnsavedChanges = false,
  isSaving = false,
  settings,
  handleSaveClosure,
  handleDeleteClosure,
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)] items-start gap-3 max-[1120px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-3">
          <SettingsSectionCard
            description={t("settings.businessInfoDescription", { defaultValue: "Update how your brand and customers see your business." })}
            title={t("settings.businessInfo", { defaultValue: "Business Information" })}
          >
            <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
              <SettingsTextField
                disabled={disabled}
                label={t("settings.businessName")}
                onChange={handleFieldChange("businessName")}
                placeholder="Enter business name"
                value={settings.businessName}
              />
              <SettingsTextField
                disabled={disabled}
                label={t("settings.businessEmail")}
                onChange={handleFieldChange("businessEmail")}
                placeholder="Enter business email"
                value={settings.businessEmail}
              />
              <SettingsTextField
                disabled={disabled}
                label={t("settings.phone")}
                onChange={handleFieldChange("phoneNumber")}
                placeholder="Enter phone number"
                value={settings.phoneNumber}
              />
              <SettingsTextField
                disabled={disabled}
                label={t("settings.address")}
                onChange={handleFieldChange("businessAddress")}
                placeholder="Enter business address"
                value={settings.businessAddress}
              />
              <SettingsTextField
                disabled={disabled}
                label={t("settings.companyId", { defaultValue: "Company ID Number" })}
                onChange={handleFieldChange("taxId")}
                placeholder="Enter company ID number"
                value={settings.taxId}
              />
              <SettingsTextField
                disabled={disabled}
                label={t("settings.city", { defaultValue: "City" })}
                onChange={handleFieldChange("payoutProfile.city")}
                placeholder="Enter city"
                value={settings.payoutProfile.city}
              />
              <SettingsTextField
                disabled
                label={t("settings.postalCode", { defaultValue: "Postal Code" })}
                onChange={handleFieldChange("postalCode")}
                placeholder="Enter postal code"
                value={settings.postalCode}
              />
            </div>

            <div className="mt-3">
              <SettingsTextField
                disabled={disabled}
                label={t("settings.businessDescription", { defaultValue: "Business Description" })}
                multiline
                onChange={handleFieldChange("businessDescription")}
                placeholder="Describe your business"
                value={settings.businessDescription}
              />
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            description={t("settings.operatingDescription", { defaultValue: "Set up your business operating details." })}
            title={t("settings.operatingInfo", { defaultValue: "Operating Information" })}
          >
            <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
              <div className="flex flex-col gap-3">
                <SettingsSelectField
                  disabled={disabled}
                  label={t("settings.cuisine", { defaultValue: "Cuisine Type" })}
                  onChange={handleFieldChange("cuisineType")}
                  options={cuisineOptions}
                  placeholder="Select cuisine"
                  value={settings.cuisineType}
                />
                {settings.customCuisineType || settings.cuisineType === "Custom" ? (
                  <SettingsTextField
                    disabled={disabled}
                    label={t("settings.customCuisine", { defaultValue: "Custom Cuisine" })}
                    onChange={handleFieldChange("customCuisineType")}
                    placeholder="Enter custom cuisine"
                    value={settings.customCuisineType || ""}
                  />
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
                <SettingsSelectField
                  disabled={disabled}
                  label={t("settings.businessType", { defaultValue: "Business Type" })}
                  onChange={handleFieldChange("businessType")}
                  options={businessTypeOptions}
                  placeholder="Select business type"
                  value={settings.businessType}
                />
                {settings.customBusinessType || settings.businessType === "Custom" ? (
                  <SettingsTextField
                    disabled={disabled}
                    label={t("settings.customBusinessType", { defaultValue: "Custom Business Type" })}
                    onChange={handleFieldChange("customBusinessType")}
                    placeholder="Enter custom business type"
                    value={settings.customBusinessType || ""}
                  />
                ) : null}
              </div>
              <SettingsTextField
                disabled={disabled}
                error={fieldErrors.establishedYear}
                label={`${t("settings.establishedYear", { defaultValue: "Established Year" })} (${t("settings.optional", { defaultValue: "Optional" })})`}
                inputMode="numeric"
                max={getCurrentYear()}
                maxLength={4}
                min="1900"
                onChange={(event) =>
                  handleFieldChange("establishedYear")({
                    ...event,
                    target: {
                      ...event.target,
                      value: sanitizeYearInput(event.target.value),
                    },
                  })
                }
                placeholder="Enter year"
                pattern="[0-9]{4}"
                type="number"
                value={settings.establishedYear}
              />
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            description={t("settings.payoutDescription", { defaultValue: "Add the bank details the platform should use when sending your manual payouts." })}
            title={t("settings.payoutDetails", { defaultValue: "Payout Bank Details" })}
          >
            <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
              <SettingsTextField disabled={disabled} label={t("settings.accountHolder", { defaultValue: "Account Holder Name" })} onChange={handleFieldChange("payoutProfile.accountHolderName")} placeholder="Enter account holder name" value={settings.payoutProfile.accountHolderName} />
              <SettingsTextField disabled={disabled} label={t("settings.bankName", { defaultValue: "Bank Name" })} onChange={handleFieldChange("payoutProfile.bankName")} placeholder="Enter bank name" value={settings.payoutProfile.bankName} />
              <SettingsTextField disabled={disabled} label={t("settings.accountNumber", { defaultValue: "Account Number" })} onChange={handleFieldChange("payoutProfile.accountNumber")} placeholder="Enter account number" value={settings.payoutProfile.accountNumber} />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#ecdccf] bg-[#fffdfb] px-4 py-3">
              <div><p className="text-[13px] font-semibold text-[#201914]">Payout review: {settings.payoutProfile.verificationStatus || "Pending review"}</p><p className="mt-1 text-[12px] text-[#7a6d63]">{settings.payoutProfile.bankDetailsVerified ? "Bank details confirmed" : "Waiting for admin confirmation"}</p></div>
              <button className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#d96e39] px-4 text-[12px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={disabled || isSaving || !hasUnsavedChanges} onClick={handleSave} type="button">{isSaving ? "Saving..." : "Save Bank Details"}</button>
            </div>
          </SettingsSectionCard>

          <div id="special-closures-section">
            <SettingsSpecialClosuresSection
              closureTypeOptions={closureTypeOptions}
              closures={settings.closures}
              disabled={disabled}
              minDate={getTodayDateValue()}
              onAddOrUpdateClosure={handleSaveClosure}
              onDeleteClosure={handleDeleteClosure}
            />
          </div>

        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <SettingsSectionCard
            description="Choose which alerts and updates you want to receive."
            title={t("settings.notifications")}
          >
            <SettingsToggleRow
              checked={settings.notifications.newOrder}
              disabled={disabled}
              helper="Receive instant alerts when a new order comes in."
              label={t("settings.newOrder", { defaultValue: "New Order" })}
              onToggle={() => handleNotificationToggle("newOrder")}
            />
            <SettingsToggleRow
              checked={settings.notifications.orderUpdates}
              disabled={disabled}
              helper="Know when the status of orders changes."
              label={t("settings.orderUpdates", { defaultValue: "Order Updates" })}
              onToggle={() => handleNotificationToggle("orderUpdates")}
            />
            <SettingsToggleRow
              checked={settings.notifications.reviewsRatings}
              disabled={disabled}
              helper="Get notified when a customer leaves feedback."
              label={t("settings.reviewsRatings", { defaultValue: "Reviews & Ratings" })}
              onToggle={() => handleNotificationToggle("reviewsRatings")}
            />
            <SettingsToggleRow
              checked={settings.notifications.promos_tips}
              disabled={disabled}
              helper="Receive business insights and platform tips."
              label={t("settings.promotionsTips", { defaultValue: "Promotions & Tips" })}
              onToggle={() => handleNotificationToggle("promos_tips")}
            />
            <SettingsToggleRow
              checked={settings.notifications.emailNotifications}
              disabled={disabled}
              helper="Receive important updates in your email inbox."
              label={t("settings.emailNotifications")}
              onToggle={() => handleNotificationToggle("emailNotifications")}
            />
            <SettingsToggleRow
              checked={settings.notifications.pushNotifications}
              disabled={disabled}
              helper="Receive push alerts on supported devices."
              label={t("settings.pushNotifications")}
              onToggle={() => handleNotificationToggle("pushNotifications")}
            />
            <SettingsToggleRow
              checked={settings.notifications.smsNotifications}
              disabled={disabled}
              helper="Receive important alerts by SMS."
              label={t("settings.smsNotifications")}
              onToggle={() => handleNotificationToggle("smsNotifications")}
            />
          </SettingsSectionCard>

          <SettingsSectionCard description="Account defaults are managed automatically for this portal." title="Account Defaults">
            <div className="space-y-3">
              <SettingsSelectField
                disabled
                label="Valuta"
                onChange={handleFieldChange("currency")}
                options={currencyOptions}
                placeholder="Locked currency"
                value={settings.currency}
              />
              <p className="text-[11px] text-[#8a7c70]">
                Currency is locked to the vendor account configuration and cannot be changed here.
              </p>
              <div className="space-y-1">
                <SettingsTextField
                  disabled
                  label={t("settings.timeZone", { defaultValue: "Time Zone" })}
                  value={settings.timeZone || NORWAY_TIME_ZONE}
                />
                <p className="text-[11px] text-[#8a7c70]">
                  Norway time is applied automatically, including summer and winter time changes.
                </p>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            description={t("settings.dangerDescription", { defaultValue: "These actions are permanent and cannot be undone." })}
            title={t("settings.dangerZone", { defaultValue: "Danger Zone" })}
            tone="danger"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-[8px] border border-[#f0dfd3] bg-white px-3 py-3">
                <div>
                  <p className="text-[12px] font-bold text-[#201914]">{t("settings.resetAll", { defaultValue: "Reset All Settings" })}</p>
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
                  <p className="text-[12px] font-bold text-[#201914]">{t("settings.deactivateStore", { defaultValue: "Deactivate Store" })}</p>
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
                  <p className="text-[12px] font-bold text-[#201914]">{t("settings.deleteStore", { defaultValue: "Delete Store" })}</p>
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

      <div className="hidden grid-cols-2 items-start gap-3 max-[1120px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-3">
          <SettingsSectionCard
          description="Add the bank details the platform should use when sending your manual payouts."
          title="Payout Bank Details"
        >
          <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            <SettingsTextField
              disabled={disabled}
              label="Account Holder Name"
              onChange={handleFieldChange("payoutProfile.accountHolderName")}
              placeholder="Enter account holder name"
              value={settings.payoutProfile.accountHolderName}
            />
            <SettingsTextField
              disabled={disabled}
              label="Bank Name"
              onChange={handleFieldChange("payoutProfile.bankName")}
              placeholder="Enter bank name"
              value={settings.payoutProfile.bankName}
            />
            <SettingsTextField
              disabled={disabled}
              label="Account Number"
              onChange={handleFieldChange("payoutProfile.accountNumber")}
              placeholder="Enter account number"
              value={settings.payoutProfile.accountNumber}
            />
          </div>

          <div className="mt-4 rounded-[10px] border border-[#f0dfd3] bg-[#fff8f4] px-4 py-3 text-[12px] text-[#6f635b]">
            <p className="font-semibold text-[#201914]">
              Payout review: {settings.payoutProfile.verificationStatus || "We are reviewing your details"}
            </p>
            <p className="mt-1">
              Bank details saved: {settings.payoutProfile.bankDetailsVerified ? "Confirmed" : "Waiting for confirmation"}
            </p>
            {settings.payoutProfile.verificationNote ? (
              <p className="mt-2 text-[#8b796c]">{settings.payoutProfile.verificationNote}</p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-[12px] border border-[#ecdccf] bg-[#fffdfb] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#201914]">Save your bank details</p>
              <p className="mt-1 text-[12px] leading-6 text-[#7a6d63]">
                Your bank details will stay saved here, so you can come back and update them any time.
              </p>
            </div>
            <button
              className="inline-flex h-11 min-w-[176px] items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#d96e39_0%,#c95a2d_100%)] px-5 text-[13px] font-extrabold text-white shadow-[0_14px_28px_rgba(217,110,57,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(217,110,57,0.34)] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled || isSaving || !hasUnsavedChanges}
              onClick={handleSave}
              type="button"
            >
              {isSaving ? "Saving..." : "Save Bank Details"}
            </button>
          </div>
          </SettingsSectionCard>

          <div id="special-closures-section">
            <SettingsSpecialClosuresSection
              closureTypeOptions={closureTypeOptions}
              closures={settings.closures}
              disabled={disabled}
              minDate={getTodayDateValue()}
              onAddOrUpdateClosure={handleSaveClosure}
              onDeleteClosure={handleDeleteClosure}
            />
          </div>
        </div>

      </div>

    </div>
  );
}
