import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  GET_VENDOR_DELIVERY_SETTINGS_QUERY,
  UPDATE_VENDOR_DELIVERY_SETTINGS_MUTATION,
  VALIDATE_VENDOR_DELIVERY_SETTINGS_MUTATION,
} from "./deliveryQueries";

export function getVendorDeliverySettings() {
  return executeProtectedGraphqlRequest(GET_VENDOR_DELIVERY_SETTINGS_QUERY, {});
}

export async function updateVendorDeliverySettings(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_DELIVERY_SETTINGS_MUTATION,
    { input },
  );

  return result?.updateVendorDeliverySettings || {
    success: false,
    message: "Unable to save delivery settings.",
    errors: [],
    vendorDeliverySettings: null,
  };
}

export async function validateVendorDeliverySettings(input) {
  const result = await executeProtectedGraphqlRequest(
    VALIDATE_VENDOR_DELIVERY_SETTINGS_MUTATION,
    { input },
  );

  return result?.validateVendorDeliverySettings || {
    isValid: false,
    issues: [],
    errors: [],
  };
}
