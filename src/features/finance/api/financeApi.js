import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  EXPORT_VENDOR_FINANCE_TRANSACTIONS_MUTATION,
  GET_VENDOR_FINANCE_OVERVIEW_CHART_QUERY,
  GET_VENDOR_FINANCE_SUMMARY_QUERY,
  GET_VENDOR_INVOICES_QUERY,
  GET_VENDOR_PAYOUTS_QUERY,
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

export function getVendorInvoices(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_INVOICES_QUERY, {
    first: 100,
    ...variables,
  });
}

export function getVendorPayouts(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_PAYOUTS_QUERY, {
    first: 100,
    ...variables,
  });
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
