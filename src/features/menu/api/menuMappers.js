import {
  formatChoiceLabel,
  pricingTypeLabelMap,
  statusLabelMap,
} from "../menuConstants";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return value == null ? "" : String(value);
}

function parseDecimalStringOrNull(value) {
  const trimmedValue = normalizeString(value).trim();

  if (!trimmedValue) {
    return null;
  }

  const normalized = trimmedValue.replace(/,/g, "").replace(/[^\d.-]/g, "");
  return normalized || null;
}

function parseDecimalNumberOrNull(value) {
  const normalized = parseDecimalStringOrNull(value);

  if (normalized == null) {
    return null;
  }

  const nextValue = Number(normalized);
  return Number.isFinite(nextValue) ? nextValue : null;
}

function formatDecimalStringOrNull(value, digits = 2) {
  const normalizedNumber = parseDecimalNumberOrNull(value);

  if (normalizedNumber == null) {
    return null;
  }

  return normalizedNumber.toFixed(digits);
}

function parseIntegerOrNull(value) {
  const trimmedValue = normalizeString(value).trim();

  if (!trimmedValue) {
    return null;
  }

  const normalized = trimmedValue.replace(/[^\d-]/g, "");
  return normalized ? Number(normalized) : null;
}

function getEdgeNodes(connection) {
  return safeArray(connection?.edges).map((edge) => edge?.node).filter(Boolean);
}

export function resolveMediaUrl(media) {
  if (!media) {
    return "";
  }

  if (typeof media === "string") {
    return media;
  }

  return media.fileUrl || media.imageUrl || "";
}

export function normalizeUploadedAsset(asset) {
  if (!asset) {
    return null;
  }

  return {
    fileId: asset.fileId,
    fileUrl: asset.fileUrl,
  };
}

export function mapChoiceOptions(choices = []) {
  return safeArray(choices).map((choice) => ({
    label: formatChoiceLabel(choice),
    value: choice,
  }));
}

export function mapFoodTypesToOptions(foodTypes = []) {
  return safeArray(foodTypes).map((foodType) => ({
    label: foodType.name || formatChoiceLabel(foodType.slug || ""),
    value: foodType.id || foodType.slug,
  }));
}

export function mapAllergensToOptions(allergens = []) {
  return safeArray(allergens).map((allergen) => ({
    label: allergen.name || formatChoiceLabel(allergen.slug || ""),
    value: allergen.id || allergen.slug,
  }));
}

export function mapCategoriesToOptions(categoriesConnection) {
  return getEdgeNodes(categoriesConnection)
    .map((category) => ({
      label: category.name,
      value: category.id,
    }));
}

export function mapVendorAddOnNodeToCard(node) {
  const formattedPrice = node.priceWithTax ? `kr ${node.priceWithTax}` : "";

  return {
    id: node.id,
    title: node.name,
    description: node.category?.name || "Optional add-on",
    price: formattedPrice,
    meta: (node.dietaryTags || []).join(", ") || "Available add-on",
    image: node.coverImage?.fileUrl || "/heroBg.webp",
    status: statusLabelMap[node.menuStatus] || formatChoiceLabel(node.menuStatus || "active"),
    badge: node.category?.name || "Add-on",
    tone: node.menuStatus || "active",
    isAddOn: true,
    isApiManaged: true,
    rawAddon: node,
  };
}

function formatMenuPrice(node) {
  if (!node?.priceWithTax) {
    return "";
  }

  const pricingLabel = pricingTypeLabelMap[node.pricingType];
  const basePrice = `kr ${node.priceWithTax}`;

  if (pricingLabel) {
    return `${basePrice} (${pricingLabel})`;
  }

  return basePrice;
}

