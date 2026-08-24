export const GET_VENDOR_SETTINGS_PAGE_QUERY = `
  query GetVendorSettingsPage {
    me {
      id
      applicationStatus
      vendorStatus
      status
    }
    vendorSettings {
      id
      logoUrl
      coverPhotoUrl
      fileId
      coverPhotoFileId
      businessProfile {
        businessName
        businessEmail
        phoneNumber
        businessAddress
        businessDescription
        cuisineType {
          id
          name
          slug
        }
        customCuisineType
        businessType {
          id
          name
          slug
        }
        customBusinessType
        establishedYear
        taxId
        profileImage {
          fileId
          fileUrl
        }
        storeStatus
      }
      account {
        id
        fullName
        emailAddress
        phoneNumber
        role
        username
        accountId
        avatar {
          fileId
          fileUrl
        }
      }
      notifications {
        newOrder
        orderUpdates
        reviewsRatings
        promos_tips: promosTips
        emailNotifications
        pushNotifications
        smsNotifications
      }
      regionalPreferences {
        language {
          code
          label
        }
        currency {
          code
          label
        }
        timeZone {
          value
          label
        }
      }
      businessHours {
        id
        day
        enabled
        openTime
        closeTime
        timeRange
      }
      specialClosures {
        id
        type {
          id
          name
          slug
        }
        startDate
        endDate
        reason
        status
      }
    }
    vendorApplicationReviewStatus {
      id
      vendorId
      applicationStatus
      reviewedAt
      canApprove
      isReadyForApproval
      checklistCompleted
      checklistTotal
      missingRequirements {
        code
        label
      }
      latestChangeRequest {
        id
        message
        createdAt
        fields {
          code
          label
        }
      }
      changeRequestMessage
      requestedFields {
        code
        label
      }
    }
    myVendorPayoutProfile {
      id
      payoutMethod
      bankDetailsVerified
      verificationStatus
      verificationNote
      accountHolderName
      bankName
      accountNumber
      iban
      swiftBic
      routingNumber
      branchName
      branchCode
      billingAddress
      city
      postalCode
      country
      createdAt
      updatedAt
    }
    vendorSettingsBootstrap {
      cuisineTypes {
        id
        name
        slug
        isActive
        sortOrder
      }
      businessTypes {
        id
        name
        slug
        isActive
        sortOrder
      }
      closureTypes {
        id
        name
        slug
      }
      languages {
        code
        label
        isActive
        sortOrder
      }
      currencies {
        code
        label
        symbol
        isActive
        sortOrder
      }
      timeZones {
        value
        label
        utcOffset
        isActive
        sortOrder
      }
    }
  }
`;

export const UPSERT_VENDOR_PAYOUT_PROFILE_MUTATION = `
  mutation UpsertVendorPayoutProfile($input: VendorPayoutProfileInput!) {
    upsertVendorPayoutProfile(input: $input) {
      success
      message
      payoutProfile {
        id
        payoutMethod
        bankDetailsVerified
        verificationStatus
        verificationNote
        accountHolderName
        bankName
        accountNumber
        iban
        swiftBic
        routingNumber
        branchName
        branchCode
        billingAddress
        city
        postalCode
        country
        updatedAt
      }
    }
  }
`;

export const GET_VENDOR_COMPLIANCE_DOCUMENTS_QUERY = `
  query GetVendorComplianceDocuments {
    vendorApplicationReviewStatus {
      id
      missingRequirements {
        code
        label
      }
    }
    vendorComplianceDocuments {
      id
      type
      title
      status
      fileUrl
      fileId
      uploadedAt
      reviewedAt
      reviewNote
      rejectionReason
      isRequired
    }
  }
`;

export const UPLOAD_VENDOR_COMPLIANCE_DOCUMENT_MUTATION = `
  mutation UploadVendorComplianceDocument($input: VendorComplianceDocumentInput!) {
    uploadVendorComplianceDocument(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      document {
        id
        type
        title
        status
        fileUrl
        fileId
        uploadedAt
        reviewedAt
        reviewNote
        rejectionReason
        isRequired
      }
    }
  }
`;

