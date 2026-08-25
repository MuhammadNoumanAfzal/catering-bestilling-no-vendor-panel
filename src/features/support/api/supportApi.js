import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  CREATE_SUPPORT_TICKET_MUTATION,
  MY_SUPPORT_TICKET_QUERY,
  MY_SUPPORT_TICKETS_QUERY,
  REPLY_TO_OWN_SUPPORT_TICKET_MUTATION,
} from "./supportQueries";

function normalizeSupportInput(input) {
  return {
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

function getAttachmentFileNameFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const pathnameParts = parsedUrl.pathname.split("/").filter(Boolean);
    return pathnameParts[pathnameParts.length - 1] || "Attachment";
  } catch {
    const pathnameParts = String(url || "").split("/").filter(Boolean);
    return pathnameParts[pathnameParts.length - 1] || "Attachment";
  }
}

function extractInlineAttachments(message) {
  const normalizedMessage = String(message ?? "");
  const attachments = [];
  const cleanedMessage = normalizedMessage
    .replace(/(?:^|\n|\s)Attachments?:\s*(https?:\/\/\S+)\s*/gi, (fullMatch, url) => {
      attachments.push({
        id: `inline-${attachments.length + 1}-${url}`,
        fileName: getAttachmentFileNameFromUrl(url),
        url,
        mimeType: "",
        size: 0,
      });
      return " ";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    message: cleanedMessage,
    attachments,
  };
}

function normalizeConversationItem(message) {
  const side = `${message?.side ?? ""}`.trim().toLowerCase() || "admin";
  const authorRole = `${message?.author?.role ?? side}`.trim();
  const fallbackAuthorName = side === "admin" ? "Support" : "You";
  const inlineData = extractInlineAttachments(message?.message);
  const explicitAttachments = Array.isArray(message?.attachments)
    ? message.attachments.map(normalizeAttachment)
    : [];
  const mergedAttachments = [...explicitAttachments];

  inlineData.attachments.forEach((attachment) => {
    if (!mergedAttachments.some((item) => item.url === attachment.url)) {
      mergedAttachments.push(attachment);
    }
  });

  return {
    id: message?.id ?? "",
    side,
    message: inlineData.message,
    createdAt: message?.createdAt ?? "",
    createdAtLabel: formatDisplayDate(message?.createdAt),
    author: {
      id: message?.author?.id ?? "",
      fullName: message?.author?.fullName ?? fallbackAuthorName,
      role: authorRole || (side === "admin" ? "admin" : "vendor"),
    },
    attachments: mergedAttachments,
  };
}

function normalizeTicketListItem(item) {
  return {
    id: item?.id ?? "",
    ticketNo: item?.ticketNo ?? "",
    subject: item?.subject ?? "",
    status: item?.status ?? "",
    priority: item?.priority ?? "",
    createdAt: item?.createdAt ?? "",
    createdAtLabel: formatDisplayDate(item?.createdAt),
    updatedAt: item?.lastMessageAt ?? item?.createdAt ?? "",
    updatedAtLabel: formatDisplayDate(item?.lastMessageAt || item?.createdAt),
    lastMessageAt: item?.lastMessageAt ?? "",
    lastMessageAtLabel: formatDisplayDate(item?.lastMessageAt),
    unreadCount: Number(item?.unreadCount ?? 0),
    orderReference: item?.ticketNo ?? "",
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

  const messageParts = [variables.description];

  if (variables.relatedOrderId) {
    messageParts.push(`Related order: ${variables.relatedOrderId}`);
  }

  if (variables.attachmentUrl) {
    messageParts.push(`Attachment: ${variables.attachmentUrl}`);
  }

  const data = await executeProtectedGraphqlRequest(CREATE_SUPPORT_TICKET_MUTATION, {
    input: {
      subject: variables.subject,
      message: messageParts.join("\n\n"),
    },
  });
  const result = data?.createSupportTicket;

  if (!result?.success || !result?.ticket?.id) {
    throw new Error(result?.message || "Unable to submit support ticket.");
  }

  return {
    success: true,
    message: result?.message || "Support ticket submitted successfully.",
    ticketId: result?.ticket?.id || "",
  };
}

export async function getMySupportTickets(page = 1, pageSize = 10) {
  const data = await executeProtectedGraphqlRequest(MY_SUPPORT_TICKETS_QUERY);

  const result = data?.mySupportTickets;

  const items = Array.isArray(result?.items)
    ? result.items.map(normalizeTicketListItem)
    : [];

  return {
    items,
    pageInfo: {
      page: Number(page || 1),
      pageSize: Number(pageSize || 10),
      totalItems: items.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

export async function getMySupportTicket(id) {
  const data = await executeProtectedGraphqlRequest(MY_SUPPORT_TICKET_QUERY, {
    ticketId: id,
  });
  const ticket = data?.supportTicket;

  if (!ticket?.id) {
    throw new Error("Unable to load support ticket.");
  }

  const messages = Array.isArray(ticket?.messages) ? ticket.messages : [];

  return {
    id: ticket.id,
    ticketNo: ticket.ticketNo ?? "",
    subject: ticket.subject ?? "",
    status: ticket.status ?? "",
    priority: ticket.priority ?? "",
    createdAt: ticket.createdAt ?? "",
    createdAtLabel: formatDisplayDate(ticket.createdAt),
    updatedAt: messages[messages.length - 1]?.createdAt ?? ticket.createdAt ?? "",
    updatedAtLabel: formatDisplayDate(
      messages[messages.length - 1]?.createdAt || ticket.createdAt,
    ),
    orderReference: ticket.ticketNo ?? "",
    conversation: messages.map(normalizeConversationItem),
  };
}

export async function replyToOwnSupportTicket(ticketId, message, attachmentIds = []) {
  const trimmedMessage = `${message ?? ""}`.trim();

  if (!trimmedMessage) {
    throw new Error("Please enter a reply before sending.");
  }

  const payload = {
    ticketId,
    message: trimmedMessage,
  };

  if (Array.isArray(attachmentIds) && attachmentIds.length) {
    payload.attachmentIds = attachmentIds;
  }

  const data = await executeProtectedGraphqlRequest(
    REPLY_TO_OWN_SUPPORT_TICKET_MUTATION,
    {
      input: payload,
    },
  );

  const result = data?.replySupportTicket;

  if (!result?.success || !result?.messageItem?.id) {
    throw new Error(result?.message || "Unable to send support reply.");
  }

  return {
    message: result.message || "Reply sent successfully.",
    reply: normalizeConversationItem(result.messageItem),
    ticket: {
      id: result.ticket?.id ?? ticketId,
      lastMessageAt: result.ticket?.lastMessageAt ?? result.messageItem.createdAt,
      unreadCount: Number(result.ticket?.unreadCount ?? 0),
      status: result.ticket?.status ?? "",
    },
  };
}