export function mapVendorMenuNodeToCard(node) {
  return {
    id: node.id,
    title: node.title || node.name,
    description: node.description || "No description provided.",
    price: formatMenuPrice(node),
    meta: node.minimumGuests ? `Minimum ${node.minimumGuests} guests` : "Flexible guest count",
    image: node.coverImage?.fileUrl || "/heroBg.webp",
    status: statusLabelMap[node.menuStatus] || formatChoiceLabel(node.menuStatus || "draft"),
    badge: node.category?.name || node.menuType || "Menu",
    tone: node.menuStatus || "draft",
    categoryId: node.category?.id || "",
    category: node.category?.name || "",
    menuType: node.menuType || "",
    pricingType: node.pricingType || "",
    basePrice: node.priceWithTax || "",
    minimumGuests: node.minimumGuests ? String(node.minimumGuests) : "",
    updatedOn: node.updatedOn || node.createdOn || "",
    createdOn: node.createdOn || "",
    isApiManaged: true,
    rawMenu: node,
  };
}

export function mapMenuListResponse(data) {
  return getEdgeNodes(data?.vendorMenus).map(mapVendorMenuNodeToCard);
}

export function mapVendorAddOnDetailToForm(addOn) {
  if (!addOn) {
    return null;
  }

  const coverImage = addOn.coverImage
    ? normalizeUploadedAsset({
        fileId: addOn.coverImage.fileId,
        fileUrl: addOn.coverImage.fileUrl,
      })
    : null;

  return {
    id: addOn.id,
    addOnName: addOn.name || "",
    description: addOn.description || "",
    price: addOn.priceWithTax ? String(addOn.priceWithTax) : "",
    category: addOn.category?.id || "",
    customCategory: "",
    image: coverImage,
    mealTypes: safeArray(addOn.foodTypes)
      .map((foodType) => foodType?.id || foodType?.slug || "")
      .filter(Boolean),
    selectedDietary: safeArray(addOn.dietaryTags),
    availableImmediately: addOn.menuStatus === "active",
    status: addOn.menuStatus || "draft",
  };
}

export function mapVendorMenuDetailToForm(menu) {
  if (!menu) {
    return null;
  }

  const coverImage = menu.coverImage
    ? normalizeUploadedAsset({
        fileId: menu.coverImage.fileId,
        fileUrl: menu.coverImage.fileUrl,
      })
    : null;

  const galleryImages = getEdgeNodes(menu.attachments)
    .filter((attachment) => !attachment.isCover)
    .map((attachment) =>
      normalizeUploadedAsset({
        fileId: attachment.fileId,
        fileUrl: attachment.fileUrl,
      }),
    );

  const optionalAddOns = safeArray(menu.optionalAddOns);
  const selectedAddOnIds = optionalAddOns.flatMap((addOn) => {
    if (Array.isArray(addOn?.options) && addOn.options.length) {
      return addOn.options.map((option) => option.id).filter(Boolean);
    }

    return addOn?.id ? [addOn.id] : [];
  });

  return {
    id: menu.id,
    menuTitle: menu.title || menu.name || "",
    description: menu.description || "",
    category: menu.category?.id || "",
    productType: menu.menuType || "",
    menuTypes: safeArray(menu.foodTypes)
      .map((foodType) => foodType?.id || foodType?.slug || "")
      .filter(Boolean),
    coverImage,
    galleryImages,
    selectedDays: safeArray(menu.availableDays),
    leadTime: menu.minLeadTimeHours ? String(menu.minLeadTimeHours) : "24",
    blackoutDate: safeArray(menu.blackoutDates)[0] || "",
    selectedDietary: safeArray(menu.dietaryTags),
    customDietary: menu.customDietary || "",
    pricingMode: menu.pricingType || "",
    basePrice: menu.priceWithTax || "",
    minimumGuests: menu.minimumGuests ? String(menu.minimumGuests) : "",
    menuItems: safeArray(menu.menuItems).map((item, index) => ({
      id: item.id || `menu-item-${index + 1}`,
      title: item.title || "",
      allergens: safeArray(item.allergens)
        .map((allergen) => {
          if (typeof allergen === "string") {
            return allergen;
          }

          return allergen?.id || allergen?.slug || "";
        })
        .filter(Boolean),
      image: item.imageUrl
        ? normalizeUploadedAsset({
            fileId: item.fileId,
            fileUrl: item.imageUrl,
          })
        : null,
    })),
    selectedAddOnIds,
    status: menu.menuStatus || "draft",
    hasAvailabilityWindow: Boolean(menu.isAvailabilityWindowEnabled),
    availabilityStart: menu.availableFrom || "",
    availabilityEnd: menu.availableUntil || "",
  };
}

