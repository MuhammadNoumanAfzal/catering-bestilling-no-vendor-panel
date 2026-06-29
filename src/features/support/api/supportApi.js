import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import { CREATE_SUPPORT_TICKET_MUTATION } from "./supportQueries";

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

export async function createSupportTicket(input) {
  const variables = normalizeSupportInput(input);

  if (!variables.subject) {
    throw new Error("Please select a support issue type.");
  }

  if (!variables.description) {
    throw new Error("Please enter a description for your issue.");
  }

  const data = await executeProtectedGraphqlRequest(
    CREATE_SUPPORT_TICKET_MUTATION,
    variables,
  );

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
