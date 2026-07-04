import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  CHANGE_VENDOR_PASSWORD_MUTATION,
  DEACTIVATE_VENDOR_STORE_MUTATION,
  DELETE_VENDOR_SPECIAL_CLOSURE_MUTATION,
  DELETE_VENDOR_STORE_MUTATION,
  GET_VENDOR_SETTINGS_PAGE_QUERY,
  RESET_VENDOR_SETTINGS_TO_DEFAULT_MUTATION,
  UPDATE_VENDOR_ACCOUNT_PROFILE_MUTATION,
  UPDATE_VENDOR_BUSINESS_HOURS_MUTATION,
  UPDATE_VENDOR_BUSINESS_PROFILE_MUTATION,
  UPDATE_VENDOR_SETTINGS_IMAGES_MUTATION,
  UPDATE_VENDOR_NOTIFICATION_PREFERENCES_MUTATION,
  UPDATE_VENDOR_REGIONAL_PREFERENCES_MUTATION,
  UPSERT_VENDOR_SPECIAL_CLOSURE_MUTATION,
} from "./settingsQueries";

function createFallbackResult(message) {
  return {
    success: false,
    message,
    errors: [],
  };
}

export function getVendorSettingsPage() {
  return executeProtectedGraphqlRequest(GET_VENDOR_SETTINGS_PAGE_QUERY, {});
}

export async function updateVendorBusinessProfile(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_BUSINESS_PROFILE_MUTATION,
    { input },
  );

  return result?.updateVendorBusinessProfile || createFallbackResult("Unable to save business profile.");
}

export async function updateVendorSettingsImages(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_SETTINGS_IMAGES_MUTATION,
    { input },
  );

  return (
    result?.vendorSettingsMutation ||
    createFallbackResult("Unable to save vendor images.")
  );
}

export async function updateVendorAccountProfile(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_ACCOUNT_PROFILE_MUTATION,
    { input },
  );

  return result?.updateVendorAccountProfile || createFallbackResult("Unable to save account profile.");
}

export async function changeVendorPassword(input) {
  const result = await executeProtectedGraphqlRequest(
    CHANGE_VENDOR_PASSWORD_MUTATION,
    { input },
  );

  return result?.changeVendorPassword || createFallbackResult("Unable to change password.");
}

export async function updateVendorNotificationPreferences(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_NOTIFICATION_PREFERENCES_MUTATION,
    { input },
  );

  return (
    result?.updateVendorNotificationPreferences ||
    createFallbackResult("Unable to save notification preferences.")
  );
}

export async function updateVendorRegionalPreferences(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_REGIONAL_PREFERENCES_MUTATION,
    { input },
  );

  return (
    result?.updateVendorRegionalPreferences ||
    createFallbackResult("Unable to save regional preferences.")
  );
}

export async function updateVendorBusinessHours(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_BUSINESS_HOURS_MUTATION,
    { input },
  );

  return result?.updateVendorBusinessHours || createFallbackResult("Unable to save business hours.");
}

export async function upsertVendorSpecialClosure(input) {
  const result = await executeProtectedGraphqlRequest(
    UPSERT_VENDOR_SPECIAL_CLOSURE_MUTATION,
    { input },
  );

  return result?.upsertVendorSpecialClosure || createFallbackResult("Unable to save special closure.");
}

export async function deleteVendorSpecialClosure(id) {
  const result = await executeProtectedGraphqlRequest(
    DELETE_VENDOR_SPECIAL_CLOSURE_MUTATION,
    { id },
  );

  return result?.deleteVendorSpecialClosure || createFallbackResult("Unable to delete special closure.");
}

export async function deactivateVendorStore(input) {
  const result = await executeProtectedGraphqlRequest(
    DEACTIVATE_VENDOR_STORE_MUTATION,
    { input },
  );

  return result?.deactivateVendorStore || createFallbackResult("Unable to deactivate store.");
}

export async function deleteVendorStore(input) {
  const result = await executeProtectedGraphqlRequest(
    DELETE_VENDOR_STORE_MUTATION,
    { input },
  );

  return result?.deleteVendorStore || createFallbackResult("Unable to delete store.");
}

export async function resetVendorSettingsToDefault() {
  const result = await executeProtectedGraphqlRequest(
    RESET_VENDOR_SETTINGS_TO_DEFAULT_MUTATION,
    {},
  );

  return (
    result?.resetVendorSettingsToDefault ||
    createFallbackResult("Unable to reset settings to default.")
  );
}
