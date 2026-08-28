const DEFAULT_HOUR_TIME = "Closed";
const NORWAY_TIME_ZONE = "Europe/Oslo";
const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const FALLBACK_CLOSURE_TYPE_OPTIONS = [
  { value: "holiday", label: "Holiday" },
  { value: "vacation", label: "Vacation" },
  { value: "maintenance", label: "Maintenance" },
  { value: "private_event", label: "Private Event" },
  { value: "emergency", label: "Emergency" },
];
const SUPPORTED_VENDOR_LANGUAGE_CODES = new Set(["en", "no", "nb", "nn"]);

export const defaultSettingsState = {
  businessName: "",
  businessEmail: "",
  phoneNumber: "",
  businessAddress: "",
  postalCode: "",
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
  timeZone: NORWAY_TIME_ZONE,
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
  payoutProfile: {
    payoutMethod: "BANK_TRANSFER",
    bankDetailsVerified: false,
    verificationStatus: "",
    verificationNote: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    iban: "",
    swiftBic: "",
    routingNumber: "",
    branchName: "",
    branchCode: "",
    billingAddress: "",
    city: "",
    postalCode: "",
    country: "Norway",
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

export const defaultApplicationReviewState = {
  id: "",
  vendorId: "",
  applicationStatus: "",
  canApprove: false,
  isReadyForApproval: false,
  checklistCompleted: 0,
  checklistTotal: 0,
  vendorStatus: "",
  currentStatus: "",
  reviewedAt: "",
  changeRequestMessage: "",
  missingRequirements: [],
  requestedFields: [],
  latestChangeRequest: null,
};

export const defaultSettingsOptions = {
  cuisineOptions: [],
  businessTypeOptions: [],
  closureTypeOptions: [],
  languageOptions: [],
  currencyOptions: [],
};

function normalizeString(value) {
  return value == null ? "" : String(value);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getEdgeNodes(connection) {
  return safeArray(connection?.edges).map((edge) => edge?.node).filter(Boolean);
}

function getCollectionItems(value) {
  if (Array.isArray(value)) {
    return value;
  }

  return getEdgeNodes(value);
}

function sortOptionItems(items = []) {
  return [...items].sort((left, right) => {
    const leftOrder = Number.isInteger(left?.sortOrder) ? left.sortOrder : Number.MAX_SAFE_INTEGER;
    const rightOrder = Number.isInteger(right?.sortOrder) ? right.sortOrder : Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return normalizeString(left?.name || left?.label || left?.code || left?.value).localeCompare(
      normalizeString(right?.name || right?.label || right?.code || right?.value),
    );
  });
}

function normalizeAssetFromUrl(fileUrl, fileId) {
  const normalizedUrl = normalizeString(fileUrl).trim();

  if (!normalizedUrl) {
    return null;
  }

  return {
    fileUrl: normalizedUrl,
    fileId: normalizeString(fileId).trim(),
  };
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
  return sortOptionItems(getCollectionItems(items))
    .filter((item) => item?.isActive !== false)
    .map((item) => ({
      value: item?.id || item?.slug || item?.name || "",
      label: item?.name || item?.slug || item?.id || "",
    }))
    .filter((item) => item.value && item.label);
}

function dedupeOptionItems(items = []) {
  const seen = new Set();

  return items.filter((item) => {
    const value = normalizeString(item?.value).trim();

    if (!value || seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

function mapClosureTypeOptions(bootstrapItems = [], closures = []) {
  const bootstrapOptions = mapTaxonomyOptions(bootstrapItems);

  if (bootstrapOptions.length) {
    return bootstrapOptions;
  }

  const derivedOptions = safeArray(closures)
    .map((item) => ({
      value: item?.type?.id || item?.type?.slug || item?.type?.name || "",
      label: item?.type?.name || item?.type?.slug || item?.type?.id || "",
    }))
    .filter((item) => item.value && item.label);

  return dedupeOptionItems([...derivedOptions, ...FALLBACK_CLOSURE_TYPE_OPTIONS]);
}

function mapSimpleOptions(items = [], valueKey, labelKey) {
  return sortOptionItems(getCollectionItems(items))
    .filter((item) => item?.isActive !== false)
    .map((item) => ({
      value: item?.[valueKey] || "",
      label: item?.[labelKey] || item?.[valueKey] || "",
    }))
    .filter((item) => item.value && item.label);
}

function mapCurrencyOptions(items = []) {
  return sortOptionItems(getCollectionItems(items))
    .filter((item) => item?.isActive !== false)
    .map((item) => {
      const code = item?.code || "";
      const label = item?.label || code;
      const symbol = item?.symbol ? ` (${item.symbol})` : "";

      return {
        value: code,
        label: `${label}${symbol}`,
      };
    })
    .filter((item) => item.value && item.label);
}

function mapVendorLanguageOptions(items = []) {
  return mapSimpleOptions(items, "code", "label").filter((item) =>
    SUPPORTED_VENDOR_LANGUAGE_CODES.has(normalizeString(item.value).trim().toLowerCase()),
  );
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

function mapChecklistRequirements(items = []) {
  return items
    .map((item) => ({
      code: normalizeString(item?.code),
      label: normalizeString(item?.label),
    }))
    .filter((item) => item.code || item.label);
}

function mapApplicationReview(review) {
  if (!review) {
    return defaultApplicationReviewState;
  }

  return {
    id: normalizeString(review.id),
    vendorId: normalizeString(review.vendorId),
    applicationStatus: normalizeString(review.applicationStatus),
    canApprove: Boolean(review.canApprove),
    isReadyForApproval: Boolean(review.isReadyForApproval),
    checklistCompleted: Number(review.checklistCompleted ?? 0),
    checklistTotal: Number(review.checklistTotal ?? 0),
    vendorStatus: normalizeString(review.vendorStatus),
    currentStatus: normalizeString(review.currentStatus),
    reviewedAt: normalizeString(review.reviewedAt),
    changeRequestMessage: normalizeString(
      review.changeRequestMessage || review.latestChangeRequest?.message,
    ),
    missingRequirements: mapChecklistRequirements(review.missingRequirements),
    requestedFields: mapChecklistRequirements(review.requestedFields),
    latestChangeRequest: review.latestChangeRequest
      ? {
          id: normalizeString(review.latestChangeRequest.id),
          message: normalizeString(review.latestChangeRequest.message),
          createdAt: normalizeString(review.latestChangeRequest.createdAt),
          fields: mapChecklistRequirements(review.latestChangeRequest.fields),
        }
      : null,
  };
}

function resolveCurrentVendorStatuses(me, authUser) {
  return {
    applicationStatus: normalizeString(
      me?.applicationStatus || authUser?.applicationStatus,
    ),
    vendorStatus: normalizeString(me?.vendorStatus || authUser?.vendorStatus),
    currentStatus: normalizeString(me?.status || authUser?.status),
  };
}

export function mapVendorSettingsPage(result, options = {}) {
  const settings = result?.vendorSettings;
  const bootstrap = result?.vendorSettingsBootstrap;
  const authUser = options?.authUser || null;
  const me = result?.me || null;
  const currentStatuses = resolveCurrentVendorStatuses(me, authUser);

  if (!settings) {
    return {
      settings: defaultSettingsState,
      options: defaultSettingsOptions,
      applicationReview: {
        ...defaultApplicationReviewState,
        applicationStatus: currentStatuses.applicationStatus,
        vendorStatus: currentStatuses.vendorStatus,
        currentStatus: currentStatuses.currentStatus,
      },
    };
  }

  const mappedApplicationReview = mapApplicationReview(result?.vendorApplicationReviewStatus);

  return {
    settings: {
      businessName: normalizeString(settings.businessProfile?.businessName),
      businessEmail: normalizeString(settings.businessProfile?.businessEmail),
      phoneNumber: normalizeString(settings.businessProfile?.phoneNumber),
      businessAddress: normalizeString(settings.businessProfile?.businessAddress),
      postalCode: normalizeString(authUser?.postCode),
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
      profileImage:
        settings.businessProfile?.profileImage ||
        normalizeAssetFromUrl(settings.logoUrl, settings.fileId),
      bannerImage: normalizeAssetFromUrl(
        settings.coverPhotoUrl,
        settings.coverPhotoFileId,
      ),
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
      timeZone: normalizeString(settings.regionalPreferences?.timeZone?.value || NORWAY_TIME_ZONE),
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
      payoutProfile: {
        payoutMethod: normalizeString(result?.myVendorPayoutProfile?.payoutMethod || "BANK_TRANSFER"),
        bankDetailsVerified: Boolean(result?.myVendorPayoutProfile?.bankDetailsVerified),
        verificationStatus: normalizeString(result?.myVendorPayoutProfile?.verificationStatus),
        verificationNote: normalizeString(result?.myVendorPayoutProfile?.verificationNote),
        accountHolderName: normalizeString(result?.myVendorPayoutProfile?.accountHolderName),
        bankName: normalizeString(result?.myVendorPayoutProfile?.bankName),
        accountNumber: normalizeString(result?.myVendorPayoutProfile?.accountNumber),
        iban: normalizeString(result?.myVendorPayoutProfile?.iban),
        swiftBic: normalizeString(result?.myVendorPayoutProfile?.swiftBic),
        routingNumber: normalizeString(result?.myVendorPayoutProfile?.routingNumber),
        branchName: normalizeString(result?.myVendorPayoutProfile?.branchName),
        branchCode: normalizeString(result?.myVendorPayoutProfile?.branchCode),
        billingAddress: normalizeString(result?.myVendorPayoutProfile?.billingAddress),
        city: normalizeString(result?.myVendorPayoutProfile?.city),
        postalCode: normalizeString(result?.myVendorPayoutProfile?.postalCode),
        country: normalizeString(result?.myVendorPayoutProfile?.country || "Norway"),
      },
      hours: mapBusinessHours(settings.businessHours),
      closures: mapSpecialClosures(settings.specialClosures),
    },
    options: {
      cuisineOptions: mapTaxonomyOptions(bootstrap?.cuisineTypes),
      businessTypeOptions: mapTaxonomyOptions(bootstrap?.businessTypes),
      closureTypeOptions: mapClosureTypeOptions(
        bootstrap?.closureTypes,
        settings.specialClosures,
      ),
      languageOptions: mapVendorLanguageOptions(bootstrap?.languages),
      currencyOptions: mapCurrencyOptions(bootstrap?.currencies),
    },
    applicationReview: {
      ...mappedApplicationReview,
      applicationStatus:
        currentStatuses.applicationStatus || mappedApplicationReview.applicationStatus,
      vendorStatus: currentStatuses.vendorStatus,
      currentStatus: currentStatuses.currentStatus,
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
  };
}

export function buildVendorSettingsImagesInput(settings) {
  return {
    logoUrl: settings.profileImage?.fileUrl || null,
    coverPhotoUrl: settings.bannerImage?.fileUrl || null,
    businessAddress: normalizeString(settings.businessAddress).trim() || null,
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
    timeZone: settings.timeZone || NORWAY_TIME_ZONE,
  };
}

export function buildPayoutProfileInput(settings) {
  return {
    payoutMethod: normalizeString(settings.payoutProfile?.payoutMethod).trim() || "BANK_TRANSFER",
    accountHolderName: normalizeString(settings.payoutProfile?.accountHolderName).trim(),
    bankName: normalizeString(settings.payoutProfile?.bankName).trim() || null,
    accountNumber: normalizeString(settings.payoutProfile?.accountNumber).trim() || null,
    iban: normalizeString(settings.payoutProfile?.iban).trim() || null,
    swiftBic: normalizeString(settings.payoutProfile?.swiftBic).trim() || null,
    routingNumber: normalizeString(settings.payoutProfile?.routingNumber).trim() || null,
    branchName: normalizeString(settings.payoutProfile?.branchName).trim() || null,
    branchCode: normalizeString(settings.payoutProfile?.branchCode).trim() || null,
    billingAddress: normalizeString(settings.payoutProfile?.billingAddress).trim() || null,
    city: normalizeString(settings.payoutProfile?.city).trim() || null,
    postalCode: normalizeString(settings.payoutProfile?.postalCode).trim() || null,
    country: normalizeString(settings.payoutProfile?.country).trim() || null,
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
    vendorImages: buildVendorSettingsImagesInput(settings),
    businessProfile: buildBusinessProfileInput(settings),
    notifications: buildNotificationPreferencesInput(settings),
    regionalPreferences: buildRegionalPreferencesInput(settings),
    payoutProfile: buildPayoutProfileInput(settings),
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
