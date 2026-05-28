import { useEffect, useState } from "react";
import { servicePostalCodes } from "../data/deliveryData";

const DELIVERY_SETTINGS_STORAGE_KEY = "delivery-settings";

const defaultDeliverySettings = {
  selectedModes: ["delivery"],
  postalCodes: servicePostalCodes,
  baseFee: "5",
  freeDelivery: "$ 3,000",
  activeDays: ["Mo", "Tu", "We", "Th", "Fr"],
  timeSlots: ["08:00 AM - 12:00 PM", "01:00 PM - 05:00 PM"],
  maxDistance: "150",
  maxOrders: "25",
};

function normalizeSelectedModes(value) {
  if (Array.isArray(value)) {
    const filteredModes = value.filter((mode) =>
      ["delivery", "pickup"].includes(mode),
    );

    return filteredModes.length ? filteredModes : ["delivery"];
  }

  if (value === "pickup") {
    return ["pickup"];
  }

  return ["delivery"];
}

function getStoredDeliverySettings() {
  if (typeof window === "undefined") {
    return defaultDeliverySettings;
  }

  try {
    const storedSettings = window.localStorage.getItem(
      DELIVERY_SETTINGS_STORAGE_KEY,
    );

    if (!storedSettings) {
      return defaultDeliverySettings;
    }

    const parsedSettings = JSON.parse(storedSettings);

    return {
      ...defaultDeliverySettings,
      ...parsedSettings,
      selectedModes: normalizeSelectedModes(
        parsedSettings.selectedModes ?? parsedSettings.selectedMode,
      ),
    };
  } catch {
    return defaultDeliverySettings;
  }
}

export default function useDeliverySettings() {
  const [savedSettings, setSavedSettings] = useState(defaultDeliverySettings);
  const [selectedModes, setSelectedModes] = useState(
    defaultDeliverySettings.selectedModes,
  );
  const [postalCode, setPostalCode] = useState("");
  const [postalCodes, setPostalCodes] = useState(defaultDeliverySettings.postalCodes);
  const [baseFee, setBaseFee] = useState(defaultDeliverySettings.baseFee);
  const [freeDelivery, setFreeDelivery] = useState(defaultDeliverySettings.freeDelivery);
  const [activeDays, setActiveDays] = useState(defaultDeliverySettings.activeDays);
  const [timeSlots, setTimeSlots] = useState(defaultDeliverySettings.timeSlots);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [customSlotDraft, setCustomSlotDraft] = useState("");
  const [maxDistance, setMaxDistance] = useState(defaultDeliverySettings.maxDistance);
  const [maxOrders, setMaxOrders] = useState(defaultDeliverySettings.maxOrders);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const initialSettings = getStoredDeliverySettings();

    setSavedSettings(initialSettings);
    setSelectedModes(initialSettings.selectedModes);
    setPostalCodes(initialSettings.postalCodes);
    setBaseFee(initialSettings.baseFee);
    setFreeDelivery(initialSettings.freeDelivery);
    setActiveDays(initialSettings.activeDays);
    setTimeSlots(initialSettings.timeSlots);
    setMaxDistance(initialSettings.maxDistance);
    setMaxOrders(initialSettings.maxOrders);
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

  function handleToggleMode(modeId) {
    setSelectedModes((currentModes) => {
      const hasMode = currentModes.includes(modeId);

      if (hasMode) {
        const nextModes = currentModes.filter((mode) => mode !== modeId);

        return nextModes.length ? nextModes : currentModes;
      }

      return [...currentModes, modeId];
    });
  }

  function handleToggleDay(day) {
    setActiveDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day],
    );
  }

  function handleRemovePostalCode(codeToRemove) {
    setPostalCodes((currentCodes) =>
      currentCodes.filter((code) => code !== codeToRemove),
    );
  }

  function handleRemoveTimeSlot(slotToRemove) {
    setTimeSlots((currentSlots) =>
      currentSlots.filter((slot) => slot !== slotToRemove),
    );
  }

  function handleOpenAddSlotModal() {
    setCustomSlotDraft("06:00 PM - 09:00 PM");
    setIsAddSlotModalOpen(true);
  }

  function handleCloseAddSlotModal() {
    setIsAddSlotModalOpen(false);
    setCustomSlotDraft("");
  }

  function handleSaveCustomSlot() {
    const trimmedSlot = customSlotDraft.trim();

    if (!trimmedSlot) {
      return;
    }

    setTimeSlots((currentSlots) =>
      currentSlots.includes(trimmedSlot)
        ? currentSlots
        : [...currentSlots, trimmedSlot],
    );
    handleCloseAddSlotModal();
  }

  function handleCancelChanges() {
    setSelectedModes(savedSettings.selectedModes);
    setPostalCode("");
    setPostalCodes(savedSettings.postalCodes);
    setBaseFee(savedSettings.baseFee);
    setFreeDelivery(savedSettings.freeDelivery);
    setActiveDays(savedSettings.activeDays);
    setTimeSlots(savedSettings.timeSlots);
    setMaxDistance(savedSettings.maxDistance);
    setMaxOrders(savedSettings.maxOrders);
    setIsAddSlotModalOpen(false);
    setCustomSlotDraft("");
    setSaveMessage("Changes discarded.");
  }

  function handleSaveChanges() {
    const nextSavedSettings = {
      selectedModes,
      postalCodes,
      baseFee,
      freeDelivery,
      activeDays,
      timeSlots,
      maxDistance,
      maxOrders,
    };

    setSavedSettings(nextSavedSettings);
    window.localStorage.setItem(
      DELIVERY_SETTINGS_STORAGE_KEY,
      JSON.stringify(nextSavedSettings),
    );
    setSaveMessage("Changes saved.");
  }

  const filteredPostalCodes = postalCodes.filter((code) =>
    code.toLowerCase().includes(postalCode.trim().toLowerCase()),
  );
  const isPickupOnly =
    selectedModes.includes("pickup") && !selectedModes.includes("delivery");
  const currentSettings = {
    selectedModes,
    postalCodes,
    baseFee,
    freeDelivery,
    activeDays,
    timeSlots,
    maxDistance,
    maxOrders,
  };

  return {
    activeDays,
    baseFee,
    customSlotDraft,
    filteredPostalCodes,
    freeDelivery,
    handleCancelChanges,
    handleCloseAddSlotModal,
    handleOpenAddSlotModal,
    handleRemovePostalCode,
    handleRemoveTimeSlot,
    handleSaveChanges,
    handleSaveCustomSlot,
    handleToggleDay,
    handleToggleMode,
    hasUnsavedChanges:
      JSON.stringify(currentSettings) !== JSON.stringify(savedSettings),
    isAddSlotModalOpen,
    isPickupOnly,
    maxDistance,
    maxOrders,
    postalCode,
    saveMessage,
    selectedModes,
    setBaseFee,
    setCustomSlotDraft,
    setFreeDelivery,
    setMaxDistance,
    setMaxOrders,
    setPostalCode,
    timeSlots,
  };
}
