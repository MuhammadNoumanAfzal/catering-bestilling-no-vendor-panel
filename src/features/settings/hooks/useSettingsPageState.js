import { useEffect, useMemo, useState } from "react";
import { loadStoredAuthSession } from "../../auth/store/authStorage";
import {
  changeVendorPassword,
  deactivateVendorStore,
  deleteVendorSpecialClosure,
  deleteVendorStore,
  getVendorSettingsPage,
  resetVendorSettingsToDefault,
  updateVendorAccountProfile,
  updateVendorBusinessHours,
  updateVendorBusinessProfile,
  updateVendorSettingsImages,
  updateVendorNotificationPreferences,
  updateVendorRegionalPreferences,
  upsertVendorSpecialClosure,
} from "../api/settingsApi";
import {
  buildAccountProfileInput,
  buildBusinessHoursInput,
  buildBusinessProfileInput,
  buildVendorSettingsImagesInput,
  buildNotificationPreferencesInput,
  buildPasswordChangeInput,
  buildRegionalPreferencesInput,
  buildSpecialClosureInput,
  buildStorePasswordInput,
  defaultSettingsOptions,
  defaultSettingsState,
  getComparablePasswordState,
  getComparableSettingsState,
  mapVendorSettingsPage,
} from "../api/settingsMappers";
import {
  confirmVendorDeactivateStore,
  confirmVendorResetSettings,
  confirmVendorDeleteStore,
  promptVendorPasswordConfirmation,
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";
import { dispatchVendorProfileUpdated } from "../../../utils/vendorProfileEvents";
import { uploadMenuImage } from "../../menu/api/menuUploadApi";

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const emptyFieldErrors = {
  fullName: "",
  emailAddress: "",
  phoneNumber: "",
  username: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function hasPasswordChanges(passwordForm) {
  return (
    passwordForm.currentPassword ||
    passwordForm.newPassword ||
    passwordForm.confirmPassword
  );
}

function formatMutationErrors(errors = []) {
  const normalizedErrors = errors
    .map((item) => {
      const field = item?.field ? `${item.field}: ` : "";
      const message = item?.message || "";

      return `${field}${message}`.trim();
    })
    .filter(Boolean);

  return normalizedErrors.join("\n");
}

function mapMutationErrorsByField(errors = []) {
  return errors.reduce((accumulator, item) => {
    const field = item?.field;
    const message = item?.message || "";

    if (!field || !message) {
      return accumulator;
    }

    accumulator[field] = accumulator[field]
      ? `${accumulator[field]} ${message}`
      : message;

    return accumulator;
  }, {});
}

function mapApiHoursToState(hours = []) {
  return hours.map((item) => ({
    id: item.id || "",
    day: item.day,
    enabled: Boolean(item.enabled),
    timeRange: item.enabled
      ? item.timeRange || [item.openTime, item.closeTime].filter(Boolean).join("-")
      : "Closed",
    open: item.enabled ? item.openTime : "Closed",
    close: item.enabled ? item.closeTime : "Closed",
  }));
}

function resolveNavbarProfileImage(settings) {
  return (
    settings?.account?.avatar?.fileUrl ||
    settings?.profileImage?.fileUrl ||
    ""
  );
}

function notifyVendorProfileUpdated(settings) {
  try {
    dispatchVendorProfileUpdated({
      businessName: settings?.businessName,
      profileImageUrl: resolveNavbarProfileImage(settings),
    });
  } catch {
    // Keep settings save/upload flow working even if navbar refresh fails.
  }
}

export default function useSettingsPageState() {
  const authUser = useMemo(() => {
    const authSession = loadStoredAuthSession();
    return authSession?.user || null;
  }, []);
  const [activeTab, setActiveTab] = useState("business");
  const [savedSettings, setSavedSettings] = useState(defaultSettingsState);
  const [settings, setSettings] = useState(defaultSettingsState);
  const [settingsOptions, setSettingsOptions] = useState(defaultSettingsOptions);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadSettingsPage() {
      setIsLoading(true);

      try {
        const result = await getVendorSettingsPage();

        if (isCancelled) {
          return;
        }

        const mappedPage = mapVendorSettingsPage(result, { authUser });
        setSavedSettings(mappedPage.settings);
        setSettings(mappedPage.settings);
        setSettingsOptions(mappedPage.options);
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || "Unable to load settings right now.",
            "Settings unavailable",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSettingsPage();

    return () => {
      isCancelled = true;
    };
  }, [authUser]);

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
      setFieldErrors((current) => ({
        ...current,
        [field]: "",
      }));
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
        item.day === day
          ? {
              ...item,
              enabled: !item.enabled,
              timeRange: !item.enabled ? "08:00-12:00" : "Closed",
              open: !item.enabled ? "08:00" : "Closed",
              close: !item.enabled ? "12:00" : "Closed",
            }
          : item,
      ),
    }));
  }

  function handleBusinessHourChange(day, field, value) {
    setSettings((current) => ({
      ...current,
      hours: current.hours.map((item) => {
        if (item.day !== day) {
          return item;
        }

        const nextItem =
          field === "open"
            ? {
                ...item,
                open: value,
                close: "Closed",
              }
            : {
                ...item,
                close: value,
              };

        return {
          ...nextItem,
          timeRange:
            nextItem.enabled &&
            nextItem.open &&
            nextItem.close &&
            nextItem.open !== "Closed" &&
            nextItem.close !== "Closed"
              ? `${nextItem.open}-${nextItem.close}`
              : "Closed",
        };
      }),
    }));
  }

  function handlePasswordChange(field) {
    return (event) => {
      setFieldErrors((current) => ({
        ...current,
        [field]: "",
      }));
      setPasswordForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleProfileImageUpload(file) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      await showVendorErrorAlert("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await showVendorErrorAlert("Please upload an image under 5MB.");
      return;
    }

    try {
      setIsSaving(true);
      const uploadedAsset = await uploadMenuImage(file);

      setSettings((current) => ({
        ...current,
        profileImage: uploadedAsset,
      }));
      setSaveMessage("Logo uploaded. Save changes to apply.");
      await showVendorSuccessToast("Logo uploaded. Save changes to apply.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to upload the selected image.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBannerImageUpload(file) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      await showVendorErrorAlert("Please upload a PNG, JPG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      await showVendorErrorAlert("Please upload an image under 5MB.");
      return;
    }

    try {
      setIsSaving(true);
      const uploadedAsset = await uploadMenuImage(file);

      setSettings((current) => ({
        ...current,
        bannerImage: uploadedAsset,
      }));
      setSaveMessage("Banner uploaded.");
      await showVendorSuccessToast("Banner uploaded.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to upload the selected image.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleRemoveProfileImage() {
    setSettings((current) => ({
      ...current,
      profileImage: null,
    }));
    setSaveMessage("Logo removed. Save changes to apply.");
  }

  function handleRemoveBannerImage() {
    setSettings((current) => ({
      ...current,
      bannerImage: null,
    }));
    setSaveMessage("Banner removed.");
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
    setFieldErrors(emptyFieldErrors);
    setSaveMessage("Changes discarded.");
    await showVendorSuccessToast("Settings changes discarded.");
  }

  async function handleSave() {
    setFieldErrors(emptyFieldErrors);

    if (hasPasswordChanges(passwordForm)) {
      if (passwordForm.newPassword.length < 8) {
        setFieldErrors((current) => ({
          ...current,
          newPassword: "Use at least 8 characters for the new password.",
        }));
        await showVendorErrorAlert(
          "Use at least 8 characters for the new password.",
          "Password too short",
        );
        setSaveMessage("Use at least 8 characters for the new password.");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setFieldErrors((current) => ({
          ...current,
          confirmPassword: "New password and confirm password must match.",
        }));
        await showVendorErrorAlert(
          "New password and confirm password must match.",
          "Password mismatch",
        );
        setSaveMessage("New password and confirm password must match.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const comparableSaved = getComparableSettingsState(savedSettings);
      const comparableCurrent = getComparableSettingsState(settings);
      let nextSettings = settings;
      const confirmations = [];

      if (
        JSON.stringify(comparableSaved.vendorImages) !==
        JSON.stringify(comparableCurrent.vendorImages)
      ) {
        const result = await updateVendorSettingsImages(
          buildVendorSettingsImagesInput(settings),
        );

        if (!result.success) {
          await showVendorErrorAlert(result.message || "Unable to save vendor images.");
          return;
        }

        nextSettings = {
          ...nextSettings,
          profileImage: result.instance?.logoUrl
            ? {
                fileUrl: result.instance.logoUrl,
                fileId: result.instance?.fileId || nextSettings.profileImage?.fileId || "",
              }
            : null,
          bannerImage: result.instance?.coverPhotoUrl
            ? {
                fileUrl: result.instance.coverPhotoUrl,
                fileId:
                  result.instance?.coverPhotoFileId ||
                  nextSettings.bannerImage?.fileId ||
                  "",
              }
            : null,
        };
        confirmations.push(result.message || "Vendor images saved.");
      }

      if (
        JSON.stringify(comparableSaved.businessProfile) !==
        JSON.stringify(comparableCurrent.businessProfile)
      ) {
        const result = await updateVendorBusinessProfile(
          buildBusinessProfileInput(settings),
        );

        if (!result.success) {
          await showVendorErrorAlert(result.message || "Unable to save business profile.");
          return;
        }

        nextSettings = {
          ...nextSettings,
          businessName:
            result.businessProfile?.businessName || nextSettings.businessName,
          businessEmail:
            result.businessProfile?.businessEmail || nextSettings.businessEmail,
          phoneNumber:
            result.businessProfile?.phoneNumber || nextSettings.phoneNumber,
          businessAddress:
            result.businessProfile?.businessAddress || nextSettings.businessAddress,
          businessDescription:
            result.businessProfile?.businessDescription ??
            nextSettings.businessDescription,
          cuisineType:
            result.businessProfile?.cuisineType?.id ||
            result.businessProfile?.cuisineType?.slug ||
            nextSettings.cuisineType,
          customCuisineType:
            result.businessProfile?.customCuisineType ??
            nextSettings.customCuisineType,
          businessType:
            result.businessProfile?.businessType?.id ||
            result.businessProfile?.businessType?.slug ||
            nextSettings.businessType,
          customBusinessType:
            result.businessProfile?.customBusinessType ??
            nextSettings.customBusinessType,
          establishedYear:
            result.businessProfile?.establishedYear != null
              ? String(result.businessProfile.establishedYear)
              : nextSettings.establishedYear,
          taxId: result.businessProfile?.taxId ?? nextSettings.taxId,
          profileImage:
            result.businessProfile?.profileImage ?? nextSettings.profileImage,
        };

        confirmations.push(result.message || "Business profile saved.");
      }

      if (
        JSON.stringify(comparableSaved.account) !==
        JSON.stringify(comparableCurrent.account)
      ) {
        const result = await updateVendorAccountProfile(buildAccountProfileInput(settings));

        if (!result.success) {
          setFieldErrors((current) => ({
            ...current,
            ...mapMutationErrorsByField(result.errors),
          }));
          await showVendorErrorAlert(
            formatMutationErrors(result.errors) ||
              result.message ||
              "Unable to save account profile.",
            "Account profile validation failed",
          );
          return;
        }

        nextSettings = {
          ...nextSettings,
          account: {
            ...nextSettings.account,
            id: result.account?.id || nextSettings.account.id,
            fullName: result.account?.fullName || nextSettings.account.fullName,
            emailAddress:
              result.account?.emailAddress || nextSettings.account.emailAddress,
            phoneNumber:
              result.account?.phoneNumber ?? nextSettings.account.phoneNumber,
            role: result.account?.role || nextSettings.account.role,
            username: result.account?.username || nextSettings.account.username,
            accountId: result.account?.accountId || nextSettings.account.accountId,
            avatar: result.account?.avatar ?? nextSettings.account.avatar,
          },
        };
        confirmations.push(result.message || "Account profile saved.");
      }

      if (
        JSON.stringify(comparableSaved.notifications) !==
        JSON.stringify(comparableCurrent.notifications)
      ) {
        const result = await updateVendorNotificationPreferences(
          buildNotificationPreferencesInput(settings),
        );

        if (!result.success) {
          await showVendorErrorAlert(
            result.message || "Unable to save notification preferences.",
          );
          return;
        }

        confirmations.push(result.message || "Notification preferences saved.");
      }

      if (
        JSON.stringify(comparableSaved.regionalPreferences) !==
        JSON.stringify(comparableCurrent.regionalPreferences)
      ) {
        const result = await updateVendorRegionalPreferences(
          buildRegionalPreferencesInput(settings),
        );

        if (!result.success) {
          await showVendorErrorAlert(result.message || "Unable to save regional preferences.");
          return;
        }

        confirmations.push(result.message || "Regional preferences saved.");
      }

      if (
        JSON.stringify(comparableSaved.hours) !==
        JSON.stringify(comparableCurrent.hours)
      ) {
        const result = await updateVendorBusinessHours(buildBusinessHoursInput(settings));

        if (!result.success) {
          await showVendorErrorAlert(result.message || "Unable to save business hours.");
          return;
        }

        nextSettings = {
          ...nextSettings,
          hours: mapApiHoursToState(result.businessHours || []),
        };
        confirmations.push(result.message || "Business hours saved.");
      }

      if (hasPasswordChanges(passwordForm)) {
        const result = await changeVendorPassword(buildPasswordChangeInput(passwordForm));

        if (!result.success) {
          setFieldErrors((current) => ({
            ...current,
            ...mapMutationErrorsByField(result.errors),
          }));
          await showVendorErrorAlert(
            formatMutationErrors(result.errors) ||
              result.message ||
              "Unable to change password.",
            "Password change failed",
          );
          return;
        }

        confirmations.push(result.message || "Password updated.");
      }

      setSavedSettings(nextSettings);
      setSettings(nextSettings);
      setPasswordForm(emptyPasswordForm);
      setFieldErrors(emptyFieldErrors);
      setSaveMessage("Changes saved.");
      notifyVendorProfileUpdated(nextSettings);
      await showVendorSuccessToast(
        confirmations[confirmations.length - 1] || "Settings saved successfully.",
      );
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to save settings right now.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResetAllSettings() {
    const confirmation = await confirmVendorResetSettings();

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await resetVendorSettingsToDefault();

      if (!result.success) {
        await showVendorErrorAlert(result.message || "Unable to reset settings.");
        return;
      }

      const refreshedResult = await getVendorSettingsPage();
      const mappedPage = mapVendorSettingsPage(refreshedResult);
      setSavedSettings(mappedPage.settings);
      setSettings(mappedPage.settings);
      setSettingsOptions(mappedPage.options);
      setPasswordForm(emptyPasswordForm);
      setFieldErrors(emptyFieldErrors);
      setSaveMessage("Settings reset to default.");
      notifyVendorProfileUpdated(mappedPage.settings);
      await showVendorSuccessToast(result.message || "Settings reset to default.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to reset settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivateStore() {
    const confirmation = await confirmVendorDeactivateStore();

    if (!confirmation.isConfirmed) {
      return;
    }

    const passwordPrompt = await promptVendorPasswordConfirmation("Deactivate Store");
    const password = String(passwordPrompt.value || "").trim();

    if (!password) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await deactivateVendorStore(buildStorePasswordInput(password));

      if (!result.success) {
        await showVendorErrorAlert(result.message || "Unable to deactivate store.");
        return;
      }

      setSettings((current) => ({
        ...current,
        storeStatus: result.storeStatus || "inactive",
      }));
      setSavedSettings((current) => ({
        ...current,
        storeStatus: result.storeStatus || "inactive",
      }));
      setSaveMessage("Store deactivated.");
      await showVendorSuccessToast(result.message || "Store deactivated.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to deactivate store.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteStore() {
    const confirmation = await confirmVendorDeleteStore();

    if (!confirmation.isConfirmed) {
      return;
    }

    const passwordPrompt = await promptVendorPasswordConfirmation("Delete Store");
    const password = String(passwordPrompt.value || "").trim();

    if (!password) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await deleteVendorStore(buildStorePasswordInput(password));

      if (!result.success) {
        await showVendorErrorAlert(result.message || "Unable to delete store.");
        return;
      }

      setSavedSettings(defaultSettingsState);
      setSettings(defaultSettingsState);
      setPasswordForm(emptyPasswordForm);
      setFieldErrors(emptyFieldErrors);
      setSaveMessage("Store deleted permanently.");
      notifyVendorProfileUpdated(defaultSettingsState);
      await showVendorSuccessToast(result.message || "Store deleted permanently.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to delete store.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveClosure(type, start, end, reason, id) {
    setIsSaving(true);

    try {
      const result = await upsertVendorSpecialClosure(
        buildSpecialClosureInput(type, start, end, reason, id),
      );

      if (!result.success) {
        await showVendorErrorAlert(result.message || "Unable to save special closure.");
        return;
      }

      const nextClosure = {
        id: result.closure?.id || id || `closure-${Date.now()}`,
        type: result.closure?.type?.id || type,
        typeLabel: result.closure?.type?.name || "",
        start: result.closure?.startDate || start,
        end: result.closure?.endDate || end,
        reason: result.closure?.reason || reason || "",
        status: result.closure?.status || "Scheduled",
      };

      setSettings((current) => {
        const nextClosures = id
          ? current.closures.map((item) => (item.id === id ? nextClosure : item))
          : [...current.closures, nextClosure];
        return {
          ...current,
          closures: nextClosures,
        };
      });
      setSavedSettings((current) => {
        const nextClosures = id
          ? current.closures.map((item) => (item.id === id ? nextClosure : item))
          : [...current.closures, nextClosure];
        return {
          ...current,
          closures: nextClosures,
        };
      });

      await showVendorSuccessToast(
        result.message ||
          (id
            ? "Special closure updated successfully."
            : "Special closure added successfully."),
      );
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to save special closure.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteClosure(id) {
    setIsSaving(true);

    try {
      const result = await deleteVendorSpecialClosure(id);

      if (!result.success) {
        await showVendorErrorAlert(result.message || "Unable to delete special closure.");
        return;
      }

      setSettings((current) => ({
        ...current,
        closures: current.closures.filter((item) => item.id !== id),
      }));
      setSavedSettings((current) => ({
        ...current,
        closures: current.closures.filter((item) => item.id !== id),
      }));
      await showVendorSuccessToast(result.message || "Special closure deleted successfully.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to delete special closure.");
    } finally {
      setIsSaving(false);
    }
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
      JSON.stringify(getComparableSettingsState(settings)) !==
        JSON.stringify(getComparableSettingsState(savedSettings)) ||
      JSON.stringify(getComparablePasswordState(passwordForm)) !==
        JSON.stringify(getComparablePasswordState(emptyPasswordForm)),
    [passwordForm, savedSettings, settings],
  );

  return {
    activeTab,
    handleAccountFieldChange,
    handleBusinessHourChange,
    handleCancel,
    handleDeactivateStore,
    handleDeleteClosure,
    handleDeleteStore,
    handleFieldChange,
    handleNotificationToggle,
    handlePasswordChange,
    handleBannerImageUpload,
    handleProfileImageUpload,
    handleRemoveBannerImage,
    handleRemoveProfileImage,
    handleResetAllSettings,
    handleSave,
    handleSaveClosure,
    handleToggleBusinessDay,
    handleTogglePasswordVisibility,
    hasUnsavedChanges,
    fieldErrors,
    isLoading,
    isSaving,
    passwordForm,
    passwordStrength,
    passwordsMatch,
    passwordVisibility,
    saveMessage,
    setActiveTab,
    settings,
    settingsOptions,
  };
}
