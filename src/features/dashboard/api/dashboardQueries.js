export const GET_VENDOR_DASHBOARD_QUERY = `
  query GetVendorDashboard(
    $datePreset: String
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
      datePreset: $datePreset
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
      datePreset: $datePreset
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
      datePreset: $datePreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      preparing
      ready
      outForDelivery
    }

    vendorFinanceOverviewChart(
      rangePreset: $datePreset
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
      datePreset: $datePreset
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
