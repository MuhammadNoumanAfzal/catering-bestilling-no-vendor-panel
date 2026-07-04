const DEFAULT_HOUR_TIME = "Closed";
const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const defaultSettingsState = {
  businessName: "",
  businessEmail: "",
  phoneNumber: "",
  businessAddress: "",
  businessDescription: "",
  cuisineType: "",
  customCuisineType: "",
  businessType: "",
  customBusinessType: "",
  establishedYear: "",
  taxId: "",
  profileImage: null,
  bannerImage: null,
  storeStatus: "",
  notifications: {
    newOrder: false,
    orderUpdates: false,
    reviewsRatings: false,
    promos_tips: false,
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,
  },
  language: "",
  currency: "",
  timeZone: "",
  account: {
    id: "",
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    role: "",
    username: "",
    accountId: "",
    avatar: null,
  },
  hours: WEEK_DAYS.map((day) => ({
    id: "",
    day,
    enabled: false,
    timeRange: "Closed",
    open: DEFAULT_HOUR_TIME,
    close: DEFAULT_HOUR_TIME,
  })),
  closures: [],
};

export const defaultSettingsOptions = {
  cuisineOptions: [],
  businessTypeOptions: [],
  closureTypeOptions: [],
  languageOptions: [],
  currencyOptions: [],
  timeZoneOptions: [],
};

function normalizeString(value) {
  return value == null ? "" : String(value);
}

function buildTimeRange(openTime, closeTime) {
  const start = normalizeString(openTime).trim();
  const end = normalizeString(closeTime).trim();

  if (!start || !end) {
    return "";
  }

  return `${start}-${end}`;
}

function splitTimeRange(value) {
  const normalized = normalizeString(value).trim();

  if (!normalized || normalized === "Closed") {
    return {
      open: DEFAULT_HOUR_TIME,
      close: DEFAULT_HOUR_TIME,
      timeRange: "Closed",
    };
  }

  const [start = "", end = ""] = normalized.split("-").map((item) => item.trim());

  if (!start || !end) {
    return {
      open: DEFAULT_HOUR_TIME,
      close: DEFAULT_HOUR_TIME,
      timeRange: "Closed",
    };
  }

  return {
    open: start,
    close: end,
    timeRange: `${start}-${end}`,
  };
}

function mapTaxonomyOptions(items = []) {
  return items
    .map((item) => ({
      value: item?.id || item?.slug || item?.name || "",
      label: item?.name || item?.slug || item?.id || "",
    }))
    .filter((item) => item.value && item.label);
}

function mapSimpleOptions(items = [], valueKey, labelKey) {
  return items
    .map((item) => ({
      value: item?.[valueKey] || "",
      label: item?.[labelKey] || item?.[valueKey] || "",
    }))
    .filter((item) => item.value && item.label);
}

function mapBusinessHours(hours = []) {
  return WEEK_DAYS.map((day) => {
    const matchedHour = hours.find((item) => normalizeString(item?.day) === day);

    if (!matchedHour) {
      return {
        id: "",
        day,
        enabled: false,
        timeRange: "Closed",
        open: DEFAULT_HOUR_TIME,
        close: DEFAULT_HOUR_TIME,
      };
    }

    const normalizedRange = splitTimeRange(
      matchedHour.timeRange || buildTimeRange(matchedHour.openTime, matchedHour.closeTime),
    );

    return {
      id: matchedHour.id || "",
      day,
      enabled: Boolean(matchedHour.enabled),
      timeRange: matchedHour.enabled ? normalizedRange.timeRange : "Closed",
      open: matchedHour.enabled ? normalizedRange.open : DEFAULT_HOUR_TIME,
      close: matchedHour.enabled ? normalizedRange.close : DEFAULT_HOUR_TIME,
    };
  });
}

