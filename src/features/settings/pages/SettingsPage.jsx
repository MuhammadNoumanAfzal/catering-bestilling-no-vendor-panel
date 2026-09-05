import SettingsAccountSecurityPanel from "../components/SettingsAccountSecurityPanel";
import SettingsActionsBar from "../components/SettingsActionsBar";
import SettingsBusinessProfilePanel from "../components/SettingsBusinessProfilePanel";
import SettingsTabs from "../components/SettingsTabs";
import { useTranslation } from "react-i18next";
import VendorApplicationStatusNotice from "../components/VendorApplicationStatusNotice";
import useSettingsPageState from "../hooks/useSettingsPageState";

function resolveSettingsNoticeStatus(applicationReview, authUser) {
  const reviewStatus = `${applicationReview?.applicationStatus ?? ""}`.trim().toUpperCase();
  const vendorStatus = `${applicationReview?.vendorStatus ?? authUser?.vendorStatus ?? ""}`.trim().toUpperCase();
  const currentStatus = `${applicationReview?.currentStatus ?? authUser?.status ?? ""}`.trim().toUpperCase();
  const isFixedAndReady = Boolean(
    applicationReview?.canApprove || applicationReview?.isReadyForApproval,
  );

  if (
    ["ACTIVE", "APPROVED"].includes(reviewStatus) ||
    ["ACTIVE", "APPROVED"].includes(vendorStatus) ||
    ["ACTIVE", "APPROVED"].includes(currentStatus)
  ) {
    return "";
  }

  if (reviewStatus === "CHANGES_REQUESTED" && isFixedAndReady) {
    return "REVIEWING";
  }

  return (
    applicationReview?.applicationStatus ||
    authUser?.applicationStatus ||
    authUser?.vendorStatus ||
    authUser?.status ||
    ""
  );
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    activeTab,
    authUser,
    applicationReview,
    handleAccountFieldChange,
    handleBannerImageUpload,
    handleCancel,
    handleDeactivateStore,
    handleDeleteClosure,
    handleDeleteStore,
    handleFieldChange,
    handleNotificationToggle,
    handlePasswordChange,
    handleProfileImageUpload,
    handleRemoveBannerImage,
    handleRemoveProfileImage,
    handleResetAllSettings,
    handleSave,
    handleSaveClosure,
    handleTogglePasswordVisibility,
    hasUnsavedChanges,
    isLoading,
    isSaving,
    fieldErrors,
    passwordForm,
    passwordStrength,
    passwordsMatch,
    passwordVisibility,
    saveMessage,
    setActiveTab,
    settings,
    settingsOptions,
  } = useSettingsPageState();

  const pageContent =
    activeTab === "security"
      ? {
          title: t("settings.securityTitle"),
          description: t("settings.securityDescription"),
        }
      : {
          title: t("settings.title"),
          description: t("settings.description"),
        };
  const noticeStatus = resolveSettingsNoticeStatus(applicationReview, authUser);

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <header className="mb-5">
        <h1 className="type-h2 m-0 text-[#15110f]">{pageContent.title}</h1>
        <p className="type-para mt-1 text-[#746a62]">
          {pageContent.description}
        </p>
      </header>

      {!isLoading ? (
        <VendorApplicationStatusNotice
          status={noticeStatus}
          reviewedAt={applicationReview?.reviewedAt}
          changeRequestMessage={applicationReview?.changeRequestMessage}
          requestedFields={applicationReview?.requestedFields || []}
          missingRequirements={applicationReview?.missingRequirements || []}
          settings={settings}
        />
      ) : null}

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "security" ? (
        <SettingsAccountSecurityPanel
          account={settings.account}
          bannerImage={settings.bannerImage}
          businessName={settings.businessName}
          disabled={isLoading || isSaving}
          handleAccountFieldChange={handleAccountFieldChange}
          handleBannerImageUpload={handleBannerImageUpload}
          handlePasswordChange={handlePasswordChange}
          handleProfileImageUpload={handleProfileImageUpload}
          handleRemoveBannerImage={handleRemoveBannerImage}
          handleRemoveProfileImage={handleRemoveProfileImage}
          profileImage={settings.profileImage}
          handleTogglePasswordVisibility={handleTogglePasswordVisibility}
          fieldErrors={fieldErrors}
          passwordForm={passwordForm}
          passwordStrength={passwordStrength}
          passwordsMatch={passwordsMatch}
          passwordVisibility={passwordVisibility}
        />
      ) : (
        <SettingsBusinessProfilePanel
          businessTypeOptions={settingsOptions.businessTypeOptions}
          closureTypeOptions={settingsOptions.closureTypeOptions}
          cuisineOptions={settingsOptions.cuisineOptions}
          currencyOptions={settingsOptions.currencyOptions}
          disabled={isLoading || isSaving}
          fieldErrors={fieldErrors}
          handleDeactivateStore={handleDeactivateStore}
          handleDeleteStore={handleDeleteStore}
          handleFieldChange={handleFieldChange}
          handleNotificationToggle={handleNotificationToggle}
          handleResetAllSettings={handleResetAllSettings}
          handleSave={handleSave}
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={isSaving}
          settings={settings}
          handleSaveClosure={handleSaveClosure}
          handleDeleteClosure={handleDeleteClosure}
        />
      )}

      <SettingsActionsBar
        hasUnsavedChanges={hasUnsavedChanges}
        isLoading={isLoading}
        isSaving={isSaving}
        onCancel={handleCancel}
        onSave={handleSave}
        saveMessage={saveMessage}
      />
    </section>
  );
}
