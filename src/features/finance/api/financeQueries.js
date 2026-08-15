export const GET_VENDOR_FINANCE_SUMMARY_QUERY = `
  query GetVendorFinanceSummary(
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    vendorFinanceSummary(
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
    $dateFrom: Date
    $dateTo: Date
    $groupBy: String
  ) {
    vendorFinanceOverviewChart(
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
    $first: Int = 100
    $status: String
    $search: String
    $dateFrom: DateTime
    $dateTo: DateTime
  ) {
    vendorInvoices(
      first: $first
      status: $status
      search: $search
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      totalCount
      edges {
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
    }
  }
`;

export const GET_VENDOR_PAYOUTS_QUERY = `
  query GetVendorPayouts(
    $first: Int = 100
    $status: String
    $dateFrom: Date
    $dateTo: Date
  ) {
    vendorPayouts(
      first: $first
      status: $status
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      edges {
        node {
          id
          payoutNumber
          status
          createdAt
          releasedAt
          paidAt
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
