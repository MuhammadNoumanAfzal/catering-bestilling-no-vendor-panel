export const GET_VENDOR_DELIVERY_SETTINGS_QUERY = `
  query GetVendorDeliverySettings {
    me {
      vendor {
        id
        name
        deliverySettings {
          id
          deliveryMode
          deliveryAvailable
          pickupAvailable
          pickupAddress
          pickupInstructions
          baseDeliveryFee
          freeDeliveryOver
          sameFeeAllDistances
          deliveryDays
          deliveryTimeSlots {
            day
            start
            end
          }
          maxDeliveriesPerDay
          maxOrdersPerTimeSlot
          minDeliveryTime
          maxDeliveryTime
          liveValidation {
            isValid
            issues
          }
          createdAt
          updatedAt
        }
        serviceAreas {
          id
          name
          postCode
          isActive
        }
      }
    }
  }
`;

export const SEARCH_AVAILABLE_AREAS_QUERY = `
  query SearchAvailableAreas($term: String, $first: Int) {
    validAreasSearch(term: $term, first: $first) {
      id
      name
      postCode
    }
  }
`;

export const UPDATE_VENDOR_DELIVERY_SETTINGS_MUTATION = `
  mutation UpdateVendorDeliverySettings($input: VendorDeliverySettingsInput!) {
    updateVendorDeliverySettings(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      vendorDeliverySettings {
        id
        deliveryMode
        deliveryAvailable
        pickupAvailable
        pickupAddress
        pickupInstructions
        baseDeliveryFee
        freeDeliveryOver
        sameFeeAllDistances
        deliveryDays
        deliveryTimeSlots {
          day
          start
          end
        }
        maxDeliveriesPerDay
        maxOrdersPerTimeSlot
        minDeliveryTime
        maxDeliveryTime
        liveValidation {
          isValid
          issues
        }
        createdAt
        updatedAt
      }
    }
  }
`;

export const VALIDATE_VENDOR_DELIVERY_SETTINGS_MUTATION = `
  mutation ValidateVendorDeliverySettings($input: VendorDeliverySettingsInput!) {
    validateVendorDeliverySettings(input: $input) {
      isValid
      issues
      errors {
        field
        message
        code
      }
    }
  }
`;

export const CREATE_VALID_AREA_MUTATION = `
  mutation CreateValidArea($input: ValidAreaInput!) {
    createValidArea(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      validArea {
        id
        name
        postCode
      }
    }
  }
`;
