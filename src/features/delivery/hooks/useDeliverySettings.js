import { useEffect, useMemo, useRef, useState } from "react";
import {
  getVendorDeliverySettings,
  searchAvailableAreas,
  updateVendorDeliverySettings,
  validateVendorDeliverySettings,
  createValidArea,
} from "../api/deliveryApi";
import {
  buildDeliverySettingsInput,
  defaultDeliverySettings,
  formatDeliveryTimeSlot,
  getComparableDeliverySettings,
  mapFieldErrors,
  mapVendorDeliverySettingsToForm,
} from "../api/deliveryMappers";
import {
  showVendorErrorAlert,
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

const DEFAULT_CUSTOM_SLOT_DRAFT = { day: "mo", start: "18:00", end: "21:00" };
const defaultValidationState = {
  isValid: true,
  issues: [],
  errors: [],
};

function buildValidationState(result) {
  return {
    isValid: result?.isValid ?? false,
    issues: Array.isArray(result?.issues) ? result.issues : [],
    errors: Array.isArray(result?.errors) ? result.errors : [],
  };
}

function normalizeServiceArea(area) {
  return {
    id: area.id,
    name: area.name || "",
    postCode: area.postCode || "",
    isActive: area.isActive !== false,
  };
}

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
  const [customSlotDraft, setCustomSlotDraft] = useState(DEFAULT_CUSTOM_SLOT_DRAFT);
  const [slotDraftError, setSlotDraftError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [serviceAreaSearch, setServiceAreaSearch] = useState("");
  const [serviceAreaResults, setServiceAreaResults] = useState([]);
  const [isSearchingAreas, setIsSearchingAreas] = useState(false);
  const [isCreatingArea, setIsCreatingArea] = useState(false);
  const [customAreaDraft, setCustomAreaDraft] = useState({ name: "", postCode: "" });
  const [customAreaErrors, setCustomAreaErrors] = useState({});
  const hasLoadedSettingsRef = useRef(false);
  const validationRequestIdRef = useRef(0);
  const areaSearchRequestIdRef = useRef(0);

  function getDefaultSlotDraft(activeDays = formState.activeDays) {
    return {
      ...DEFAULT_CUSTOM_SLOT_DRAFT,
      day: activeDays?.[0] || DEFAULT_CUSTOM_SLOT_DRAFT.day,
    };
  }

  function resetSlotDraftState(activeDays = formState.activeDays) {
    setCustomSlotDraft(getDefaultSlotDraft(activeDays));
    setSlotDraftError("");
  }

  function resetServiceAreaSearchState() {
    setServiceAreaSearch("");
    setServiceAreaResults([]);
  }

  function applyLoadedSettings(nextSettings) {
    setSavedSettings(nextSettings);
    setFormState(nextSettings);
    setValidationState(nextSettings.liveValidation || defaultValidationState);
    setFieldErrors({});
  }

  async function loadDeliverySettings() {
    setIsLoading(true);
    setLoadError("");

    try {
      const result = await getVendorDeliverySettings();
      const nextSettings = mapVendorDeliverySettingsToForm(result?.me?.vendor);

      applyLoadedSettings(nextSettings);
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

        setValidationState(buildValidationState(result));
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

  useEffect(() => {
    const searchValue = serviceAreaSearch.trim();

    if (!searchValue || !formState.selectedModes.includes("delivery") || loadError) {
      setServiceAreaResults([]);
      setIsSearchingAreas(false);
      return undefined;
    }

    const requestId = areaSearchRequestIdRef.current + 1;
    areaSearchRequestIdRef.current = requestId;

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingAreas(true);

      try {
        const result = await searchAvailableAreas({ term: searchValue, first: 10 });

        if (areaSearchRequestIdRef.current !== requestId) {
          return;
        }

        const selectedIds = new Set((formState.serviceAreas || []).map((area) => area.id));
        setServiceAreaResults(
          result.filter((area) => area?.id && !selectedIds.has(area.id)),
        );
      } catch {
        if (areaSearchRequestIdRef.current !== requestId) {
          return;
        }

        setServiceAreaResults([]);
      } finally {
        if (areaSearchRequestIdRef.current === requestId) {
          setIsSearchingAreas(false);
        }
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [formState.selectedModes, formState.serviceAreas, loadError, serviceAreaSearch]);

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

  function clearServiceAreaErrors() {
    setFieldErrors((current) => {
      if (!current.validAreaIds && !current.serviceAreas) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.validAreaIds;
      delete nextErrors.serviceAreas;
      return nextErrors;
    });
  }

  function handleServiceAreaSearchChange(value) {
    setServiceAreaSearch(value);
    clearServiceAreaErrors();
  }

  function handleAddServiceArea(area) {
    setFormState((current) => {
      if (current.serviceAreas.some((item) => item.id === area.id)) {
        return current;
      }

      return {
        ...current,
        serviceAreas: [
          ...current.serviceAreas,
          normalizeServiceArea(area),
        ],
      };
    });
    resetServiceAreaSearchState();
    clearServiceAreaErrors();
  }

  function handleRemoveServiceArea(areaId) {
    setFormState((current) => ({
      ...current,
      serviceAreas: current.serviceAreas.filter((area) => area.id !== areaId),
    }));
    clearServiceAreaErrors();
  }

  function handleCustomAreaDraftChange(field, value) {
    setCustomAreaDraft((current) => ({ ...current, [field]: value }));
    setCustomAreaErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function resetCustomAreaDraft() {
    setCustomAreaDraft({ name: "", postCode: "" });
    setCustomAreaErrors({});
  }

  async function handleCreateCustomArea() {
    const name = customAreaDraft.name.trim();
    const postCode = customAreaDraft.postCode.trim();

    // Basic client-side validation
    const nextErrors = {};
    if (!name) nextErrors.name = "Area name is required.";
    if (!postCode) nextErrors.postCode = "Post code is required.";
    if (!/^\d+$/.test(postCode) && postCode) nextErrors.postCode = "Post code must be a valid number.";

    if (Object.keys(nextErrors).length) {
      setCustomAreaErrors(nextErrors);
      return;
    }

    setIsCreatingArea(true);

    try {
      const result = await createValidArea({ name, postCode });

      if (!result.success) {
        // Map backend field errors (e.g. postCode invalid)
        const fieldErrors = {};
        (result.errors || []).forEach((err) => {
          if (err.field) {
            // Backend returns snake_case field; normalize to camelCase
            const key = err.field === "post_code" ? "postCode" : err.field;
            fieldErrors[key] = err.message;
          }
        });
        if (Object.keys(fieldErrors).length) {
          setCustomAreaErrors(fieldErrors);
        } else {
          await showVendorErrorAlert(result.message || "Could not create service area.");
        }
        return;
      }

      // success: true covers both "created" and "already exists" cases
      const newArea = result.validArea;
      if (newArea?.id) {
        handleAddServiceArea(newArea);
      }
      resetCustomAreaDraft();
      await showVendorSuccessToast(result.message || "Service area added.");
    } catch (error) {
      await showVendorErrorAlert(error.message || "Unable to create service area.");
    } finally {
      setIsCreatingArea(false);
    }
  }

  function handleToggleDay(dayValue) {
    setFormState((current) => {
      const nextActiveDays = current.activeDays.includes(dayValue)
        ? current.activeDays.filter((day) => day !== dayValue)
        : [...current.activeDays, dayValue];

      setCustomSlotDraft((draft) => ({
        ...draft,
        day: nextActiveDays.includes(draft.day)
          ? draft.day
          : (nextActiveDays[0] || DEFAULT_CUSTOM_SLOT_DRAFT.day),
      }));

      return {
        ...current,
        activeDays: nextActiveDays,
      };
    });
  }

  function handleRemoveTimeSlot(slotToRemove) {
    setFormState((current) => ({
      ...current,
      timeSlots: current.timeSlots.filter((slot) => (
        slot.day !== slotToRemove.day ||
        slot.start !== slotToRemove.start ||
        slot.end !== slotToRemove.end
      )),
    }));
  }

  function handleOpenAddSlotModal() {
    resetSlotDraftState();
    setIsAddSlotModalOpen(true);
  }

  function handleCloseAddSlotModal() {
    setIsAddSlotModalOpen(false);
    resetSlotDraftState();
  }

  function handleSaveCustomSlot() {
    if (!customSlotDraft.day) {
      setSlotDraftError("Choose a delivery day first.");
      return;
    }

    if (!customSlotDraft.start || !customSlotDraft.end) {
      setSlotDraftError("Enter both a start time and an end time.");
      return;
    }

    if (customSlotDraft.start >= customSlotDraft.end) {
      setSlotDraftError("Start time must be earlier than end time.");
      return;
    }

    const nextSlot = {
      day: customSlotDraft.day,
      start: customSlotDraft.start,
      end: customSlotDraft.end,
    };

    setFormState((current) => ({
      ...current,
      timeSlots: current.timeSlots.some((slot) => (
        slot.day === nextSlot.day &&
        slot.start === nextSlot.start &&
        slot.end === nextSlot.end
      ))
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
    resetSlotDraftState(savedSettings.activeDays);
    resetServiceAreaSearchState();
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
        setValidationState(buildValidationState(result));
        setSaveMessage(result?.message || "Fix validation errors before saving.");
        return;
      }

      const nextSavedSettings = mapVendorDeliverySettingsToForm(
        {
          deliverySettings: result.vendorDeliverySettings,
          serviceAreas: formState.serviceAreas,
        },
      );
      applyLoadedSettings(nextSavedSettings);
      resetServiceAreaSearchState();
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
    customAreaDraft,
    customAreaErrors,
    customSlotDraft,
    fieldErrors,
    freeDelivery: formState.freeDelivery,
    handleAddServiceArea,
    handleCancelChanges,
    handleCloseAddSlotModal,
    handleCreateCustomArea,
    handleCustomAreaDraftChange,
    handleOpenAddSlotModal,
    handleRemoveTimeSlot,
    handleRemoveServiceArea,
    handleSaveChanges,
    handleSaveCustomSlot,
    handleServiceAreaSearchChange,
    handleToggleDay,
    handleToggleMode,
    hasUnsavedChanges:
      JSON.stringify(currentComparable) !== JSON.stringify(savedComparable),
    isAddSlotModalOpen,
    isCreatingArea,
    loadError,
    isDeliveryDisabled,
    isLoading,
    isPickupOnly,
    isSaving,
    isSearchingAreas,
    isValidating,
    minDeliveryTime: formState.minDeliveryTime,
    maxDeliveriesPerDay: formState.maxDeliveriesPerDay,
    maxDeliveryTime: formState.maxDeliveryTime,
    maxOrdersPerTimeSlot: formState.maxOrdersPerTimeSlot,
    pickupAddress: formState.pickupAddress,
    pickupInstructions: formState.pickupInstructions,
    resetCustomAreaDraft,
    serviceAreaResults,
    serviceAreaSearch,
    serviceAreas: formState.serviceAreas,
    sameFeeAllDistances: formState.sameFeeAllDistances,
    saveMessage,
    selectedModes: formState.selectedModes,
    retryLoad: loadDeliverySettings,
    setBaseFee: (value) => setField("baseFee", value),
    setCustomSlotDraft,
    setFreeDelivery: (value) => setField("freeDelivery", value),
    setMinDeliveryTime: (value) => setField("minDeliveryTime", value),
    setMaxDeliveriesPerDay: (value) => setField("maxDeliveriesPerDay", value),
    setMaxDeliveryTime: (value) => setField("maxDeliveryTime", value),
    setMaxOrdersPerTimeSlot: (value) => setField("maxOrdersPerTimeSlot", value),
    setPickupAddress: (value) => setField("pickupAddress", value),
    setPickupInstructions: (value) => setField("pickupInstructions", value),
    setSameFeeAllDistances: (value) => setField("sameFeeAllDistances", value),
    slotDraftError,
    timeSlots: formState.timeSlots.map((slot) => ({
      ...slot,
      label: formatDeliveryTimeSlot(slot),
    })),
    validationState,
  };
}