export function buildSaveVendorMenuVariables(formState, statusOverride, options = {}) {
  const includeAllergens = options.includeAllergens !== false;
  const selectedStatus = statusOverride || formState.status || "draft";
  const normalizedLeadTimeHours = Number(formState.leadTime || 24);

  const input = {
    ...(formState.id ? { id: formState.id } : {}),
    name: formState.menuTitle.trim(),
    title: formState.menuTitle.trim(),
    description: formState.description.trim(),
    category: formState.category,
    menuType: formState.productType,
    foodTypes: safeArray(formState.menuTypes).filter(Boolean),
    priceWithTax: formatDecimalStringOrNull(formState.basePrice),
    pricingType: formState.pricingMode,
    minimumGuests: parseIntegerOrNull(formState.minimumGuests),
    menuStatus: selectedStatus,
    minLeadTimeHours: normalizedLeadTimeHours,
    minLeadTimeDays: Math.max(1, Math.ceil(normalizedLeadTimeHours / 24)),
    availableDays: safeArray(formState.selectedDays),
    blackoutDates: formState.blackoutDate ? [formState.blackoutDate] : [],
    dietaryTags: safeArray(formState.selectedDietary),
    customDietary: formState.customDietary?.trim() || "",
    isAvailabilityWindowEnabled: Boolean(formState.hasAvailabilityWindow),
  };

  if (formState.hasAvailabilityWindow && formState.availabilityStart) {
    input.availableFrom = formState.availabilityStart;
  }

  if (formState.hasAvailabilityWindow && formState.availabilityEnd) {
    input.availableUntil = formState.availabilityEnd;
  }

  if (formState.coverImage?.fileUrl) {
    input.coverImageUrl = formState.coverImage.fileUrl;
    input.coverImageFileId = formState.coverImage.fileId;
  }

  const attachments = safeArray(formState.galleryImages)
    .filter((asset) => asset?.fileUrl && asset?.fileId)
    .map((asset) => ({
      fileUrl: asset.fileUrl,
      fileId: asset.fileId,
      isCover: false,
    }));

  const menuItems = safeArray(formState.menuItems)
    .filter((item) => item.title?.trim())
    .map((item, index) => {
      const nextItem = {
        title: item.title.trim(),
        order: index + 1,
      };

      const itemAllergens = safeArray(item.allergens)
        .map((allergen) => String(allergen || "").trim())
        .filter(Boolean);

      if (includeAllergens && itemAllergens.length) {
        nextItem.allergens = itemAllergens;
      }

      if (item.image?.fileUrl) {
        nextItem.imageUrl = item.image.fileUrl;
        nextItem.fileId = item.image.fileId;
      }

      return nextItem;
    });

  return {
    input,
    ingredients: [],
    attachments,
    menuItems,
    optionalAddOnIds: safeArray(formState.selectedAddOnIds),
  };
}

export function buildSaveVendorAddOnVariables(formState, options = {}) {
  const resolvedCategoryId = options.categoryId || formState.category;
  const selectedStatus = formState.availableImmediately ? "active" : formState.status || "draft";

  return {
    input: {
      ...(formState.id ? { id: formState.id } : {}),
      name: formState.addOnName.trim(),
      description: formState.description?.trim() || "",
      category: resolvedCategoryId,
      priceWithTax: formatDecimalStringOrNull(formState.price),
      menuStatus: selectedStatus,
      dietaryTags: safeArray(formState.selectedDietary),
      customDietary: "",
      availableDays: [],
      foodTypes: safeArray(formState.mealTypes).filter(Boolean),
      ...(formState.image?.fileUrl
        ? {
            coverImageUrl: formState.image.fileUrl,
            coverImageFileId: formState.image.fileId,
          }
        : {}),
    },
  };
}
