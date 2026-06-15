import { useEffect, useMemo, useState } from "react";
import {
  confirmVendorDeactivateStore,
  confirmVendorDeleteStore,
  confirmVendorResetSettings,
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const SETTINGS_STORAGE_KEY = "settings-page-state";

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const defaultSettings = {
  businessName: "Fint's Grill",
  businessEmail: "fints@cateringmail.com",
  phoneNumber: "+47 92 00 18 00",
  businessAddress: "500 Oslo city avenue, Norway",
  businessDescription:
    "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
  cuisineType: "Italiensk",
  businessType: "Cateringfirma",
  establishedYear: "2001",
  taxId: "NO 0221",
  notifications: {
    newOrder: true,
    orderUpdates: true,
    reviewsRatings: true,
    promosTips: false,
    emailNotifications: true,
  },
  language: "English",
  currency: "Norway (NOK)",
  timeZone: "GMT +01:00",
  account: {
    fullName: "Raja Haider",
    emailAddress: "fint00@kitchenmail.com",
    phoneNumber: "+47 912 95 832",
    role: "Kitchen Manager",
    username: "raja.kitchen",
    accountId: "VCP-58231",
  },
  hours: [
    { day: "Monday", enabled: true, open: "08:00-12:00", close: "09:00-05:00" },
    { day: "Tuesday", enabled: true, open: "08:00-12:00", close: "09:00-05:00" },
    { day: "Wednesday", enabled: true, open: "08:00-12:00", close: "09:00-05:00" },
    { day: "Thursday", enabled: true, open: "08:00-12:00", close: "09:00-05:00" },
    { day: "Friday", enabled: true, open: "08:00-12:00", close: "09:00-05:00" },
    { day: "Saturday", enabled: true, open: "08:00-12:00", close: "09:00-05:00" },
    { day: "Sunday", enabled: false, open: "Closed", close: "Closed" },
  ],
};

function getStoredSettings() {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  try {
    const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!stored) {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...JSON.parse(stored),
    };
  } catch {
    return defaultSettings;
  }
}

export default function useSettingsPageState() {
  const [activeTab, setActiveTab] = useState("business");
  const [savedSettings, setSavedSettings] = useState(defaultSettings);
  const [settings, setSettings] = useState(defaultSettings);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const initialSettings = getStoredSettings();
    setSavedSettings(initialSettings);
    setSettings(initialSettings);
  }, []);

  useEffect(() => {
    if (!saveMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSaveMessage("");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [saveMessage]);

  function handleFieldChange(field) {
    return (event) => {
      setSettings((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  function handleAccountFieldChange(field) {
    return (event) => {
      setSettings((current) => ({
        ...current,
        account: {
          ...current.account,
          [field]: event.target.value,
        },
      }));
    };
  }

  function handleNotificationToggle(field) {
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [field]: !current.notifications[field],
      },
    }));
  }

  function handleToggleBusinessDay(day) {
    setSettings((current) => ({
      ...current,
      hours: current.hours.map((item) =>
        item.day === day ? { ...item, enabled: !item.enabled } : item,
      ),
    }));
  }

  function handleBusinessHourChange(day, field, value) {
    setSettings((current) => ({
      ...current,
      hours: current.hours.map((item) =>
        item.day === day ? { ...item, [field]: value } : item,
      ),
    }));
  }

  function handlePasswordChange(field) {
    return (event) => {
      setPasswordForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  function handleTogglePasswordVisibility(field) {
    setPasswordVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  async function handleCancel() {
    setSettings(savedSettings);
    setPasswordForm(emptyPasswordForm);
    setSaveMessage("Changes discarded.");
    await showVendorSuccessToast("Settings changes discarded.");
  }

  async function handleSave() {
    if (passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword) {
      if (passwordForm.newPassword.length < 8) {
        await showVendorErrorAlert(
          "Use at least 8 characters for the new password.",
          "Password too short",
        );
        setSaveMessage("Use at least 8 characters for the new password.");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        await showVendorErrorAlert(
          "New password and confirm password must match.",
          "Password mismatch",
        );
        setSaveMessage("New password and confirm password must match.");
        return;
      }
    }

    setSavedSettings(settings);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setPasswordForm(emptyPasswordForm);
    setSaveMessage("Changes saved.");
    await showVendorSuccessToast("Settings saved successfully.");
  }

  async function handleResetAllSettings() {
    const result = await confirmVendorResetSettings();

    if (!result.isConfirmed) {
      return;
    }

    setSettings(defaultSettings);
    setSavedSettings(defaultSettings);
    setPasswordForm(emptyPasswordForm);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    setSaveMessage("Settings reset to default.");
    await showVendorSuccessToast("Settings reset to default.");
  }

  async function handleDeactivateStore() {
    const result = await confirmVendorDeactivateStore();

    if (!result.isConfirmed) {
      return;
    }

    const deactivatedSettings = {
      ...settings,
      hours: settings.hours.map((item) => ({
        ...item,
        enabled: false,
        open: "Closed",
        close: "Closed",
      })),
    };

    setSettings(deactivatedSettings);
    setSavedSettings(deactivatedSettings);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(deactivatedSettings));
    setSaveMessage("Store deactivated.");
    await showVendorSuccessToast("Store deactivated.");
  }

  async function handleDeleteStore() {
    const result = await confirmVendorDeleteStore();

    if (!result.isConfirmed) {
      return;
    }

    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    setSettings(defaultSettings);
    setSavedSettings(defaultSettings);
    setPasswordForm(emptyPasswordForm);
    setSaveMessage("Store deleted permanently.");
    await showVendorSuccessToast("Store deleted permanently.");
  }

  const passwordStrength = useMemo(() => {
    const value = passwordForm.newPassword;

    if (!value) {
      return {
        filledBars: 0,
        label: "Add a stronger password to secure your account.",
        tone: "neutral",
      };
    }

    let score = 0;

    if (value.length >= 8) {
      score += 1;
    }

    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) {
      score += 1;
    }

    if (/\d/.test(value)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
      score += 1;
    }

    if (score <= 1) {
      return {
        filledBars: 1,
        label: "Weak",
        tone: "weak",
      };
    }

    if (score <= 3) {
      return {
        filledBars: 2,
        label: "Medium",
        tone: "medium",
      };
    }

    return {
      filledBars: 3,
      label: "Strong",
      tone: "strong",
    };
  }, [passwordForm.newPassword]);

  const passwordsMatch =
    !!passwordForm.newPassword &&
    !!passwordForm.confirmPassword &&
    passwordForm.newPassword === passwordForm.confirmPassword;

  const hasUnsavedChanges = useMemo(
    () =>
      JSON.stringify(settings) !== JSON.stringify(savedSettings) ||
      JSON.stringify(passwordForm) !== JSON.stringify(emptyPasswordForm),
    [passwordForm, savedSettings, settings],
  );

  return {
    activeTab,
    handleBusinessHourChange,
    handleAccountFieldChange,
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
  };
}
