export function isSupportTicketClosed(ticket) {
 return String(ticket?.status || "").trim().toUpperCase() === "CLOSED";
}
export function assertSupportReplyAllowed(ticket) {
 if (isSupportTicketClosed(ticket)) { const error=new Error("This ticket is closed. Please create a new support ticket.");error.code="TICKET_CLOSED";throw error; }
}
