import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import SettingsAccountSecurityPanel from "../components/SettingsAccountSecurityPanel";
import SettingsActionsBar from "../components/SettingsActionsBar";
import SettingsBusinessProfilePanel from "../components/SettingsBusinessProfilePanel";
import SettingsTabs from "../components/SettingsTabs";
import { useTranslation } from "react-i18next";
import VendorApplicationStatusNotice from "../components/VendorApplicationStatusNotice";
import useSettingsPageState from "../hooks/useSettingsPageState";
import VendorPageLoadingState from "../../../components/shared/VendorPageLoadingState";
import SignicatVerificationBanner from "../../dashboard/components/SignicatVerificationBanner";
import { showVendorErrorAlert, showVendorSuccessToast } from "../../../utils/vendorAlerts";
import { authUserUpdated } from "../../auth/store/authSlice";
import { updateStoredAuthUser } from "../../auth/store/authStorage";

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
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
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
    identityVerification,
    markIdentityVerificationComplete,
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("identity_verified");
    const provider = params.get("provider");
    const verifiedAt = params.get("verified_at");
    const error = params.get("error");

    if (!status && !error) {
      return;
    }

    if (status === "success") {
      markIdentityVerificationComplete({ provider, verifiedAt });
      void showVendorSuccessToast("Identity successfully verified with BankID.");
    } else {
      void showVendorErrorAlert(
        "Identity verification was not completed. Please try again.",
        "Identity verification",
      );
    }

    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.search, markIdentityVerificationComplete, navigate]);

  useEffect(() => {
    if (!identityVerification?.isVerified) {
      return;
    }

    const userPatch = {
      identityVerified: true,
      signicatSubject: identityVerification.subject || "",
      signicatVerifiedAt: identityVerification.verifiedAt || "",
      signicatProvider: identityVerification.provider || "BankID",
    };

    dispatch(authUserUpdated(userPatch));
    updateStoredAuthUser(userPatch);
  }, [
    dispatch,
    identityVerification?.isVerified,
    identityVerification?.provider,
    identityVerification?.subject,
    identityVerification?.verifiedAt,
  ]);
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

  if (isLoading) {
    return <VendorPageLoadingState variant="form" />;
  }

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

      {!isLoading ? (
        <div className="mb-5">
          <SignicatVerificationBanner identityVerification={identityVerification} />
        </div>
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
