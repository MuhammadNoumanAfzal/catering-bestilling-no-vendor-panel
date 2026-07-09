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
    vendorOrders(
      first: $first
      after: $after
      search: $search
      status: $status
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      edges {
        node {
          id
          invoiceNumber
          status
          eventTime
          customerName
          eventName
          personCount
          eventDate
          pricing {
            subtotal
            taxAmount
            deliveryFee
            addOnsTotal
            tipAmount
            grandTotal
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
  query GetVendorOrderDetail($orderId: ID!) {
    vendorOrder(id: $orderId) {
      id
      invoiceNumber
      status
      eventDate
      eventTime
      personCount
      customerName
      eventName
      deliveryAddress
      deliveryCity
      deliveryPostalCode
      deliveryAddressStr
      orderNotes
      pricing {
        subtotal
        taxRate
        taxAmount
        deliveryFee
        addOnsTotal
        tipAmount
        discountAmount
        serviceFee
        grandTotal
        amountPaid
        amountDue
      }
      items {
        id
        productId
        productName
        pricingType
        unitPrice
        quantity
        serves
        lineSubtotal
        lineTax
        lineTotal
        selectedOptions
        selectedAddons {
          name
          unitPrice
          quantity
          totalPrice
        }
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

export const GET_VENDOR_CUSTOMER_ORDER_HISTORY_QUERY = `
  query GetVendorCustomerOrderHistory($orderId: ID, $customerId: ID) {
    vendorCustomerOrderHistory(orderId: $orderId, customerId: $customerId) {
      id
      orderNumber
      status
      statusLabel
      statusTone
      deliveryDate
      placedAt
      guestCount
      finalPrice
      eventName
      pricing {
        grandTotal
      }
      clientOrder {
        edges {
          node {
            id
            items {
              id
              productName
              quantity
              selectedAddons {
                name
                unitPrice
                quantity
                totalPrice
              }
            }
          }
        }
      }
    }
  }
`;

