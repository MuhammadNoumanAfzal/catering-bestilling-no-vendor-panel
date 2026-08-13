import SettingsAccountSecurityPanel from "../components/SettingsAccountSecurityPanel";
import SettingsActionsBar from "../components/SettingsActionsBar";
import SettingsBusinessProfilePanel from "../components/SettingsBusinessProfilePanel";
import SettingsTabs from "../components/SettingsTabs";
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
  const {
    activeTab,
    authUser,
    applicationReview,
    complianceDocuments,
    handleAccountFieldChange,
    handleBannerImageUpload,
    handleBusinessHourChange,
    handleComplianceDocumentsRefresh,
    handleComplianceDocumentUpload,
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
    handleToggleBusinessDay,
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
          title: "Account & Security",
          description: "Manage your account details, password and security preferences.",
        }
      : {
          title: "Settings",
          description: "Manage your business, account and preferences.",
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

      <VendorApplicationStatusNotice
        status={noticeStatus}
        reviewedAt={applicationReview?.reviewedAt}
        changeRequestMessage={applicationReview?.changeRequestMessage}
        requestedFields={applicationReview?.requestedFields || []}
        missingRequirements={applicationReview?.missingRequirements || []}
      />

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
          complianceDocuments={complianceDocuments}
          closureTypeOptions={settingsOptions.closureTypeOptions}
          cuisineOptions={settingsOptions.cuisineOptions}
          currencyOptions={settingsOptions.currencyOptions}
          disabled={isLoading || isSaving}
          fieldErrors={fieldErrors}
          handleBusinessHourChange={handleBusinessHourChange}
          handleComplianceDocumentsRefresh={handleComplianceDocumentsRefresh}
          handleComplianceDocumentUpload={handleComplianceDocumentUpload}
          handleDeactivateStore={handleDeactivateStore}
          handleDeleteStore={handleDeleteStore}
          handleFieldChange={handleFieldChange}
          handleNotificationToggle={handleNotificationToggle}
          handleResetAllSettings={handleResetAllSettings}
          handleToggleBusinessDay={handleToggleBusinessDay}
          languageOptions={settingsOptions.languageOptions}
          settings={settings}
          handleSaveClosure={handleSaveClosure}
          handleDeleteClosure={handleDeleteClosure}
          timeZoneOptions={settingsOptions.timeZoneOptions}
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
