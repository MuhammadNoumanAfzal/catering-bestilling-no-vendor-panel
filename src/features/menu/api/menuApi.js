import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  CREATE_VENDOR_CATEGORY_MUTATION,
  DELETE_VENDOR_MENU_MUTATION,
  GET_VENDOR_MENU_DETAIL_QUERY,
  GET_VENDOR_MENU_FORM_BOOTSTRAP_QUERY,
  GET_VENDOR_MENUS_QUERY,
  SAVE_VENDOR_MENU_MUTATION,
  UPDATE_VENDOR_MENU_STATUS_MUTATION,
} from "./menuQueries";

function unwrapSuccessfulResult(result, key, fallbackMessage) {
  const payload = result?.[key];

  if (!payload?.success) {
    throw new Error(payload?.message || fallbackMessage);
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

export async function saveVendorMenu(variables) {
  const result = await executeProtectedGraphqlRequest(SAVE_VENDOR_MENU_MUTATION, variables);
  return unwrapSuccessfulResult(result, "vendorMenuMutation", "Unable to save the menu.");
}

export async function createVendorCategory(name) {
  const result = await executeProtectedGraphqlRequest(CREATE_VENDOR_CATEGORY_MUTATION, {
    input: { name },
  });

  return unwrapSuccessfulResult(
    result,
    "vendorCategoryMutation",
    "Unable to create the category.",
  );
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

export async function deleteVendorMenu(id) {
  const result = await executeProtectedGraphqlRequest(DELETE_VENDOR_MENU_MUTATION, { id });
  return unwrapSuccessfulResult(result, "vendorMenuDelete", "Unable to delete the menu.");
}
