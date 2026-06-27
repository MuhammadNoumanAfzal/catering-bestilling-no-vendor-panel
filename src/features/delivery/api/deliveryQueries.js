export const GET_VENDOR_DELIVERY_SETTINGS_QUERY = `
  query GetVendorDeliverySettings {
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
        start
        end
      }
      maxDeliveriesPerDay
      maxOrdersPerTimeSlot
      liveValidation {
        isValid
        issues
      }
      createdAt
      updatedAt
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
          start
          end
        }
        maxDeliveriesPerDay
        maxOrdersPerTimeSlot
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
