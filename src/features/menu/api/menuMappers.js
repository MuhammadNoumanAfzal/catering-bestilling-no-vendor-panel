import {
  formatChoiceLabel,
  pricingTypeLabelMap,
  statusLabelMap,
} from "../menuConstants";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
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
    menuType: menu.foodTypes?.[0]?.id || menu.foodTypes?.[0]?.slug || "",
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
      allergen: safeArray(item.allergens)[0] || "",
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

export function buildSaveVendorMenuVariables(formState, statusOverride) {
  const selectedStatus = statusOverride || formState.status || "draft";
  const normalizedLeadTimeHours = Number(formState.leadTime || 24);

  const input = {
    ...(formState.id ? { id: formState.id } : {}),
    name: formState.menuTitle.trim(),
    title: formState.menuTitle.trim(),
    description: formState.description.trim(),
    category: formState.category,
    menuType: formState.productType,
    foodTypes: formState.menuType ? [formState.menuType] : [],
    priceWithTax: String(formState.basePrice).trim(),
    pricingType: formState.pricingMode,
    minimumGuests: Number(formState.minimumGuests || 0),
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

      if (item.allergen?.trim()) {
        nextItem.allergens = [item.allergen.trim()];
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
