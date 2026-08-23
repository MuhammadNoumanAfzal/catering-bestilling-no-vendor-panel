export const CREATE_SUPPORT_TICKET_MUTATION = `
  mutation CreateSupportTicket($input: CreateSupportTicketInput!) {
    createSupportTicket(input: $input) {
      success
      message
      ticket {
        id
        ticketNo
        status
        createdAt
      }
    }
  }
`;

export const MY_SUPPORT_TICKETS_QUERY = `
  query MySupportTickets {
    mySupportTickets {
      items {
        id
        ticketNo
        subject
        status
        priority
        createdAt
        lastMessageAt
        unreadCount
      }
    }
  }
`;

export const MY_SUPPORT_TICKET_QUERY = `
  query GetSupportTicket($ticketId: ID!) {
    supportTicket(id: $ticketId) {
      id
      ticketNo
      category
      priority
      subject
      status
      createdAt
      messages {
        id
        message
        createdAt
        side
        author {
          id
          fullName
          role
        }
      }
    }
  }
`;

export const REPLY_TO_OWN_SUPPORT_TICKET_MUTATION = `
  mutation ReplySupportTicket($input: ReplySupportTicketInput!) {
    replySupportTicket(input: $input) {
      success
      message
      messageItem {
        id
        side
        message
        createdAt
        author {
          id
          fullName
          role
        }
      }
      ticket {
        id
        lastMessageAt
        unreadCount
        status
      }
    }
  }
`;
