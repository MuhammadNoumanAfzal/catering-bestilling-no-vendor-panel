import SettingsAccountSecurityPanel from "../components/SettingsAccountSecurityPanel";
import SettingsActionsBar from "../components/SettingsActionsBar";
import SettingsBusinessProfilePanel from "../components/SettingsBusinessProfilePanel";
import SettingsTabs from "../components/SettingsTabs";
import useSettingsPageState from "../hooks/useSettingsPageState";

export default function SettingsPage() {
  const {
    activeTab,
    handleAccountFieldChange,
    handleBusinessHourChange,
    handleCancel,
    handleDeactivateStore,
    handleDeleteStore,
    handleFieldChange,
    handleNotificationToggle,
    handlePasswordChange,
    handleResetAllSettings,
    handleSave,
    handleToggleBusinessDay,
    handleTogglePasswordVisibility,
    hasUnsavedChanges,
    passwordForm,
    passwordStrength,
    passwordsMatch,
    passwordVisibility,
    saveMessage,
    setActiveTab,
    settings,
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

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <header className="mb-5">
        <h1 className="type-h2 m-0 text-[#15110f]">{pageContent.title}</h1>
        <p className="type-para mt-1 text-[#746a62]">
          {pageContent.description}
        </p>
      </header>

      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "security" ? (
        <SettingsAccountSecurityPanel
          account={settings.account}
          businessName={settings.businessName}
          handleAccountFieldChange={handleAccountFieldChange}
          handlePasswordChange={handlePasswordChange}
          handleTogglePasswordVisibility={handleTogglePasswordVisibility}
          passwordForm={passwordForm}
          passwordStrength={passwordStrength}
          passwordsMatch={passwordsMatch}
          passwordVisibility={passwordVisibility}
        />
      ) : (
        <SettingsBusinessProfilePanel
          handleBusinessHourChange={handleBusinessHourChange}
          handleDeactivateStore={handleDeactivateStore}
          handleDeleteStore={handleDeleteStore}
          handleFieldChange={handleFieldChange}
          handleNotificationToggle={handleNotificationToggle}
          handleResetAllSettings={handleResetAllSettings}
          handleToggleBusinessDay={handleToggleBusinessDay}
          settings={settings}
        />
      )}

      <SettingsActionsBar
        hasUnsavedChanges={hasUnsavedChanges}
        onCancel={handleCancel}
        onSave={handleSave}
        saveMessage={saveMessage}
      />
    </section>
  );
}
