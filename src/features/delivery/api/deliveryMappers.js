const DEFAULT_DELIVERY_DAYS = ["mo", "tu", "we", "th", "fr", "sa", "su"];
const DEFAULT_TIME_SLOTS = [
  { day: "mo", start: "11:00", end: "15:00" },
  { day: "fr", start: "18:00", end: "23:00" },
];

export const defaultDeliverySettings = {
  id: "",
  selectedModes: ["delivery", "pickup"],
  serviceAreas: [],
  pickupAddress: "",
  pickupInstructions: "",
  baseFee: "0.00",
  freeDelivery: "",
  sameFeeAllDistances: true,
  activeDays: DEFAULT_DELIVERY_DAYS,
  timeSlots: DEFAULT_TIME_SLOTS,
  maxDeliveriesPerDay: "",
  maxOrdersPerTimeSlot: "",
  minDeliveryTime: "",
  maxDeliveryTime: "",
  liveValidation: {
    isValid: true,
    issues: [],
    errors: [],
  },
};

function normalizeString(value) {
  return value == null ? "" : String(value);
}

function normalizeNullableString(value) {
  const nextValue = normalizeString(value).trim();
  return nextValue || "";
}

function normalizeDayCode(value) {
  const nextValue = normalizeNullableString(value).toLowerCase();
  return DEFAULT_DELIVERY_DAYS.includes(nextValue) ? nextValue : "";
}

function normalizePositiveIntegerString(value) {
  const normalizedValue = normalizeNullableString(value);

  if (!normalizedValue) {
    return "";
  }

  const numericValue = Number(normalizedValue);
  return Number.isFinite(numericValue) && numericValue > 0 ? normalizedValue : "";
}

export function deriveSelectedModes({
  deliveryAvailable,
  pickupAvailable,
  deliveryMode,
}) {
  if (deliveryAvailable && pickupAvailable) {
    return ["delivery", "pickup"];
  }

  if (deliveryAvailable) {
    return ["delivery"];
  }

  if (pickupAvailable) {
    return ["pickup"];
  }

  if (deliveryMode === "both") {
    return ["delivery", "pickup"];
  }

  if (deliveryMode === "pickup") {
    return ["pickup"];
  }

  return ["delivery"];
}

export function deriveDeliveryMode(selectedModes) {
  const hasDelivery = selectedModes.includes("delivery");
  const hasPickup = selectedModes.includes("pickup");

  if (hasDelivery && hasPickup) {
    return "both";
  }

  if (hasPickup) {
    return "pickup";
  }

  return "delivery";
}

function normalizeServiceArea(area) {
  return {
    id: area?.id || "",
    name: normalizeString(area?.name),
    postCode: normalizeString(area?.postCode),
    isActive: area?.isActive !== false,
  };
}

function normalizeDeliveryTimeSlot(slot) {
  const day = normalizeDayCode(slot?.day);
  const start = normalizeNullableString(slot?.start);
  const end = normalizeNullableString(slot?.end);

  if (!day || !start || !end) {
    return null;
  }

  return { day, start, end };
}

function sortDeliveryTimeSlots(slots = []) {
  return [...slots].sort((left, right) => {
    const leftKey = `${left.day}-${left.start}-${left.end}`;
    const rightKey = `${right.day}-${right.start}-${right.end}`;
    return leftKey.localeCompare(rightKey);
  });
}

export function mapVendorDeliverySettingsToForm(settingsPayload) {
  const settings = settingsPayload?.deliverySettings || settingsPayload;
  const serviceAreas = settingsPayload?.serviceAreas || [];

  if (!settings) {
    return defaultDeliverySettings;
  }

  return {
    id: settings.id || "",
    selectedModes: deriveSelectedModes(settings),
    serviceAreas: Array.isArray(serviceAreas)
      ? serviceAreas.map(normalizeServiceArea).filter((area) => area.id)
      : [],
    pickupAddress: normalizeString(settings.pickupAddress),
    pickupInstructions: normalizeString(settings.pickupInstructions),
    baseFee: normalizeString(settings.baseDeliveryFee || "0.00"),
    freeDelivery: normalizeNullableString(settings.freeDeliveryOver),
    sameFeeAllDistances: true,
    activeDays: Array.isArray(settings.deliveryDays) && settings.deliveryDays.length
      ? settings.deliveryDays
        .map(normalizeDayCode)
        .filter(Boolean)
      : DEFAULT_DELIVERY_DAYS,
    timeSlots:
      Array.isArray(settings.deliveryTimeSlots) && settings.deliveryTimeSlots.length
        ? sortDeliveryTimeSlots(
          settings.deliveryTimeSlots
            .map(normalizeDeliveryTimeSlot)
            .filter(Boolean),
        )
        : DEFAULT_TIME_SLOTS,
    maxDeliveriesPerDay: normalizePositiveIntegerString(settings.maxDeliveriesPerDay),
    maxOrdersPerTimeSlot: normalizePositiveIntegerString(settings.maxOrdersPerTimeSlot),
    minDeliveryTime: normalizeNullableString(settings.minDeliveryTime),
    maxDeliveryTime: normalizeNullableString(settings.maxDeliveryTime),
    liveValidation: {
      isValid: settings.liveValidation?.isValid ?? true,
      issues: Array.isArray(settings.liveValidation?.issues)
        ? settings.liveValidation.issues
        : [],
      errors: [],
    },
  };
}

