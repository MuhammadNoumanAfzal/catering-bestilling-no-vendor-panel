export const GET_VENDOR_FINANCE_SUMMARY_QUERY = `
  query GetVendorFinanceSummary(
    $rangePreset: String
    $dateFrom: Date
    $dateTo: Date
  ) {
    vendorFinanceSummary(
      rangePreset: $rangePreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      totalRevenue {
        amount
        currency
        formatted
      }
      pendingPayout {
        amount
        currency
        formatted
      }
      completedPayouts {
        amount
        currency
        formatted
      }
      commissionPaid {
        amount
        currency
        formatted
      }
    }
  }
`;

export const GET_VENDOR_FINANCE_OVERVIEW_CHART_QUERY = `
  query GetVendorFinanceOverviewChart(
    $rangePreset: String
    $dateFrom: Date
    $dateTo: Date
    $groupBy: String
  ) {
    vendorFinanceOverviewChart(
      rangePreset: $rangePreset
      dateFrom: $dateFrom
      dateTo: $dateTo
      groupBy: $groupBy
    ) {
      points {
        label
        earnings
        orders
      }
    }
  }
`;

export const GET_VENDOR_INVOICES_QUERY = `
  query GetVendorInvoices(
    $first: Int = 10
    $after: String
    $status: String
    $search: String
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    vendorInvoices(
      first: $first
      after: $after
      status: $status
      search: $search
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      totalCount
      edges {
        cursor
        node {
          id
          invoiceNumber
          customerName
          deliveryDate
          finalPrice
          paymentStatus
          paymentMethod
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_VENDOR_PAYOUTS_QUERY = `
  query GetVendorPayouts(
    $first: Int = 100
    $after: String
    $status: String
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    vendorPayouts(
      first: $first
      after: $after
      status: $status
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      edges {
        node {
          id
          payoutNumber
          invoiceId
          invoiceNumber
          status
          createdAt
          releasedAt
          paidAt
          settledAt
          payoutReference
          grossAmount {
            amount
            currency
            formatted
          }
          commissionAmount {
            amount
            currency
            formatted
          }
          netAmount {
            amount
            currency
            formatted
          }
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const EXPORT_VENDOR_FINANCE_TRANSACTIONS_MUTATION = `
  mutation ExportVendorFinanceTransactions(
    $status: String
    $dateFrom: Date
    $dateTo: Date
    $format: String!
  ) {
    exportVendorFinanceTransactions(
      status: $status
      dateFrom: $dateFrom
      dateTo: $dateTo
      format: $format
    ) {
      success
      message
      downloadUrl
    }
  }
`;
