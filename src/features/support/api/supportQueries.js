export const CREATE_SUPPORT_TICKET_MUTATION = `
  mutation CreateSupportTicket(
    $userRole: String!
    $subject: String!
    $relatedOrderId: String
    $description: String!
    $attachmentUrl: String
    $attachmentFileId: String
  ) {
    createSupportTicket(
      userRole: $userRole
      subject: $subject
      relatedOrderId: $relatedOrderId
      description: $description
      attachmentUrl: $attachmentUrl
      attachmentFileId: $attachmentFileId
    ) {
      success
      message
      ticketId
    }
  }
`;

export const MY_SUPPORT_TICKETS_QUERY = `
  query MySupportTickets($page: Int!, $pageSize: Int!) {
    mySupportTickets(page: $page, pageSize: $pageSize) {
      items {
        id
        subject
        status
        priority
        createdAt
        updatedAt
        lastMessageAt
        unreadCount
        orderReference
      }
      pageInfo {
        page
        pageSize
        totalItems
        totalPages
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const MY_SUPPORT_TICKET_QUERY = `
  query MySupportTicket($id: ID!) {
    mySupportTicket(id: $id) {
      id
      subject
      status
      priority
      createdAt
      updatedAt
      orderReference
      conversation {
        id
        side
        message
        createdAt
        author {
          id
          fullName
          role
        }
        attachments {
          id
          fileName
          url
          mimeType
          size
        }
      }
    }
  }
`;

export const REPLY_TO_OWN_SUPPORT_TICKET_MUTATION = `
  mutation ReplyToOwnSupportTicket($ticketId: ID!, $message: String!, $attachmentIds: [ID!]) {
    replyToOwnSupportTicket(ticketId: $ticketId, message: $message, attachmentIds: $attachmentIds) {
      success
      message
      reply {
        id
        side
        message
        createdAt
        author {
          id
          fullName
          role
        }
        attachments {
          id
          fileName
          url
          mimeType
          size
        }
      }
    }
  }
`;
