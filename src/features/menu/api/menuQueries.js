export const GET_VENDOR_MENU_FORM_BOOTSTRAP_QUERY = `
  query GetVendorMenuFormBootstrap {
    productTypeChoices
    menuStatusChoices
    pricingTypeChoices
    foodTypes {
      id
      name
      slug
    }
    occasions {
      id
      name
      slug
      iconUrl
    }
    allergens {
      id
      name
      slug
    }
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
      foodTypes {
        id
        name
        slug
      }
      occasions {
        id
        name
        slug
      }
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
        allergens {
          id
          name
          slug
        }
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
        occasions {
          id
          name
          slug
        }
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
          allergens {
            id
            name
            slug
          }
          imageUrl
          fileId
          order
        }
      }
    }
  }
`;

export const CREATE_FOOD_TYPE_MUTATION = `
  mutation CreateFoodType($input: FoodTypeInput!) {
    foodTypeMutation(input: $input) {
      success
      message
      instance {
        id
        name
        slug
      }
    }
  }
`;

export const CREATE_OCCASION_MUTATION = `
  mutation CreateOccasion(
    $name: String!
    $id: ID
    $slug: String
    $description: String
    $iconUrl: String
    $coverImageUrl: String
    $isActive: Boolean
    $sortOrder: Int
  ) {
    occasionMutation(
      name: $name
      id: $id
      slug: $slug
      description: $description
      iconUrl: $iconUrl
      coverImageUrl: $coverImageUrl
      isActive: $isActive
      sortOrder: $sortOrder
    ) {
      success
      message
      instance {
        id
        name
        slug
      }
    }
  }
`;

export const CREATE_ALLERGEN_MUTATION = `
  mutation CreateAllergen($input: AllergenInput!) {
    allergenMutation(input: $input) {
      success
      message
      instance {
        id
        name
        slug
      }
    }
  }
`;

export const CREATE_VENDOR_CATEGORY_MUTATION = `
  mutation CreateVendorCategory($input: VendorCategoryInput!) {
    vendorCategoryMutation(input: $input) {
      success
      message
      instance {
        id
        name
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

export const GET_VENDOR_ADD_ON_FORM_BOOTSTRAP_QUERY = `
  query GetVendorAddOnFormBootstrap {
    categories {
      edges {
        node {
          id
          name
        }
      }
    }
    menuStatusChoices
    pricingTypeChoices
    foodTypes {
      id
      name
      slug
    }
  }
`;

export const GET_VENDOR_ADD_ONS_QUERY = `
  query GetVendorAddOns($first: Int = 50, $after: String) {
    vendorAddOns(first: $first, after: $after) {
      edges {
        node {
          id
          name
          description
          priceWithTax
          taxPercent
          menuStatus
          dietaryTags
          customDietary
          availableDays
          coverImage {
            fileUrl
            fileId
          }
          category {
            id
            name
          }
          foodTypes {
            id
            name
            slug
          }
          createdOn
          updatedOn
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_VENDOR_ADD_ON_DETAIL_QUERY = `
  query GetVendorAddOnDetail($id: ID!) {
    vendorAddOn(id: $id) {
      id
      name
      description
      priceWithTax
      taxPercent
      menuStatus
      dietaryTags
      customDietary
      availableDays
      coverImage {
        fileUrl
        fileId
      }
      category {
        id
        name
      }
      foodTypes {
        id
        name
        slug
      }
      createdOn
      updatedOn
    }
  }
`;

export const SAVE_VENDOR_ADD_ON_MUTATION = `
  mutation SaveVendorAddOn(
    $input: VendorAddOnInput!
    $attachments: [ProductAttachmentInput]
  ) {
    vendorAddOnMutation(input: $input, attachments: $attachments) {
      success
      message
      errors {
        field
        message
        code
      }
      instance {
        id
        name
        description
        priceWithTax
        taxPercent
        menuStatus
        dietaryTags
        customDietary
        availableDays
        coverImage {
          fileUrl
          fileId
        }
        category {
          id
          name
        }
        foodTypes {
          id
          name
          slug
        }
        createdOn
        updatedOn
      }
    }
  }
`;

export const UPDATE_VENDOR_ADD_ON_STATUS_MUTATION = `
  mutation UpdateVendorAddOnStatus($id: ID!, $menuStatus: String!) {
    vendorAddOnStatusUpdate(id: $id, menuStatus: $menuStatus) {
      success
      message
      errors {
        field
        message
        code
      }
      instance {
        id
        menuStatus
      }
    }
  }
`;

export const DELETE_VENDOR_ADD_ON_MUTATION = `
  mutation DeleteVendorAddOn($id: ID!) {
    vendorAddOnDelete(id: $id) {
      success
      message
      errors {
        field
        message
        code
      }
    }
  }
`;