function parseDecimalOrNull(value) {
  const trimmedValue = normalizeString(value).trim();

  if (!trimmedValue) {
    return null;
  }

  const normalized = trimmedValue.replace(/,/g, "").replace(/[^\d.-]/g, "");
  return normalized || null;
}

function parseIntegerOrNull(value) {
  const trimmedValue = normalizeString(value).trim();

  if (!trimmedValue) {
    return null;
  }

  const normalized = trimmedValue.replace(/[^\d-]/g, "");
  return normalized ? Number(normalized) : null;
}

function parsePositiveIntegerOrNull(value) {
  const parsedValue = parseIntegerOrNull(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

export function parseTimeSlotLabel(slotLabel) {
  const match = normalizeString(slotLabel)
    .trim()
    .match(/^(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);

  if (!match) {
    return null;
  }

  return {
    start: match[1],
    end: match[2],
  };
}

export function formatDeliveryTimeSlot(slot) {
  const normalizedSlot = normalizeDeliveryTimeSlot(slot);

  if (!normalizedSlot) {
    return "";
  }

  return `${normalizedSlot.start} - ${normalizedSlot.end}`;
}

export function buildDeliverySettingsInput(formState) {
  const selectedModes = formState.selectedModes || ["delivery"];
  const deliveryTimeSlots = sortDeliveryTimeSlots(
    (formState.timeSlots || [])
      .map((slot) => {
        if (typeof slot === "string") {
          const parsedSlot = parseTimeSlotLabel(slot);
          return parsedSlot ? { day: normalizeDayCode(formState.activeDays?.[0]), ...parsedSlot } : null;
        }

        return normalizeDeliveryTimeSlot(slot);
      })
      .filter(Boolean),
  );

  return {
    deliveryMode: deriveDeliveryMode(selectedModes),
    deliveryAvailable: selectedModes.includes("delivery"),
    pickupAvailable: selectedModes.includes("pickup"),
    validAreaIds: Array.isArray(formState.serviceAreas)
      ? formState.serviceAreas.map((area) => area.id).filter(Boolean)
      : [],
    pickupAddress: normalizeNullableString(formState.pickupAddress),
    pickupInstructions: normalizeNullableString(formState.pickupInstructions) || null,
    baseDeliveryFee: parseDecimalOrNull(formState.baseFee),
    freeDeliveryOver: parseDecimalOrNull(formState.freeDelivery),
    sameFeeAllDistances: true,
    deliveryDays: Array.isArray(formState.activeDays)
      ? formState.activeDays.map(normalizeDayCode).filter(Boolean)
      : [],
    deliveryTimeSlots,
    maxDeliveriesPerDay: parsePositiveIntegerOrNull(formState.maxDeliveriesPerDay),
    maxOrdersPerTimeSlot: parsePositiveIntegerOrNull(formState.maxOrdersPerTimeSlot),
    minDeliveryTime: parseIntegerOrNull(formState.minDeliveryTime),
    maxDeliveryTime: parseIntegerOrNull(formState.maxDeliveryTime),
  };
}

export function getComparableDeliverySettings(formState) {
  return {
    selectedModes: [...(formState.selectedModes || [])].sort(),
    serviceAreaIds: [...(formState.serviceAreas || [])]
      .map((area) => area.id)
      .filter(Boolean)
      .sort(),
    pickupAddress: normalizeNullableString(formState.pickupAddress),
    pickupInstructions: normalizeNullableString(formState.pickupInstructions),
    baseFee: normalizeNullableString(formState.baseFee),
    freeDelivery: normalizeNullableString(formState.freeDelivery),
    sameFeeAllDistances: true,
    activeDays: [...(formState.activeDays || [])]
      .map(normalizeDayCode)
      .filter(Boolean)
      .sort(),
    timeSlots: sortDeliveryTimeSlots(
      [...(formState.timeSlots || [])]
        .map((slot) => {
          if (typeof slot === "string") {
            const parsedSlot = parseTimeSlotLabel(slot);
            return parsedSlot ? { day: normalizeDayCode(formState.activeDays?.[0]), ...parsedSlot } : null;
          }

          return normalizeDeliveryTimeSlot(slot);
        })
        .filter(Boolean),
    ),
    maxDeliveriesPerDay: normalizeNullableString(formState.maxDeliveriesPerDay),
    maxOrdersPerTimeSlot: normalizeNullableString(formState.maxOrdersPerTimeSlot),
    minDeliveryTime: normalizeNullableString(formState.minDeliveryTime),
    maxDeliveryTime: normalizeNullableString(formState.maxDeliveryTime),
  };
}

export function mapFieldErrors(errors = []) {
  return errors.reduce((accumulator, error) => {
    if (!error?.field || accumulator[error.field]) {
      return accumulator;
    }

    return {
      ...accumulator,
      [error.field]: error.message || "Invalid value.",
    };
  }, {});
}