function mapSpecialClosures(closures = []) {
  return closures.map((item) => ({
    id: item?.id || "",
    type: item?.type?.id || item?.type?.slug || item?.type?.name || "",
    typeLabel: item?.type?.name || "",
    start: normalizeString(item?.startDate),
    end: normalizeString(item?.endDate),
    reason: normalizeString(item?.reason),
    status: normalizeString(item?.status),
  }));
}

export function mapVendorSettingsPage(result) {
  const settings = result?.vendorSettings;
  const bootstrap = result?.vendorSettingsBootstrap;

  if (!settings) {
    return {
      settings: defaultSettingsState,
      options: defaultSettingsOptions,
    };
  }

  return {
    settings: {
      businessName: normalizeString(settings.businessProfile?.businessName),
      businessEmail: normalizeString(settings.businessProfile?.businessEmail),
      phoneNumber: normalizeString(settings.businessProfile?.phoneNumber),
      businessAddress: normalizeString(settings.businessProfile?.businessAddress),
      businessDescription: normalizeString(settings.businessProfile?.businessDescription),
      cuisineType:
        settings.businessProfile?.cuisineType?.id ||
        settings.businessProfile?.cuisineType?.slug ||
        "",
      customCuisineType: normalizeString(settings.businessProfile?.customCuisineType),
      businessType:
        settings.businessProfile?.businessType?.id ||
        settings.businessProfile?.businessType?.slug ||
        "",
      customBusinessType: normalizeString(settings.businessProfile?.customBusinessType),
      establishedYear: normalizeString(settings.businessProfile?.establishedYear),
      taxId: normalizeString(settings.businessProfile?.taxId),
      profileImage: settings.businessProfile?.profileImage || null,
      bannerImage:
        settings.businessProfile?.bannerImage ||
        settings.businessProfile?.coverImage ||
        null,
      storeStatus: normalizeString(settings.businessProfile?.storeStatus),
      notifications: {
        newOrder: Boolean(settings.notifications?.newOrder),
        orderUpdates: Boolean(settings.notifications?.orderUpdates),
        reviewsRatings: Boolean(settings.notifications?.reviewsRatings),
        promos_tips: Boolean(
          settings.notifications?.promos_tips ?? settings.notifications?.promosTips,
        ),
        emailNotifications: Boolean(settings.notifications?.emailNotifications),
        pushNotifications: Boolean(settings.notifications?.pushNotifications),
        smsNotifications: Boolean(settings.notifications?.smsNotifications),
      },
      language: normalizeString(settings.regionalPreferences?.language?.code),
      currency: normalizeString(settings.regionalPreferences?.currency?.code),
      timeZone: normalizeString(settings.regionalPreferences?.timeZone?.value),
      account: {
        id: normalizeString(settings.account?.id),
        fullName: normalizeString(settings.account?.fullName),
        emailAddress: normalizeString(settings.account?.emailAddress),
        phoneNumber: normalizeString(settings.account?.phoneNumber),
        role: normalizeString(settings.account?.role),
        username: normalizeString(settings.account?.username),
        accountId: normalizeString(settings.account?.accountId),
        avatar: settings.account?.avatar || null,
      },
      hours: mapBusinessHours(settings.businessHours),
      closures: mapSpecialClosures(settings.specialClosures),
    },
    options: {
      cuisineOptions: mapTaxonomyOptions(bootstrap?.cuisineTypes),
      businessTypeOptions: mapTaxonomyOptions(bootstrap?.businessTypes),
      closureTypeOptions: mapTaxonomyOptions(bootstrap?.closureTypes),
      languageOptions: mapSimpleOptions(bootstrap?.languages, "code", "label"),
      currencyOptions: mapSimpleOptions(bootstrap?.currencies, "code", "label"),
      timeZoneOptions: mapSimpleOptions(bootstrap?.timeZones, "value", "label"),
    },
  };
}

function parseIntegerOrNull(value) {
  const normalized = normalizeString(value).trim();

  if (!normalized) {
    return null;
  }

  const digits = normalized.replace(/[^\d-]/g, "");
  return digits ? Number(digits) : null;
}

