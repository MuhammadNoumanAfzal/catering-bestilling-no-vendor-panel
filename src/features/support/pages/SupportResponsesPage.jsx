import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Image as ImageIcon, Paperclip } from "lucide-react";
import Swal from "sweetalert2";
import {
  getMySupportTicket,
  getMySupportTickets,
  replyToOwnSupportTicket,
} from "../api/supportApi";

const PAGE_SIZE = 10;

function formatStatusLabel(value) {
  return `${value ?? ""}`
    .trim()
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusClasses(status) {
  switch (`${status ?? ""}`.trim().toUpperCase()) {
    case "OPEN":
      return "bg-[#fff4e8] text-[#cf6e38]";
    case "IN_PROGRESS":
      return "bg-[#fff8df] text-[#b77912]";
    case "RESOLVED":
      return "bg-[#edf8f1] text-[#2f8f57]";
    case "CLOSED":
      return "bg-[#f2efec] text-[#746a62]";
    default:
      return "bg-[#f6f0ea] text-[#8a7d73]";
  }
}

function MessageBubble({ item }) {
  const isOwnReply = `${item.side ?? ""}`.toLowerCase() !== "admin";
  const imageAttachments = item.attachments.filter((attachment) =>
    /^image\//i.test(String(attachment.mimeType || "")) || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(String(attachment.url || "")),
  );
  const fileAttachments = item.attachments.filter((attachment) => !imageAttachments.includes(attachment));

  return (
    <div className={["flex", isOwnReply ? "justify-end" : "justify-start"].join(" ")}>
      <div
        className={[
          "max-w-[88%] rounded-[16px] px-4 py-3 shadow-[0_10px_24px_rgba(43,30,20,0.05)]",
          isOwnReply ? "bg-[#cf6e38] text-white" : "border border-[#eadfd6] bg-white text-[#241913]",
        ].join(" ")}
      >
        <div
          className={[
            "mb-1 flex items-center gap-2 text-[11px]",
            isOwnReply ? "text-white/80" : "text-[#8a7d73]",
          ].join(" ")}
        >
          <span className="font-bold">{item.author.fullName}</span>
          <span>{item.createdAtLabel}</span>
        </div>
        {item.message ? <p className="text-[14px] leading-6">{item.message}</p> : null}
        {imageAttachments.length ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {imageAttachments.map((attachment) => (
              <a
                key={attachment.id}
                className="group overflow-hidden rounded-[14px] border border-white/20 bg-white/10 no-underline transition hover:bg-white/15"
                href={attachment.url}
                rel="noreferrer"
                target="_blank"
              >
                <div className="relative">
                  <img
                    alt={attachment.fileName}
                    className="h-[150px] w-full object-cover"
                    src={attachment.url}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.65)_100%)] px-3 py-2 text-white">
                    <span className="flex min-w-0 items-center gap-2 text-[12px] font-semibold">
                      <ImageIcon size={13} />
                      <span className="truncate">{attachment.fileName}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold">
                      View
                      <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : null}
        {fileAttachments.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {fileAttachments.map((attachment) => (
              <a
                key={attachment.id}
                className={[
                  "inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[11px] font-semibold no-underline transition",
                  isOwnReply
                    ? "bg-white/15 text-white hover:bg-white/20"
                    : "bg-[#f6f0ea] text-[#6f6258] hover:bg-[#fff3ec] hover:text-[#cf6e38]",
                ].join(" ")}
                href={attachment.url}
                rel="noreferrer"
                target="_blank"
              >
                <Paperclip size={12} />
                <span className="max-w-[220px] truncate">{attachment.fileName}</span>
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function SupportResponsesPage() {
  const [tickets, setTickets] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [draftReply, setDraftReply] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");

  async function loadTickets(targetPage = currentPage) {
    setIsLoadingList(true);
    setListError("");

    try {
      const result = await getMySupportTickets(targetPage, PAGE_SIZE);
      setTickets(result.items);
      setPageInfo(result.pageInfo);
      setCurrentPage(result.pageInfo.page);

      if (!selectedTicketId && result.items.length) {
        setSelectedTicketId(result.items[0].id);
      } else if (selectedTicketId && !result.items.some((ticket) => ticket.id === selectedTicketId)) {
        setSelectedTicketId(result.items[0]?.id || "");
      }
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Unable to load your support tickets.");
    } finally {
      setIsLoadingList(false);
    }
  }

  async function loadTicketDetail(ticketId) {
    if (!ticketId) {
      setSelectedTicket(null);
      setDetailError("");
      return;
    }

    setIsLoadingDetail(true);
    setDetailError("");

    try {
      const result = await getMySupportTicket(ticketId);
      setSelectedTicket(result);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Unable to load this support ticket.");
      setSelectedTicket(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }

  useEffect(() => {
    loadTickets(1);
  }, []);

  useEffect(() => {
    loadTicketDetail(selectedTicketId);
  }, [selectedTicketId]);

  async function handleReplySubmit() {
    const message = draftReply.trim();

    if (!selectedTicketId || !message) {
      return;
    }

    try {
      setIsSendingReply(true);
      const result = await replyToOwnSupportTicket(selectedTicketId, message, []);
      setSelectedTicket((current) =>
        current
          ? {
              ...current,
              conversation: [...current.conversation, result.reply],
              updatedAt: result.reply.createdAt,
              updatedAtLabel: result.reply.createdAtLabel,
            }
          : current,
      );
      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === selectedTicketId
            ? {
                ...ticket,
                lastMessageAt: result.reply.createdAt,
                lastMessageAtLabel: result.reply.createdAtLabel,
                updatedAt: result.reply.createdAt,
                updatedAtLabel: result.reply.createdAtLabel,
                unreadCount: 0,
              }
            : ticket,
        ),
      );
      setDraftReply("");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Unable to send reply",
        text: error instanceof Error ? error.message : "Please try again.",
        confirmButtonColor: "#cf6e38",
      });
    } finally {
      setIsSendingReply(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="type-h2 m-0 text-[#15110f]">Support Responses</h1>
          <p className="type-para mt-1 text-[#746a62]">
            Review ticket updates and send replies from a separate page.
          </p>
        </div>

        <Link
          className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-[#dfd3c8] bg-white px-4 text-[14px] font-bold text-[#2a211b] no-underline transition hover:bg-[#faf6f2] hover:text-[#cf6e38]"
          to="/support"
        >
          Back To Support Form
        </Link>
      </header>

      <section className="overflow-hidden rounded-[18px] border border-[#e7ddd4] bg-white shadow-[0_10px_24px_rgba(43,30,20,0.05)]">
        <div className="border-b border-[#efe5dd] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-[20px] font-bold text-[#181310]">Your Support Tickets</h2>
              <p className="mt-1 text-[13px] text-[#8d8074]">
                Review updates and continue existing conversations.
              </p>
            </div>
            <button
              className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-[#e0d5cb] bg-white px-4 text-[13px] font-bold text-[#2a211b] transition hover:bg-[#faf6f2]"
              onClick={() => loadTickets(currentPage)}
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid min-h-[720px] xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="border-b border-[#efe5dd] xl:border-b-0 xl:border-r">
            <div className="max-h-[720px] overflow-y-auto">
              {isLoadingList ? (
                <div className="px-5 py-10 text-center text-[14px] font-medium text-[#7d7068]">
                  Loading tickets...
                </div>
              ) : listError ? (
                <div className="px-5 py-10 text-center text-[14px] font-medium text-[#c65736]">
                  {listError}
                </div>
              ) : tickets.length ? (
                tickets.map((ticket) => {
                  const isActive = ticket.id === selectedTicketId;

                  return (
                    <button
                      key={ticket.id}
                      className={[
                        "flex w-full cursor-pointer flex-col gap-2 border-b border-[#f2e9e2] px-5 py-4 text-left transition",
                        isActive ? "bg-[#fff4ec]" : "bg-white hover:bg-[#fffaf6]",
                      ].join(" ")}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <strong className="line-clamp-2 text-[14px] text-[#201712]">{ticket.subject}</strong>
                        <span
                          className={[
                            "inline-flex shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
                            getStatusClasses(ticket.status),
                          ].join(" ")}
                        >
                          {formatStatusLabel(ticket.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[12px] text-[#8d8074]">
                        <span>{ticket.lastMessageAtLabel || ticket.updatedAtLabel || ticket.createdAtLabel}</span>
                        {ticket.unreadCount ? (
                          <span className="inline-flex min-w-[20px] justify-center rounded-full bg-[#cf6e38] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {ticket.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      {ticket.orderReference ? (
                        <span className="text-[12px] font-medium text-[#6f6258]">
                          Order: {ticket.orderReference}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="px-5 py-10 text-center text-[14px] font-medium text-[#7d7068]">
                  No support tickets yet.
                </div>
              )}
            </div>

            {pageInfo.totalPages > 1 ? (
              <div className="flex items-center justify-between border-t border-[#efe5dd] px-5 py-3 text-[12px] text-[#7d7068]">
                <button
                  className="rounded-[8px] border border-[#e0d5cb] px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!pageInfo.hasPreviousPage}
                  onClick={() => loadTickets(currentPage - 1)}
                  type="button"
                >
                  Previous
                </button>
                <span>
                  Page {pageInfo.page} of {pageInfo.totalPages}
                </span>
                <button
                  className="rounded-[8px] border border-[#e0d5cb] px-3 py-1.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!pageInfo.hasNextPage}
                  onClick={() => loadTickets(currentPage + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            ) : null}
          </aside>

          <div className="flex min-h-[720px] flex-col">
            {selectedTicketId ? (
              isLoadingDetail ? (
                <div className="flex flex-1 items-center justify-center px-6 text-[14px] font-medium text-[#7d7068]">
                  Loading ticket details...
                </div>
              ) : detailError ? (
                <div className="flex flex-1 items-center justify-center px-6 text-center text-[14px] font-medium text-[#c65736]">
                  {detailError}
                </div>
              ) : selectedTicket ? (
                <>
                  <div className="border-b border-[#efe5dd] px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="m-0 text-[22px] font-bold text-[#181310]">{selectedTicket.subject}</h3>
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-[11px] font-bold",
                          getStatusClasses(selectedTicket.status),
                        ].join(" ")}
                      >
                        {formatStatusLabel(selectedTicket.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] text-[#8d8074]">
                      Opened {selectedTicket.createdAtLabel}
                      {selectedTicket.orderReference ? ` • Order ${selectedTicket.orderReference}` : ""}
                    </p>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto bg-[#fffaf6] px-5 py-5">
                    {selectedTicket.conversation.length ? (
                      selectedTicket.conversation.map((item) => (
                        <MessageBubble key={item.id} item={item} />
                      ))
                    ) : (
                      <div className="rounded-[16px] border border-dashed border-[#e5d8ce] bg-white px-5 py-10 text-center text-[14px] text-[#7d7068]">
                        No messages available for this ticket yet.
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#efe5dd] bg-white px-5 py-4">
                    <label className="mb-2 block text-[13px] font-bold text-[#2a211b]">
                      Reply to support
                    </label>
                    <textarea
                      className="min-h-[120px] w-full resize-none rounded-[12px] border border-[#ddd3ca] bg-[#fbf8f5] px-4 py-3 text-[14px] text-[#241913] outline-none transition placeholder:text-[#ab9d91] focus:border-[#cf6e38] focus:bg-white focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
                      onChange={(event) => setDraftReply(event.target.value)}
                      placeholder="Write your reply here..."
                      value={draftReply}
                    />
                    <div className="mt-3 flex items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
                      <p className="text-[12px] text-[#8d8074]">
                        Replies are sent into the same ticket thread for the support team.
                      </p>
                      <button
                        className="inline-flex h-[42px] min-w-[140px] items-center justify-center rounded-[10px] bg-[#d96e39] px-5 text-[14px] font-bold text-white transition hover:bg-[#c9602c] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!draftReply.trim() || isSendingReply}
                        onClick={handleReplySubmit}
                        type="button"
                      >
                        {isSendingReply ? "Sending..." : "Send Reply"}
                      </button>
                    </div>
                  </div>
                </>
              ) : null
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center text-[14px] font-medium text-[#7d7068]">
                Select a support ticket to review the conversation and send a reply.
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
