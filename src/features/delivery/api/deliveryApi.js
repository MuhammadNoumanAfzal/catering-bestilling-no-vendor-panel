import i18n from "../../../i18n";
import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  GET_VENDOR_DELIVERY_SETTINGS_QUERY,
  SEARCH_AVAILABLE_AREAS_QUERY,
  UPDATE_VENDOR_DELIVERY_SETTINGS_MUTATION,
  VALIDATE_VENDOR_DELIVERY_SETTINGS_MUTATION,
  CREATE_VALID_AREA_MUTATION,
} from "./deliveryQueries";

export function getVendorDeliverySettings() {
  return executeProtectedGraphqlRequest(GET_VENDOR_DELIVERY_SETTINGS_QUERY, {});
}

export async function searchAvailableAreas({ term, first = 200 }) {
  const collectedAreas = [];
  let after = null;
  let hasNextPage = true;
  let requestCount = 0;

  while (hasNextPage && requestCount < 50) {
    const result = await executeProtectedGraphqlRequest(
      SEARCH_AVAILABLE_AREAS_QUERY,
      { term: term || null, first, after },
    );
    const connection = result?.vendorAvailableDeliveryAreas;

    if (!connection?.edges) {
      return Array.isArray(result?.validAreasSearch) ? result.validAreasSearch : [];
    }

    collectedAreas.push(
      ...connection.edges.map((edge) => edge?.node).filter(Boolean),
    );

    hasNextPage = Boolean(connection.pageInfo?.hasNextPage);
    after = connection.pageInfo?.endCursor || null;
    requestCount += 1;

    if (hasNextPage && !after) {
      break;
    }
  }

  return collectedAreas;
}

export async function updateVendorDeliverySettings(input) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_DELIVERY_SETTINGS_MUTATION,
    { input },
  );

  return result?.updateVendorDeliverySettings || {
    success: false,
    message: i18n.t("delivery.saveUnavailable"),
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

export async function createValidArea({ name, postCode }) {
  const result = await executeProtectedGraphqlRequest(
    CREATE_VALID_AREA_MUTATION,
    { input: { name: name.trim(), postCode: postCode.trim() } },
  );

  return result?.createValidArea || {
    success: false,
    message: i18n.t("delivery.createAreaFailed"),
    errors: [],
    validArea: null,
  };
}
