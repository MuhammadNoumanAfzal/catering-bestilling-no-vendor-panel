export const GET_VENDOR_NOTIFICATIONS_QUERY = `
  query GetVendorNotifications(
    $status: NotificationReadStatus
    $datePreset: NotificationDatePreset
    $first: Int = 20
    $after: String
  ) {
    vendorNotifications(
      status: $status
      datePreset: $datePreset
      first: $first
      after: $after
    ) {
      edges {
        node {
          id
          notificationType
          title
          message
          isRead
          createdAt
          orderId
          reviewId
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
      unreadCount
    }
  }
`;

export const GET_VENDOR_NOTIFICATION_DETAIL_QUERY = `
  query GetVendorNotificationDetail($id: ID!) {
    vendorNotification(id: $id) {
      id
      notificationType
      title
      message
      isRead
      createdAt
      orderId
      reviewId
    }
  }
`;

export const GET_VENDOR_NOTIFICATION_COUNTS_QUERY = `
  query GetVendorNotificationCounts {
    vendorNotificationCounts {
      total
      unread
      read
    }
  }
`;

export const MARK_VENDOR_NOTIFICATION_AS_READ_MUTATION = `
  mutation MarkVendorNotificationAsRead($id: ID!) {
    markVendorNotificationAsRead(id: $id) {
      success
      message
      errors {
        field
        message
        code
      }
      notification {
        id
        isRead
      }
      unreadCount
    }
  }
`;

export const MARK_VENDOR_NOTIFICATIONS_AS_READ_MUTATION = `
  mutation MarkVendorNotificationsAsRead($ids: [ID!]!) {
    markVendorNotificationsAsRead(ids: $ids) {
      success
      message
      errors {
        field
        message
        code
      }
      updatedIds
      unreadCount
    }
  }
`;

export const MARK_ALL_VENDOR_NOTIFICATIONS_AS_READ_MUTATION = `
  mutation MarkAllVendorNotificationsAsRead {
    markAllVendorNotificationsAsRead {
      success
      message
      errors {
        field
        message
        code
      }
      unreadCount
    }
  }
`;

export const ARCHIVE_VENDOR_NOTIFICATION_MUTATION = `
  mutation ArchiveVendorNotification($id: ID!) {
    archiveVendorNotification(id: $id) {
      success
      message
      errors {
        field
        message
        code
      }
      archivedId
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