export const UPDATE_VENDOR_SETTINGS_IMAGES_MUTATION = `
  mutation VendorSettings($input: VendorSettingsInput!) {
    vendorSettingsMutation(input: $input) {
      success
      message
      instance {
        id
        logoUrl
        coverPhotoUrl
        fileId
        coverPhotoFileId
      }
    }
  }
`;

export const UPDATE_VENDOR_BUSINESS_PROFILE_MUTATION = `
  mutation UpdateVendorBusinessProfile($input: VendorBusinessProfileInput!) {
    updateVendorBusinessProfile(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      businessProfile {
        businessName
        businessEmail
        phoneNumber
        businessAddress
        businessDescription
        cuisineType {
          id
          name
          slug
        }
        customCuisineType
        businessType {
          id
          name
          slug
        }
        customBusinessType
        establishedYear
        taxId
        storeStatus
      }
    }
  }
`;

export const UPDATE_VENDOR_ACCOUNT_PROFILE_MUTATION = `
  mutation UpdateVendorAccountProfile($input: VendorAccountProfileInput!) {
    updateVendorAccountProfile(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      account {
        id
        fullName
        emailAddress
        phoneNumber
        role
        username
        accountId
        avatar {
          fileId
          fileUrl
        }
      }
    }
  }
`;

export const CHANGE_VENDOR_PASSWORD_MUTATION = `
  mutation ChangeVendorPassword($input: VendorPasswordChangeInput!) {
    changeVendorPassword(input: $input) {
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

export const UPDATE_VENDOR_NOTIFICATION_PREFERENCES_MUTATION = `
  mutation UpdateVendorNotificationPreferences($input: VendorNotificationPreferencesInput!) {
    updateVendorNotificationPreferences(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      notifications {
        newOrder
        orderUpdates
        reviewsRatings
        promos_tips: promosTips
        emailNotifications
        pushNotifications
        smsNotifications
      }
    }
  }
`;

export const UPDATE_VENDOR_REGIONAL_PREFERENCES_MUTATION = `
  mutation UpdateVendorRegionalPreferences($input: VendorRegionalPreferencesInput!) {
    updateVendorRegionalPreferences(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      regionalPreferences {
        language {
          code
          label
        }
        currency {
          code
          label
        }
        timeZone {
          value
          label
        }
      }
    }
  }
`;

export const UPDATE_VENDOR_BUSINESS_HOURS_MUTATION = `
  mutation UpdateVendorBusinessHours($input: [VendorBusinessHourInput!]!) {
    updateVendorBusinessHours(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      businessHours {
        id
        day
        enabled
        openTime
        closeTime
        timeRange
      }
    }
  }
`;

export const UPSERT_VENDOR_SPECIAL_CLOSURE_MUTATION = `
  mutation UpsertVendorSpecialClosure($input: VendorSpecialClosureInput!) {
    upsertVendorSpecialClosure(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      closure {
        id
        type {
          id
          name
          slug
        }
        startDate
        endDate
        reason
        status
      }
    }
  }
`;

export const DELETE_VENDOR_SPECIAL_CLOSURE_MUTATION = `
  mutation DeleteVendorSpecialClosure($id: ID!) {
    deleteVendorSpecialClosure(id: $id) {
      success
      message
      errors {
        field
        message
        code
      }
      deletedId
    }
  }
`;

export const DEACTIVATE_VENDOR_STORE_MUTATION = `
  mutation DeactivateVendorStore($input: VendorDeactivateStoreInput!) {
    deactivateVendorStore(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      storeStatus
    }
  }
`;

export const DELETE_VENDOR_STORE_MUTATION = `
  mutation DeleteVendorStore($input: VendorDeleteStoreInput!) {
    deleteVendorStore(input: $input) {
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

export const RESET_VENDOR_SETTINGS_TO_DEFAULT_MUTATION = `
  mutation ResetVendorSettingsToDefault {
    resetVendorSettingsToDefault {
      success
      message
      errors {
        field
        message
        code
      }
      vendorSettings {
        id
      }
    }
  }
`;
