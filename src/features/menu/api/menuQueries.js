export const GET_VENDOR_MENU_FORM_BOOTSTRAP_QUERY = `
  query GetVendorMenuFormBootstrap {
    productTypeChoices
    menuStatusChoices
    pricingTypeChoices

    categories {
      edges {
        node {
          id
          name
        }
      }
    }

    vendorAddOns(first: 100) {
      edges {
        node {
          id
          name
          priceWithTax
          menuStatus
          dietaryTags
          coverImage {
            fileUrl
            fileId
          }
          category {
            id
            name
          }
        }
      }
    }
  }
`;

export const GET_VENDOR_MENU_DETAIL_QUERY = `
  query GetVendorMenuDetailForEdit($id: ID!) {
    vendorMenu(id: $id) {
      id
      name
      title
      description
      category {
        id
        name
      }
      menuType
      menuStatus
      pricingType
      priceWithTax
      taxPercent
      minimumGuests
      minLeadTimeHours
      minLeadTimeDays
      availableDays
      blackoutDates
      dietaryTags
      customDietary
      contains
      isAdjustableForSingleStaff
      isAvailabilityWindowEnabled
      availableFrom
      availableUntil
      coverImage {
        fileUrl
        fileId
      }
      ingredients {
        edges {
          node {
            id
            name
          }
        }
      }
      attachments {
        edges {
          node {
            id
            fileUrl
            fileId
            isCover
          }
        }
      }
      menuItems {
        id
        title
        description
        allergens
        imageUrl
        fileId
        order
      }
      optionalAddOns {
        id
        name
        options {
          id
          name
          price
        }
      }
    }
  }
`;

export const GET_VENDOR_MENUS_QUERY = `
  query GetVendorMenus(
    $first: Int = 50
    $after: String
  ) {
    vendorMenus(
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          name
          title
          description
          menuStatus
          pricingType
          priceWithTax
          minimumGuests
          createdOn
          updatedOn
          coverImage {
            fileUrl
            fileId
          }
          category {
            id
            name
          }
          menuType
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SAVE_VENDOR_MENU_MUTATION = `
  mutation SaveVendorMenu(
    $input: VendorMenuInput!
    $ingredients: [String!]
    $attachments: [ProductAttachmentInput!]
    $menuItems: [MenuItemInput!]
    $optionalAddOnIds: [ID!]
  ) {
    vendorMenuMutation(
      input: $input
      ingredients: $ingredients
      attachments: $attachments
      menuItems: $menuItems
      optionalAddOnIds: $optionalAddOnIds
    ) {
      success
      message
      instance {
        id
        name
        title
        description
        category {
          id
          name
        }
        menuType
        menuStatus
        pricingType
        priceWithTax
        taxPercent
        minimumGuests
        minLeadTimeHours
        minLeadTimeDays
        availableDays
        blackoutDates
        dietaryTags
        customDietary
        contains
        isAdjustableForSingleStaff
        isAvailabilityWindowEnabled
        availableFrom
        availableUntil
        coverImage {
          fileUrl
          fileId
        }
        menuItems {
          id
          title
          description
          allergens
          imageUrl
          fileId
          order
        }
      }
    }
  }
`;

export const UPDATE_VENDOR_MENU_STATUS_MUTATION = `
  mutation UpdateVendorMenuStatus($id: ID!, $menuStatus: String!) {
    vendorMenuStatusUpdate(id: $id, menuStatus: $menuStatus) {
      success
      message
      instance {
        id
        menuStatus
      }
    }
  }
`;

export const DELETE_VENDOR_MENU_MUTATION = `
  mutation DeleteVendorMenu($id: ID!) {
    vendorMenuDelete(id: $id) {
      success
      message
    }
  }
`;
