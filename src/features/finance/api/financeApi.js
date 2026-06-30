import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  EXPORT_VENDOR_FINANCE_TRANSACTIONS_MUTATION,
  GET_VENDOR_FINANCE_OVERVIEW_CHART_QUERY,
  GET_VENDOR_FINANCE_SUMMARY_QUERY,
  GET_VENDOR_FINANCE_TRANSACTION_DETAIL_QUERY,
  GET_VENDOR_FINANCE_TRANSACTIONS_QUERY,
  GET_VENDOR_PAYOUT_STATUS_QUERY,
} from "./financeQueries";

function unwrapMutationResult(result, key, fallbackMessage) {
  const payload = result?.[key];

  if (!payload?.success) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export function getVendorFinanceSummary(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_FINANCE_SUMMARY_QUERY, variables);
}

export function getVendorFinanceOverviewChart(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_FINANCE_OVERVIEW_CHART_QUERY, variables);
}

export function getVendorPayoutStatus() {
  return executeProtectedGraphqlRequest(GET_VENDOR_PAYOUT_STATUS_QUERY, {});
}

export function getVendorFinanceTransactions(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_FINANCE_TRANSACTIONS_QUERY, {
    first: 10,
    ...variables,
  });
}

export function getVendorFinanceTransactionDetail(id) {
  return executeProtectedGraphqlRequest(GET_VENDOR_FINANCE_TRANSACTION_DETAIL_QUERY, { id });
}

export async function exportVendorFinanceTransactions(variables) {
  const result = await executeProtectedGraphqlRequest(
    EXPORT_VENDOR_FINANCE_TRANSACTIONS_MUTATION,
    variables,
  );

  return unwrapMutationResult(
    result,
    "exportVendorFinanceTransactions",
    "Unable to export finance transactions.",
  );
}
