import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  CREATE_VENDOR_ORDER_ADJUSTMENT_MUTATION,
  GET_VENDOR_ORDER_DETAIL_QUERY,
  GET_VENDOR_ORDERS_QUERY,
  SEARCH_VENDOR_ADJUSTMENT_ITEMS_QUERY,
  UPDATE_VENDOR_ORDER_STATUS_MUTATION,
  GET_VENDOR_CUSTOMER_ORDER_HISTORY_QUERY,
} from "./orderQueries";

const PAGE_SIZE = 100;

function unwrapMutationResult(result, key, fallbackMessage) {
  const payload = result?.[key];

  if (!payload?.success) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export function getVendorOrdersPage(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_ORDERS_QUERY, {
    first: PAGE_SIZE,
    ...variables,
  });
}

export async function getAllVendorOrders(variables = {}) {
  const allEdges = [];
  let after = null;
  let summary = null;
  let totalCount = 0;

  while (true) {
    const result = await getVendorOrdersPage({
      ...variables,
      after,
    });
    const connection = result?.orders;
    const edges = Array.isArray(connection?.edges) ? connection.edges : [];

    if (summary == null) {
      summary = result?.vendorOrderSummary ?? null;
    }

    totalCount = Number(connection?.totalCount) || totalCount;
    allEdges.push(...edges);

    if (!connection?.pageInfo?.hasNextPage || !connection?.pageInfo?.endCursor) {
      break;
    }

    after = connection.pageInfo.endCursor;
  }

  return {
    vendorOrderSummary: summary,
    orders: {
      edges: allEdges,
      totalCount,
    },
  };
}

export function getVendorOrderDetail(id) {
  return executeProtectedGraphqlRequest(GET_VENDOR_ORDER_DETAIL_QUERY, { id });
}

export async function updateVendorOrderStatus({ id, status, note }) {
  const result = await executeProtectedGraphqlRequest(
    UPDATE_VENDOR_ORDER_STATUS_MUTATION,
    { id, status, note },
  );

  return unwrapMutationResult(
    result,
    "orderStatusUpdate",
    "Unable to update the order status.",
  );
}

export async function createVendorOrderAdjustment(input) {
  const result = await executeProtectedGraphqlRequest(
    CREATE_VENDOR_ORDER_ADJUSTMENT_MUTATION,
    { input },
  );

  return (
    result?.createVendorOrderAdjustment || {
      success: false,
      message: "Unable to create the order adjustment.",
      errors: [],
      adjustment: null,
    }
  );
}

export async function searchVendorAdjustmentItems({ search, first = 10 }) {
  const result = await executeProtectedGraphqlRequest(
    SEARCH_VENDOR_ADJUSTMENT_ITEMS_QUERY,
    { search, first },
  );

  const edges = Array.isArray(result?.vendorAdjustmentItems?.edges)
    ? result.vendorAdjustmentItems.edges
    : [];

  return edges
    .map((edge) => edge?.node)
    .filter(Boolean)
    .map((item) => ({
      id: item.id,
      backendId: item.id,
      name: item.name || item.title || "Item",
      serves: "",
      price: Number(item.priceWithTax ?? item.price) || 0,
      image: item.coverImage?.fileUrl || item.photo || "",
      description: item.description || "",
    }));
}

export function getVendorCustomerOrderHistory({ orderId, customerId }) {
  return executeProtectedGraphqlRequest(GET_VENDOR_CUSTOMER_ORDER_HISTORY_QUERY, {
    orderId,
    customerId,
  });
}

