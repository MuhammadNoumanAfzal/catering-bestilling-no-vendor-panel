import { Star, X } from "lucide-react";

export default function ReplyReviewModal({
  draftReply,
  onClose,
  onDraftChange,
  onSubmit,
  review,
}) {
  if (!review) {
    return null;
  }

  const isReadyToPost = draftReply.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-[2px]">
      <div className="relative w-full max-w-[480px] rounded-[16px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] my-auto max-h-[calc(100vh-32px)] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#efe6de] pb-3">
          <h2 className="type-h3 m-0 text-[#181310]">Reply to Review</h2>
          <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#7a6d63] hover:bg-[#faf7f4] hover:text-[#181310] transition" onClick={onClose} type="button">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3.5 hide-scrollbar">
          {/* User profile */}
          <div className="flex items-start gap-3">
            <img
              alt={review.author}
              className="h-10 w-10 rounded-full object-cover border border-[#efe6de]"
              src={review.avatar}
            />
            <div className="min-w-0 flex-1">
              <p className="type-h4 m-0 text-[#181310]">{review.author}</p>
              <p className="mt-1 text-[13px] font-medium text-[#8c7f73]">
                {review.reviewDate} | Order {review.id}
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="mt-3 flex items-center gap-1 text-[#f4c33f]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={14}
                fill={index < review.rating ? "currentColor" : "none"}
                className={index < review.rating ? "" : "text-[#ddd3ca]"}
              />
            ))}
            <span className="ml-1.5 text-[13px] font-extrabold text-[#181310]">
              {review.rating}.0
            </span>
          </div>

          {/* Review Text */}
          <p className="mt-3.5 text-[14px] font-medium leading-[1.6] text-[#4c423b]">
            "{review.text}"
          </p>

          {/* Order info details box */}
          <div className="mt-4 rounded-[10px] border border-[#efe6de] bg-[#faf8f5] p-3.5">
            <div className="flex flex-col gap-2.5 text-[13px]">
              <div className="flex items-center justify-between gap-3 border-b border-[#f2ece6] pb-2">
                <span className="font-semibold text-[#7a6d63]">Order Amount</span>
                <span className="font-extrabold text-[#1c1510]">{review.orderAmount}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-[#f2ece6] pb-2">
                <span className="font-semibold text-[#7a6d63]">Order Type</span>
                <span className="font-extrabold text-[#1c1510]">{review.deliveryType}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-[#f2ece6] pb-2">
                <span className="font-semibold text-[#7a6d63]">Delivery Time</span>
                <span className="font-extrabold text-[#1c1510]">{review.deliveryTime}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[#7a6d63]">Reviewed On</span>
                <span className="font-extrabold text-[#1c1510]">{review.reviewedOn}</span>
              </div>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            className="mt-4 min-h-[112px] w-full resize-none rounded-[10px] border border-[#d4cbc3] px-3.5 py-3 text-[13px] font-semibold text-[#1f1814] outline-none transition placeholder:text-[#b1a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)] bg-[#fffdfa]"
            maxLength={500}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Your Reply (This will be visible to the customer)..."
            value={draftReply}
          />
          <div className="mt-1 text-right text-[11px] font-bold text-[#a79a90]">
            {draftReply.length}/500
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#efe6de] pt-3">
          <button
            className="h-8 cursor-pointer rounded-[6px] border border-[#cfc7bf] bg-white px-4 text-[12px] font-extrabold text-[#241c17] hover:bg-[#faf7f4] active:scale-95 transition"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-8 cursor-pointer rounded-[6px] bg-[#d96e39] px-4 text-[12px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] active:scale-95 transition disabled:pointer-events-none disabled:opacity-50"
            disabled={!isReadyToPost}
            onClick={onSubmit}
            type="button"
          >
            Post Reply
          </button>
        </div>

      </div>
    </div>
  );
}
