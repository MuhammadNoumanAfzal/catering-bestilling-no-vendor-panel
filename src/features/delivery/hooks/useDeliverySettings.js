import { useEffect, useMemo, useRef, useState } from "react";
import {
  getVendorDeliverySettings,
  updateVendorDeliverySettings,
  validateVendorDeliverySettings,
} from "../api/deliveryApi";
import {
  buildDeliverySettingsInput,
  defaultDeliverySettings,
  getComparableDeliverySettings,
  mapFieldErrors,
  mapVendorDeliverySettingsToForm,
  parseTimeSlotLabel,
} from "../api/deliveryMappers";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const defaultValidationState = {
  isValid: true,
  issues: [],
  errors: [],
};

export default function useDeliverySettings() {
  const [savedSettings, setSavedSettings] = useState(defaultDeliverySettings);
  const [formState, setFormState] = useState(defaultDeliverySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [validationState, setValidationState] = useState(defaultValidationState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [customSlotDraft, setCustomSlotDraft] = useState({ start: "18:00", end: "21:00" });
  const [slotDraftError, setSlotDraftError] = useState("");
  const [loadError, setLoadError] = useState("");
  const hasLoadedSettingsRef = useRef(false);
  const validationRequestIdRef = useRef(0);

  async function loadDeliverySettings() {
    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getVendorDeliverySettings();
      const nextSettings = mapVendorDeliverySettingsToForm(result?.vendorDeliverySettings);

      setSavedSettings(nextSettings);
      setFormState(nextSettings);
      setValidationState(nextSettings.liveValidation || defaultValidationState);
      setFieldErrors({});
      hasLoadedSettingsRef.current = true;
    } catch (error) {
      const nextError = error.message || "Unable to load delivery settings right now.";
      setLoadError(nextError);
      setFieldErrors({});
      setValidationState(defaultValidationState);
      hasLoadedSettingsRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDeliverySettings();
  }, []);

  useEffect(() => {
    if (!loadError) {
      return;
    }

    showVendorErrorAlert(loadError, "Delivery settings unavailable");
  }, [loadError]);

  useEffect(() => {
    if (!saveMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSaveMessage("");
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [saveMessage]);

  useEffect(() => {
    if (isLoading || loadError || !hasLoadedSettingsRef.current) {
      return undefined;
    }

    const requestId = validationRequestIdRef.current + 1;
    validationRequestIdRef.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      setIsValidating(true);

      try {
        const result = await validateVendorDeliverySettings(
          buildDeliverySettingsInput(formState),
        );

        if (validationRequestIdRef.current !== requestId) {
          return;
        }

        setValidationState({
          isValid: result?.isValid ?? false,
          issues: Array.isArray(result?.issues) ? result.issues : [],
          errors: Array.isArray(result?.errors) ? result.errors : [],
        });
        setFieldErrors(mapFieldErrors(result?.errors || []));
      } catch {
        if (validationRequestIdRef.current !== requestId) {
          return;
        }

        setValidationState(defaultValidationState);
      } finally {
        if (validationRequestIdRef.current === requestId) {
          setIsValidating(false);
        }
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [formState, isLoading, loadError]);

  const currentComparable = useMemo(
    () => getComparableDeliverySettings(formState),
    [formState],
  );
  const savedComparable = useMemo(
    () => getComparableDeliverySettings(savedSettings),
    [savedSettings],
  );

  function setField(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleToggleMode(modeId) {
    setFormState((current) => {
      const hasMode = current.selectedModes.includes(modeId);

      if (hasMode) {
        const nextModes = current.selectedModes.filter((mode) => mode !== modeId);

        return {
          ...current,
          selectedModes: nextModes.length ? nextModes : current.selectedModes,
        };
      }

      return {
        ...current,
        selectedModes: [...current.selectedModes, modeId],
      };
    });
    setFieldErrors((current) => {
      if (
        !current.deliveryAvailable &&
        !current.pickupAvailable &&
        !current.deliveryMode
      ) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.deliveryAvailable;
      delete nextErrors.pickupAvailable;
      delete nextErrors.deliveryMode;
      return nextErrors;
    });
  }

  function handleToggleDay(dayValue) {
    setFormState((current) => ({
      ...current,
      activeDays: current.activeDays.includes(dayValue)
        ? current.activeDays.filter((day) => day !== dayValue)
        : [...current.activeDays, dayValue],
    }));
  }

  function handleRemoveTimeSlot(slotToRemove) {
    setFormState((current) => ({
      ...current,
      timeSlots: current.timeSlots.filter((slot) => slot !== slotToRemove),
    }));
  }

  function handleOpenAddSlotModal() {
    setCustomSlotDraft({ start: "18:00", end: "21:00" });
    setSlotDraftError("");
    setIsAddSlotModalOpen(true);
  }

  function handleCloseAddSlotModal() {
    setIsAddSlotModalOpen(false);
    setCustomSlotDraft({ start: "18:00", end: "21:00" });
    setSlotDraftError("");
  }

  function handleSaveCustomSlot() {
    const nextSlot = `${customSlotDraft.start} - ${customSlotDraft.end}`;
    const parsedSlot = parseTimeSlotLabel(nextSlot);

    if (!parsedSlot) {
      setSlotDraftError("Enter both a start time and an end time.");
      return;
    }

    if (parsedSlot.start >= parsedSlot.end) {
      setSlotDraftError("Start time must be earlier than end time.");
      return;
    }

    setFormState((current) => ({
      ...current,
      timeSlots: current.timeSlots.includes(nextSlot)
        ? current.timeSlots
        : [...current.timeSlots, nextSlot],
    }));
    handleCloseAddSlotModal();
  }

  async function handleCancelChanges() {
    setFormState(savedSettings);
    setFieldErrors({});
    setValidationState(savedSettings.liveValidation || defaultValidationState);
    setIsAddSlotModalOpen(false);
    setCustomSlotDraft({ start: "18:00", end: "21:00" });
    setSlotDraftError("");
    setSaveMessage("Changes discarded.");
    await showVendorSuccessToast("Delivery changes discarded.");
  }

  async function handleSaveChanges() {
    if (loadError || !hasLoadedSettingsRef.current) {
      await showVendorErrorAlert(
        "Reload delivery settings before saving changes.",
        "Delivery settings unavailable",
      );
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateVendorDeliverySettings(
        buildDeliverySettingsInput(formState),
      );

      if (!result?.success) {
        const nextErrors = mapFieldErrors(result?.errors || []);
        setFieldErrors(nextErrors);
        setValidationState({
          isValid: false,
          issues: [],
          errors: result?.errors || [],
        });
        setSaveMessage(result?.message || "Fix validation errors before saving.");
        return;
      }

      const nextSavedSettings = mapVendorDeliverySettingsToForm(
        result.vendorDeliverySettings,
      );
      setSavedSettings(nextSavedSettings);
      setFormState(nextSavedSettings);
      setFieldErrors({});
      setValidationState(nextSavedSettings.liveValidation || defaultValidationState);
      setSaveMessage("Changes saved.");
      await showVendorSuccessToast(result.message || "Delivery settings saved.");
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to save delivery settings right now.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const isPickupOnly =
    formState.selectedModes.includes("pickup") &&
    !formState.selectedModes.includes("delivery");
  const isDeliveryDisabled = isPickupOnly;

  return {
    activeDays: formState.activeDays,
    baseFee: formState.baseFee,
    customSlotDraft,
    fieldErrors,
    freeDelivery: formState.freeDelivery,
    handleCancelChanges,
    handleCloseAddSlotModal,
    handleOpenAddSlotModal,
    handleRemoveTimeSlot,
    handleSaveChanges,
    handleSaveCustomSlot,
    handleToggleDay,
    handleToggleMode,
    hasUnsavedChanges:
      JSON.stringify(currentComparable) !== JSON.stringify(savedComparable),
    isAddSlotModalOpen,
    loadError,
    isDeliveryDisabled,
    isLoading,
    isPickupOnly,
    isSaving,
    isValidating,
    maxDeliveriesPerDay: formState.maxDeliveriesPerDay,
    maxOrdersPerTimeSlot: formState.maxOrdersPerTimeSlot,
    pickupAddress: formState.pickupAddress,
    pickupInstructions: formState.pickupInstructions,
    sameFeeAllDistances: formState.sameFeeAllDistances,
    saveMessage,
    selectedModes: formState.selectedModes,
    retryLoad: loadDeliverySettings,
    setBaseFee: (value) => setField("baseFee", value),
    setCustomSlotDraft,
    setFreeDelivery: (value) => setField("freeDelivery", value),
    setMaxDeliveriesPerDay: (value) => setField("maxDeliveriesPerDay", value),
    setMaxOrdersPerTimeSlot: (value) => setField("maxOrdersPerTimeSlot", value),
    setPickupAddress: (value) => setField("pickupAddress", value),
    setPickupInstructions: (value) => setField("pickupInstructions", value),
    setSameFeeAllDistances: (value) => setField("sameFeeAllDistances", value),
    slotDraftError,
    timeSlots: formState.timeSlots,
    validationState,
  };
}
