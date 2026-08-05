import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  CREATE_SUPPORT_TICKET_MUTATION,
  MY_SUPPORT_TICKET_QUERY,
  MY_SUPPORT_TICKETS_QUERY,
  REPLY_TO_OWN_SUPPORT_TICKET_MUTATION,
} from "./supportQueries";

function normalizeSupportInput(input) {
  return {
    userRole:
      `${input?.userRole ?? ""}`.trim().toLowerCase() === "customer"
        ? "Customer"
        : "Vendor",
    subject: `${input?.subject ?? ""}`.trim(),
    relatedOrderId: `${input?.relatedOrderId ?? ""}`.trim() || null,
    description: `${input?.description ?? ""}`.trim(),
    attachmentUrl: input?.attachmentUrl?.trim?.() || null,
    attachmentFileId: input?.attachmentFileId?.trim?.() || null,
  };
}

function formatDisplayDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function normalizeAttachment(attachment) {
  return {
    id: attachment?.id ?? "",
    fileName: attachment?.fileName ?? "Attachment",
    url: attachment?.url ?? "",
    mimeType: attachment?.mimeType ?? "",
    size: Number(attachment?.size ?? 0),
  };
}

function normalizeConversationItem(message) {
  return {
    id: message?.id ?? "",
    side: message?.side ?? "",
    message: message?.message ?? "",
    createdAt: message?.createdAt ?? "",
    createdAtLabel: formatDisplayDate(message?.createdAt),
    author: {
      id: message?.author?.id ?? "",
      fullName: message?.author?.fullName ?? "Unknown",
      role: message?.author?.role ?? "",
    },
    attachments: Array.isArray(message?.attachments)
      ? message.attachments.map(normalizeAttachment)
      : [],
  };
}

function normalizeTicketListItem(item) {
  return {
    id: item?.id ?? "",
    subject: item?.subject ?? "",
    status: item?.status ?? "",
    priority: item?.priority ?? "",
    createdAt: item?.createdAt ?? "",
    createdAtLabel: formatDisplayDate(item?.createdAt),
    updatedAt: item?.updatedAt ?? "",
    updatedAtLabel: formatDisplayDate(item?.updatedAt),
    lastMessageAt: item?.lastMessageAt ?? "",
    lastMessageAtLabel: formatDisplayDate(item?.lastMessageAt),
    unreadCount: Number(item?.unreadCount ?? 0),
    orderReference: item?.orderReference ?? "",
  };
}

export async function createSupportTicket(input) {
  const variables = normalizeSupportInput(input);

  if (!variables.subject) {
    throw new Error("Please select a support issue type.");
  }

  if (!variables.description) {
    throw new Error("Please enter a description for your issue.");
  }

  const data = await executeProtectedGraphqlRequest(CREATE_SUPPORT_TICKET_MUTATION, variables);
  const result = data?.createSupportTicket;

  if (!result?.success) {
    throw new Error(result?.message || "Unable to submit support ticket.");
  }

  return {
    success: true,
    message: result?.message || "Support ticket submitted successfully.",
    ticketId: result?.ticketId || "",
  };
}

export async function getMySupportTickets(page = 1, pageSize = 10) {
  const data = await executeProtectedGraphqlRequest(MY_SUPPORT_TICKETS_QUERY, {
    page: Number(page || 1),
    pageSize: Number(pageSize || 10),
  });

  const result = data?.mySupportTickets;

  return {
    items: Array.isArray(result?.items) ? result.items.map(normalizeTicketListItem) : [],
    pageInfo: {
      page: Number(result?.pageInfo?.page ?? page),
      pageSize: Number(result?.pageInfo?.pageSize ?? pageSize),
      totalItems: Number(result?.pageInfo?.totalItems ?? 0),
      totalPages: Number(result?.pageInfo?.totalPages ?? 1),
      hasNextPage: Boolean(result?.pageInfo?.hasNextPage),
      hasPreviousPage: Boolean(result?.pageInfo?.hasPreviousPage),
    },
  };
}

export async function getMySupportTicket(id) {
  const data = await executeProtectedGraphqlRequest(MY_SUPPORT_TICKET_QUERY, { id });
  const ticket = data?.mySupportTicket;

  if (!ticket?.id) {
    throw new Error("Unable to load support ticket.");
  }

  return {
    id: ticket.id,
    subject: ticket.subject ?? "",
    status: ticket.status ?? "",
    priority: ticket.priority ?? "",
    createdAt: ticket.createdAt ?? "",
    createdAtLabel: formatDisplayDate(ticket.createdAt),
    updatedAt: ticket.updatedAt ?? "",
    updatedAtLabel: formatDisplayDate(ticket.updatedAt),
    orderReference: ticket.orderReference ?? "",
    conversation: Array.isArray(ticket.conversation)
      ? ticket.conversation.map(normalizeConversationItem)
      : [],
  };
}

export async function replyToOwnSupportTicket(ticketId, message, attachmentIds = []) {
  const trimmedMessage = `${message ?? ""}`.trim();

  if (!trimmedMessage) {
    throw new Error("Please enter a reply before sending.");
  }

  const data = await executeProtectedGraphqlRequest(REPLY_TO_OWN_SUPPORT_TICKET_MUTATION, {
    ticketId,
    message: trimmedMessage,
    attachmentIds,
  });

  const result = data?.replyToOwnSupportTicket;

  if (!result?.success || !result?.reply?.id) {
    throw new Error(result?.message || "Unable to send support reply.");
  }

  return {
    message: result.message || "Reply sent successfully.",
    reply: normalizeConversationItem(result.reply),
  };
}
