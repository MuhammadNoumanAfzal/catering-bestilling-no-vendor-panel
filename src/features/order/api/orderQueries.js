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
          orderNumber
          status
          hasPendingVendorAdjustment
          pendingVendorAdjustment {
            id
            status
          }
          latestVendorAdjustment {
            id
            status
          }
          pendingModificationRequest {
            id
            status
          }
          latestModificationRequest {
            id
            status
            resolvedOn
          }
          createdOn
          eventTime
          customerName
          eventName
          personCount
          eventDate
          availableActions
          statuses {
            status
            createdOn
          }
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

export const GET_VENDOR_UPCOMING_ORDERS_QUERY = `
  query GetVendorUpcomingOrders($hours: Int = 4, $first: Int!, $after: String) {
    vendorUpcomingOrders(hours: $hours, first: $first, after: $after) {
      edges {
        node {
          id
          invoiceNumber
          orderNumber
          status
          hasPendingVendorAdjustment
          pendingVendorAdjustment {
            id
            status
          }
          latestVendorAdjustment {
            id
            status
          }
          pendingModificationRequest {
            id
            status
          }
          latestModificationRequest {
            id
            status
            resolvedOn
          }
          createdOn
          eventTime
          customerName
          eventName
          guestCount
          personCount
          eventDate
          deliveryDate
          deliveryWindow
          deliveryAddress
          deliveryAddressStr
          deliveryCity
          deliveryPostalCode
          availableActions
          statuses {
            status
            createdOn
          }
          pricing {
            subtotal
            taxAmount
            deliveryFee
            addOnsTotal
            tipAmount
            grandTotal
          }
          finalPrice
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
      orderNumber
      status
      hasPendingVendorAdjustment
      pendingVendorAdjustment {
        id
        status
        vendorNote
        reason
        proposedEventDate
        proposedDeliveryWindowStart
        proposedGuestCount
        proposedAddressLine1
        proposedAddressLine2
        proposedCity
        proposedPostalCode
        oldTotal
        newTotal
        createdOn
      }
      latestVendorAdjustment {
        id
        status
        vendorNote
        reason
        proposedEventDate
        proposedDeliveryWindowStart
        proposedGuestCount
        proposedAddressLine1
        proposedAddressLine2
        proposedCity
        proposedPostalCode
        oldTotal
        newTotal
        createdOn
      }
      availableActions
      statuses {
        status
        createdOn
      }
      pendingModificationRequest {
        id
        status
      }
      latestModificationRequest {
        id
        status
        resolvedOn
      }
      email
      phone
      eventDate
      eventTime
      personCount
      customerName
      eventName
      deliveryAddress
      deliverySuite
      deliveryCity
      deliveryPostalCode
      deliveryAddressStr
      delivery {
        address
        city
        status
        scheduledAt
        deliveredAt
      }
      orderNotes
      pendingModificationRequest {
        id
        status
        reason
        vendorNote
        oldTotal
        newTotal
        priceDelta
        requiresAdditionalPayment
        refundableAmount
        expiresOn
        createdOn
        currentSnapshot {
          eventDate
          eventTime
          personCount
          deliveryAddress {
            addressLine1
            addressLine2
            city
            postalCode
          }
        }
        proposedSnapshot {
          eventDate
          eventTime
          personCount
          deliveryAddress {
            addressLine1
            addressLine2
            city
            postalCode
          }
        }
      }
      tableware {
        napkins
        utensils
        platesBowls
        instructions
      }
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
        product {
          id
          name
          description
          coverImage {
            id
            fileUrl
          }
          menuItems {
            id
            title
            description
          }
        }
      }
    }
  }
`;

export const GET_VENDOR_ORDER_MODIFICATION_REQUESTS_QUERY = `
  query GetVendorOrderModificationRequests($orderId: ID!) {
    vendorOrderModificationRequests(orderId: $orderId) {
      id
      status
      reason
      vendorNote
      customerResponse
      requestedBy
      createdOn
      resolvedOn
      oldTotal
      newTotal
      priceDelta
      requiresAdditionalPayment
      refundableAmount
      currentSnapshot {
        eventDate
        eventTime
        personCount
        deliveryAddress {
          addressLine1
          addressLine2
          city
          postalCode
        }
        orderNotes
      }
      proposedSnapshot {
        eventDate
        eventTime
        personCount
        deliveryAddress {
          addressLine1
          addressLine2
          city
          postalCode
        }
        orderNotes
      }
    }
  }
`;

export const APPROVE_ORDER_MODIFICATION_REQUEST_MUTATION = `
  mutation ApproveOrderModificationRequest($requestId: ID!, $note: String) {
    approveOrderModificationRequest(requestId: $requestId, note: $note) {
      success
      message
      order {
        id
        status
        eventDate
        eventTime
        personCount
        grandTotal
      }
      request {
        id
        status
        resolvedOn
      }
    }
  }
`;

export const REJECT_ORDER_MODIFICATION_REQUEST_MUTATION = `
  mutation RejectOrderModificationRequest($requestId: ID!, $reason: String!) {
    rejectOrderModificationRequest(requestId: $requestId, reason: $reason) {
      success
      message
      request {
        id
        status
        rejectionReason
        resolvedOn
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

