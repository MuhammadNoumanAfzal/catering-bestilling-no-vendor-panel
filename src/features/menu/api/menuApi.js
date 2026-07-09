import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  CREATE_ALLERGEN_MUTATION,
  CREATE_FOOD_TYPE_MUTATION,
  CREATE_OCCASION_MUTATION,
  CREATE_VENDOR_CATEGORY_MUTATION,
  DELETE_VENDOR_ADD_ON_MUTATION,
  DELETE_VENDOR_MENU_MUTATION,
  DELETE_VENDOR_CATEGORY_MUTATION,
  DELETE_FOOD_TYPE_MUTATION,
  DELETE_OCCASION_MUTATION,
  GET_VENDOR_ADD_ON_DETAIL_QUERY,
  GET_VENDOR_ADD_ON_FORM_BOOTSTRAP_QUERY,
  GET_VENDOR_ADD_ONS_QUERY,
  GET_VENDOR_MENU_DETAIL_QUERY,
  GET_VENDOR_MENU_FORM_BOOTSTRAP_QUERY,
  GET_VENDOR_MENUS_QUERY,
  SAVE_VENDOR_ADD_ON_MUTATION,
  SAVE_VENDOR_MENU_MUTATION,
  UPDATE_VENDOR_ADD_ON_STATUS_MUTATION,
  UPDATE_VENDOR_MENU_STATUS_MUTATION,
} from "./menuQueries";

function unwrapSuccessfulResult(result, key, fallbackMessage) {
  const payload = result?.[key];
  const firstValidationError = Array.isArray(payload?.errors)
    ? payload.errors.find((error) => error?.message)
    : null;

  if (!payload?.success) {
    throw new Error(firstValidationError?.message || payload?.message || fallbackMessage);
  }

  return payload;
}

export function getVendorMenuFormBootstrap() {
  return executeProtectedGraphqlRequest(GET_VENDOR_MENU_FORM_BOOTSTRAP_QUERY, {});
}

export function getVendorMenuDetail(id) {
  return executeProtectedGraphqlRequest(GET_VENDOR_MENU_DETAIL_QUERY, { id });
}

export function getVendorMenus(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_MENUS_QUERY, {
    first: 50,
    ...variables,
  });
}

export function getVendorAddOnFormBootstrap() {
  return executeProtectedGraphqlRequest(GET_VENDOR_ADD_ON_FORM_BOOTSTRAP_QUERY, {});
}

export function getVendorAddOns(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_ADD_ONS_QUERY, {
    first: 50,
    ...variables,
  });
}

export function getVendorAddOnDetail(id) {
  return executeProtectedGraphqlRequest(GET_VENDOR_ADD_ON_DETAIL_QUERY, { id });
}

export async function saveVendorMenu(variables) {
  const result = await executeProtectedGraphqlRequest(SAVE_VENDOR_MENU_MUTATION, variables);
  return unwrapSuccessfulResult(result, "vendorMenuMutation", "Unable to save the menu.");
}

export async function saveVendorAddOn(variables) {
  const result = await executeProtectedGraphqlRequest(SAVE_VENDOR_ADD_ON_MUTATION, variables);
  return unwrapSuccessfulResult(result, "vendorAddOnMutation", "Unable to save the add-on.");
}

export async function createVendorCategory(input) {
  const variables =
    typeof input === "string"
      ? { name: input }
      : { id: input?.id || null, name: input?.name || "" };

  const result = await executeProtectedGraphqlRequest(CREATE_VENDOR_CATEGORY_MUTATION, {
    input: variables,
  });

  return unwrapSuccessfulResult(
    result,
    "vendorCategoryMutation",
    "Unable to create the category.",
  );
}

export async function createFoodType(input) {
  const variables =
    typeof input === "string"
      ? { name: input }
      : { id: input?.id || null, name: input?.name || "" };

  const result = await executeProtectedGraphqlRequest(CREATE_FOOD_TYPE_MUTATION, {
    input: variables,
  });

  return unwrapSuccessfulResult(result, "foodTypeMutation", "Unable to create the meal type.");
}

export async function createOccasion(input) {
  const variables =
    typeof input === "string"
      ? { name: input }
      : {
          name: input?.name || "",
          id: input?.id || null,
          slug: input?.slug || null,
          description: input?.description || null,
          iconUrl: input?.iconUrl || null,
          coverImageUrl: input?.coverImageUrl || null,
          isActive: typeof input?.isActive === "boolean" ? input.isActive : null,
          sortOrder: Number.isInteger(input?.sortOrder) ? input.sortOrder : null,
        };

  const result = await executeProtectedGraphqlRequest(CREATE_OCCASION_MUTATION, {
    ...variables,
  });

  return unwrapSuccessfulResult(result, "occasionMutation", "Unable to create the occasion.");
}

export async function createAllergen(input) {
  const variables =
    typeof input === "string"
      ? { name: input }
      : { id: input?.id || null, name: input?.name || "" };

  const result = await executeProtectedGraphqlRequest(CREATE_ALLERGEN_MUTATION, {
    input: variables,
  });

  return unwrapSuccessfulResult(result, "allergenMutation", "Unable to create the allergen.");
}

export async function updateVendorMenuStatus(id, menuStatus) {
  const result = await executeProtectedGraphqlRequest(UPDATE_VENDOR_MENU_STATUS_MUTATION, {
    id,
    menuStatus,
  });

  return unwrapSuccessfulResult(
    result,
    "vendorMenuStatusUpdate",
    "Unable to update the menu status.",
  );
}

export async function updateVendorAddOnStatus(id, menuStatus) {
  const result = await executeProtectedGraphqlRequest(UPDATE_VENDOR_ADD_ON_STATUS_MUTATION, {
    id,
    menuStatus,
  });

  return unwrapSuccessfulResult(
    result,
    "vendorAddOnStatusUpdate",
    "Unable to update the add-on status.",
  );
}

export async function deleteVendorMenu(id) {
  const result = await executeProtectedGraphqlRequest(DELETE_VENDOR_MENU_MUTATION, { id });
  return unwrapSuccessfulResult(result, "vendorMenuDelete", "Unable to delete the menu.");
}

export async function deleteVendorAddOn(id) {
  const result = await executeProtectedGraphqlRequest(DELETE_VENDOR_ADD_ON_MUTATION, { id });
  return unwrapSuccessfulResult(result, "vendorAddOnDelete", "Unable to delete the add-on.");
}

export async function deleteVendorCategory(id) {
  const result = await executeProtectedGraphqlRequest(DELETE_VENDOR_CATEGORY_MUTATION, { id });
  return unwrapSuccessfulResult(result, "vendorCategoryDelete", "Unable to delete the category.");
}

export async function deleteFoodType(id) {
  const result = await executeProtectedGraphqlRequest(DELETE_FOOD_TYPE_MUTATION, { id });
  return unwrapSuccessfulResult(result, "foodTypeDelete", "Unable to delete the food type.");
}

export async function deleteOccasion(id) {
  const result = await executeProtectedGraphqlRequest(DELETE_OCCASION_MUTATION, { id });
  return unwrapSuccessfulResult(result, "occasionDelete", "Unable to delete the occasion.");
}
