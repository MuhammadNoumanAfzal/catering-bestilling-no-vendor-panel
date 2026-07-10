export const GET_VENDOR_DASHBOARD_QUERY = `
  query GetVendorDashboard(
    $summaryPreset: String
    $urgentPreset: String
    $reviewsPreset: String
    $dateFrom: Date
    $dateTo: Date
    $urgentFirst: Int = 5
    $reviewsFirst: Int = 5
    $chartGroupBy: String = "day"
  ) {
    me {
      id
      firstName
      lastName
      email
    }

    vendorDashboardSummary(
      datePreset: $summaryPreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      totalOrders
      upcomingOrders
      urgentOrders
      capacityPercent
      totalOrdersTrend
      upcomingOrdersTrend
      urgentOrdersTrend
      capacityTrend
      totalOrdersTimeLabel
      upcomingOrdersTimeLabel
      urgentOrdersTimeLabel
      capacityTimeLabel
      currency
    }

    vendorUrgentOrders(
      first: $urgentFirst
      datePreset: $urgentPreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      edges {
        node {
          id
          orderNumber
          status
          statusLabel
          statusTone
          deliveryDate
          deliveryWindow
          eventName
          guestCount
          customerName
          customerInfo {
            fullName
          }
          finalPrice
        }
      }
      totalCount
    }

    vendorKitchenStatus(
      datePreset: $summaryPreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      preparing
      ready
      outForDelivery
    }

    vendorOrderSummary(
      datePreset: $summaryPreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      preparing
      ready
      outForDelivery
    }

    vendorOrderSummaryAllTime: vendorOrderSummary {
      preparing
      ready
      outForDelivery
    }

    vendorFinanceOverviewChart(
      dateFrom: $dateFrom
      dateTo: $dateTo
      groupBy: $chartGroupBy
    ) {
      points {
        label
        earnings
        orders
      }
    }

    vendorReviews(
      first: $reviewsFirst
      datePreset: $reviewsPreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      edges {
        node {
          id
          rating
          title
          comment
          createdOn
          ageLabel
          customer {
            id
            fullName
            avatarUrl
          }
          vendorReply {
            id
            message
            createdOn
          }
        }
      }
      totalCount
    }
  }
`;
