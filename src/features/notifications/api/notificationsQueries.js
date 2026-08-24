export const VENDOR_FINANCE_NOTIFICATION_FIELDS = `
  id
  type
  audience
  title
  message
  isRead
  createdAt
  invoiceId
  orderId
  payoutId
  paymentStatus
  settlementStatus
  payoutStatus
  actorName
  note
  receiptUrl
  transferReference
  paymentDate
`;

export const GET_VENDOR_NOTIFICATIONS_QUERY = `
  query GetVendorNotifications($first: Int = 20, $status: String) {
    vendorFinanceNotifications(first: $first, status: $status) {
      edges {
        node {
          ${VENDOR_FINANCE_NOTIFICATION_FIELDS}
        }
      }
      totalCount
      unreadCount
    }
  }
`;

export const GET_VENDOR_NOTIFICATION_DETAIL_QUERY = `
  query GetVendorNotificationDetail($id: ID!) {
    financeNotification(id: $id) {
      ${VENDOR_FINANCE_NOTIFICATION_FIELDS}
    }
  }
`;

export const GET_VENDOR_NOTIFICATION_COUNTS_QUERY = `
  query GetVendorNotificationCounts($first: Int = 1) {
    vendorFinanceNotifications(first: $first) {
      totalCount
      unreadCount
    }
  }
`;

export const MARK_VENDOR_NOTIFICATION_AS_READ_MUTATION = `
  mutation MarkVendorNotificationAsRead($id: ID!) {
    markFinanceNotificationRead(id: $id) {
      success
      message
      notification {
        id
        isRead
      }
    }
  }
`;

export const MARK_VENDOR_NOTIFICATIONS_AS_READ_MUTATION = `
  mutation MarkVendorNotificationsAsRead($ids: [ID!]!) {
    markAllFinanceNotificationsRead(audience: "VENDOR") {
      success
      message
    }
  }
`;

export const MARK_ALL_VENDOR_NOTIFICATIONS_AS_READ_MUTATION = `
  mutation MarkAllVendorNotificationsAsRead {
    markAllFinanceNotificationsRead(audience: "VENDOR") {
      success
      message
    }
  }
`;

export const ARCHIVE_VENDOR_NOTIFICATION_MUTATION = `
  mutation ArchiveVendorNotification {
    markAllFinanceNotificationsRead(audience: "VENDOR") {
      success
      message
    }
  }
`;

export const GET_VENDOR_NOTIFICATION_SETTINGS_QUERY = `
  query GetVendorNotificationSettings {
    vendorNotificationSettings {
      orderAlertsEnabled
      reviewAlertsEnabled
      payoutAlertsEnabled
      emailEnabled
      pushEnabled
      smsEnabled
    }
  }
`;

export const UPDATE_VENDOR_NOTIFICATION_SETTINGS_MUTATION = `
  mutation UpdateVendorNotificationSettings($input: VendorNotificationSettingsInput!) {
    updateVendorNotificationSettings(input: $input) {
      success
      message
      errors {
        field
        message
        code
      }
      settings {
        orderAlertsEnabled
        reviewAlertsEnabled
        payoutAlertsEnabled
        emailEnabled
        pushEnabled
        smsEnabled
      }
    }
  }
`;
