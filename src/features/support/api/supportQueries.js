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
