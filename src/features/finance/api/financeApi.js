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

function toDateTimeBoundary(value, boundary = "start") {
  if (!value) {
    return null;
  }

  const suffix =
    boundary === "end" ? "T23:59:59.999Z" : "T00:00:00.000Z";

  return `${value}${suffix}`;
}

function isLegacyDeliveryAreaError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("deliveryarea") && message.includes("attribute 'name'");
}

function mapInvoiceStatusToPayoutStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return ["PAID", "COMPLETED", "SETTLED"].includes(normalized) ? "PAID" : "PENDING";
}

function createPayoutCompatibilityResponse(invoiceResult) {
  const invoices = invoiceResult?.vendorInvoices || {};
  const edges = Array.isArray(invoices.edges) ? invoices.edges : [];

  return {
    vendorPayouts: {
      edges: edges.map((edge) => {
        const invoice = edge?.node || {};
        const amount = invoice.finalPrice ?? 0;
        const currency = "NOK";

        return {
          node: {
            id: invoice.id,
            payoutNumber: invoice.invoiceNumber ? `INV-${invoice.invoiceNumber}` : "",
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber || "",
            status: mapInvoiceStatusToPayoutStatus(invoice.paymentStatus),
            createdAt: invoice.deliveryDate || "",
            payoutReference: "",
            grossAmount: { amount, currency },
            commissionAmount: { amount: 0, currency },
            netAmount: { amount, currency },
          },
        };
      }),
      totalCount: invoices.totalCount || edges.length,
      pageInfo: invoices.pageInfo || {},
    },
  };
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
    dateFrom: toDateTimeBoundary(variables.dateFrom, "start"),
    dateTo: toDateTimeBoundary(variables.dateTo, "end"),
  });
}

export async function getVendorPayouts(variables = {}) {
  const payoutVariables = {
    first: 100,
    ...variables,
    dateFrom: toDateTimeBoundary(variables.dateFrom, "start"),
    dateTo: toDateTimeBoundary(variables.dateTo, "end"),
  };

  try {
    return await executeProtectedGraphqlRequest(GET_VENDOR_PAYOUTS_QUERY, payoutVariables);
  } catch (error) {
    if (!isLegacyDeliveryAreaError(error)) {
      throw error;
    }

    const invoiceResult = await executeProtectedGraphqlRequest(GET_VENDOR_INVOICES_QUERY, payoutVariables);
    return createPayoutCompatibilityResponse(invoiceResult);
  }
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