export function buildBusinessProfileInput(settings) {
  return {
    businessName: normalizeString(settings.businessName).trim(),
    businessEmail: normalizeString(settings.businessEmail).trim(),
    phoneNumber: normalizeString(settings.phoneNumber).trim(),
    businessAddress: normalizeString(settings.businessAddress).trim(),
    businessDescription: normalizeString(settings.businessDescription).trim() || null,
    cuisineType: settings.cuisineType || null,
    customCuisineType: normalizeString(settings.customCuisineType).trim() || null,
    businessType: settings.businessType || null,
    customBusinessType: normalizeString(settings.customBusinessType).trim() || null,
    establishedYear: parseIntegerOrNull(settings.establishedYear),
    taxId: normalizeString(settings.taxId).trim() || null,
    profileImageFileId: settings.profileImage?.fileId || null,
  };
}

export function buildAccountProfileInput(settings) {
  return {
    fullName: normalizeString(settings.account.fullName).trim(),
    emailAddress: normalizeString(settings.account.emailAddress).trim(),
    phoneNumber: normalizeString(settings.account.phoneNumber).trim() || null,
    role: normalizeString(settings.account.role).trim() || null,
    username: normalizeString(settings.account.username).trim(),
    avatarFileId: settings.account.avatar?.fileId || null,
  };
}

export function buildPasswordChangeInput(passwordForm) {
  return {
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword,
    confirmPassword: passwordForm.confirmPassword,
  };
}

export function buildNotificationPreferencesInput(settings) {
  return {
    newOrder: Boolean(settings.notifications.newOrder),
    orderUpdates: Boolean(settings.notifications.orderUpdates),
    reviewsRatings: Boolean(settings.notifications.reviewsRatings),
    promosTips: Boolean(settings.notifications.promos_tips),
    emailNotifications: Boolean(settings.notifications.emailNotifications),
    pushNotifications: Boolean(settings.notifications.pushNotifications),
    smsNotifications: Boolean(settings.notifications.smsNotifications),
  };
}

export function buildRegionalPreferencesInput(settings) {
  return {
    languageCode: settings.language || "",
    currencyCode: settings.currency || "",
    timeZone: settings.timeZone || "",
  };
}

export function buildBusinessHoursInput(settings) {
  return settings.hours.map((item) => {
    const normalizedRange = splitTimeRange(item.timeRange);

    return {
      id: item.id || null,
      day: item.day,
      enabled: Boolean(item.enabled),
      timeRange: item.enabled ? normalizedRange.timeRange : null,
      openTime: item.enabled ? normalizedRange.open : null,
      closeTime: item.enabled ? normalizedRange.close : null,
    };
  });
}

export function buildSpecialClosureInput(type, start, end, reason, id) {
  return {
    id: id || null,
    type,
    startDate: start,
    endDate: end,
    reason: normalizeString(reason).trim() || null,
  };
}

export function buildStorePasswordInput(password) {
  return {
    password: normalizeString(password),
  };
}

export function getComparableSettingsState(settings) {
  return {
    businessProfile: buildBusinessProfileInput(settings),
    notifications: buildNotificationPreferencesInput(settings),
    regionalPreferences: buildRegionalPreferencesInput(settings),
    account: buildAccountProfileInput(settings),
    hours: buildBusinessHoursInput(settings),
    closures: [...(settings.closures || [])].map((item) => ({
      id: item.id,
      type: item.type,
      start: item.start,
      end: item.end,
      reason: item.reason,
      status: item.status,
    })),
  };
}

export function getComparablePasswordState(passwordForm) {
  return {
    currentPassword: normalizeString(passwordForm.currentPassword),
    newPassword: normalizeString(passwordForm.newPassword),
    confirmPassword: normalizeString(passwordForm.confirmPassword),
  };
}
