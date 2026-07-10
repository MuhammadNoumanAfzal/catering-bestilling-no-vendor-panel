export const GET_VENDOR_FINANCE_SUMMARY_QUERY = `
  query GetVendorFinanceSummary(
    $dateFrom: Date
    $dateTo: Date
  ) {
    vendorFinanceSummary(
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      totalEarnings
      netIncome
      platformCommission
      pendingPayouts
      currency
      totalOrders
      paidOrders
      pendingOrders
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

export const GET_VENDOR_PAYOUT_STATUS_QUERY = `
  query GetVendorPayoutStatus {
    vendorPayoutStatus {
      pendingPayout {
        title
        description
        amount
        expectedArrival
        currency
      }
      paidAmount {
        title
        description
        amount
        currency
      }
      lastPayout {
        title
        description
        payoutDate
        amount
        currency
        status
      }
    }
  }
`;

export const GET_VENDOR_FINANCE_TRANSACTIONS_QUERY = `
  query GetVendorFinanceTransactions(
    $first: Int = 10
    $after: String
    $status: String
    $dateFrom: Date
    $dateTo: Date
  ) {
    vendorFinanceTransactions(
      first: $first
      after: $after
      status: $status
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      edges {
        node {
          id
          orderId
          customerName
          eventType
          eventDate
          grossAmount
          commissionAmount
          netAmount
          currency
          payoutStatus
          createdOn
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_VENDOR_FINANCE_TRANSACTION_DETAIL_QUERY = `
  query GetVendorFinanceTransactionDetail($id: ID!) {
    vendorFinanceTransaction(id: $id) {
      id
      orderId
      customerName
      eventType
      eventDate
      grossAmount
      commissionAmount
      netAmount
      currency
      payoutStatus
      payoutDate
      createdOn
      updatedOn
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
