export const GET_VENDOR_ORDERS_QUERY = `
  query GetVendorOrders(
    $first: Int!
    $after: String
    $search: String
    $status: String
    $datePreset: String
    $dateFrom: Date
    $dateTo: Date
  ) {
    vendorOrderSummary(
      status: $status
      datePreset: $datePreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      totalOrders
      newOrders
      acceptedOrders
      preparing
      ready
      outForDelivery
      delivered
      canceled
      modified
    }
    orders(
      first: $first
      after: $after
      search: $search
      status: $status
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
          createdOn
          placedAt
          deliveryDate
          finalPrice
          paymentType
          paymentStatus
          customerName
          customerInfo {
            fullName
            organization
          }
          eventName
          guestCount
          companyAllowance
          orderCarts {
            edges {
              node {
                id
                quantity
                priceWithTax
                totalPriceWithTax
                item {
                  id
                  name
                  priceWithTax
                  description
                  coverImage {
                    fileUrl
                  }
                }
              }
            }
          }
          statuses {
            id
            status
            note
            createdOn
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_VENDOR_ORDER_DETAIL_QUERY = `
  query GetVendorOrderDetail($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      status
      statusLabel
      statusTone
      createdOn
      placedAt
      deliveryDate
      paymentType
      paymentStatus
      finalPrice
      companyAllowance
      customerName
      eventName
      guestCount
      deliveryType
      deliveryWindow
      customerInfo {
        fullName
        email
        phone
        organization
        city
        postalCode
      }
      orderCarts {
        edges {
          node {
            id
            quantity
            priceWithTax
            totalPriceWithTax
            item {
              id
              name
              priceWithTax
              description
              coverImage {
                fileUrl
              }
            }
          }
        }
      }
      statuses {
        id
        status
        note
        createdOn
      }
    }
  }
`;

export const CREATE_VENDOR_ORDER_ADJUSTMENT_MUTATION = `
  mutation CreateVendorOrderAdjustment($input: VendorOrderAdjustmentInput!) {
    createVendorOrderAdjustment(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      adjustment {
        id
        status
        reason
        vendorNote
        customerResponse
        proposedEventDate
        proposedDeliveryWindowStart
        proposedDeliveryWindowEnd
        proposedGuestCount
        proposedAddressLine1
        proposedAddressLine2
        proposedCity
        proposedPostalCode
        removedItemsJson
        addedItemsJson
        createdOn
      }
    }
  }
`;

export const SEARCH_VENDOR_ADJUSTMENT_ITEMS_QUERY = `
  query SearchVendorAdjustmentItems($search: String!, $first: Int = 10) {
    vendorAdjustmentItems(search: $search, first: $first) {
      edges {
        node {
          id
          name
          description
          priceWithTax
          coverImage {
            fileUrl
          }
        }
      }
    }
  }
`;

export const UPDATE_VENDOR_ORDER_STATUS_MUTATION = `
  mutation UpdateOrderStatus($id: ID!, $status: String!, $note: String) {
    orderStatusUpdate(id: $id, status: $status, note: $note) {
      success
      message
      instance {
        id
        status
      }
    }
  }
`;
