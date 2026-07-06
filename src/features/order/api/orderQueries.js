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
          deliveryType
          deliveryWindow
          eventTime
          finalPrice
          paymentType
          paymentStatus
          customerName
          customerAllowance
          customerInfo {
            fullName
            email
            phone
            organization
            city
            postalCode
          }
          customerDetailsVisible
          eventName
          guestCount
          companyAllowance
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
      customerAllowance
      companyAllowance
      addOnsTotal
      customerName
      eventName
      guestCount
      deliveryType
      deliveryWindow
      eventTime
      deliveryAddress
      deliveryCity
      deliveryPostalCode
      deliveryAddressStr
      customerInfo {
        fullName
        email
        phone
        organization
        city
        postalCode
      }
      customerDetailsVisible
      clientOrder {
        edges {
          node {
            id
            email
            phone
            orderNotes
            addOns
            subtotal
            deliveryFee
            taxAmount
            tipAmount
            grandTotal
            items {
              id
              productName
              quantity
              unitPrice
              totalPrice
              specialInstructions
              selectedOptions
              selectedAddons
            }
          }
        }
      }
      billingAddress {
        address
        unitFloor
        city
        postCode
        locationName
        addressType
      }
      notes
      specialInstructions
      addOns
      items {
        id
        name
        quantity
        price
        imageUrl
        description
        allergens
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
              title
              priceWithTax
              description
              coverImage {
                fileUrl
              }
              menuItems {
                id
                title
                description
                imageUrl
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
      availableActions
      tableware {
        napkins
        utensils
        platesBowls
        instructions
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
    }
  }
`;

