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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6">
      <div className="w-full max-w-[480px] rounded-[12px] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="type-h3 m-0 text-[#181310]">Reply to Review</h2>
          </div>
          <button className="text-[#473d36]" onClick={onClose} type="button">
            <X size={15} />
          </button>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <img
            alt={review.author}
            className="h-10 w-10 rounded-full object-cover"
            src={review.avatar}
          />
          <div className="min-w-0 flex-1">
            <p className="type-h4 m-0 text-[#181310]">{review.author}</p>
            <p className="mt-1 text-[14px] font-medium text-[#9b8f85]">
              {review.reviewDate} | Order {review.id}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1 text-[#f4c33f]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={13}
              fill={index < review.rating ? "currentColor" : "none"}
              className={index < review.rating ? "" : "text-[#ddd3ca]"}
            />
          ))}
          <span className="ml-1 text-[14px] font-semibold text-[#181310]">
            {review.rating}.0
          </span>
        </div>

        <p className="mt-3 text-[14px] font-medium leading-[1.55] text-[#3f352e]">
          {review.text}
        </p>

        <div className="mt-3 rounded-[8px] border border-[#e8dfd7] bg-[#fcfbfa] p-3">
          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-[14px] max-[520px]:grid-cols-1">
            <span className="font-semibold ">Order Amount</span>
            <span className="font-semibold text-[#181310]">
              {review.orderAmount}
            </span>
            <span className="font-semibold ">Order Type</span>
            <span className="font-semibold text-[#181310]">
              {review.deliveryType}
            </span>
            <span className="font-semibold ">Delivery Time</span>
            <span className="font-semibold text-[#181310]">
              {review.deliveryTime}
            </span>
            <span className="font-semibold ">Reviewed On</span>
            <span className="font-semibold text-[#181310]">
              {review.reviewedOn}
            </span>
          </div>
        </div>

        <textarea
          className="mt-3 min-h-[112px] w-full resize-none rounded-[8px] border border-[#d4cbc3] px-3 py-3 text-[10px] font-medium text-[#1f1814] outline-none transition placeholder:text-[#b1a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
          maxLength={500}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Your Reply (This will be visible to the customer)"
          value={draftReply}
        />

        <div className="mt-1 text-right text-[9px] font-medium text-[#a79a90]">
          {draftReply.length}/500
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            className="rounded-[4px] border border-[#cfc7bf] bg-white px-4 py-[6px] text-[9px] font-bold text-[#241c17]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-[4px] cursor-alias bg-[#de6f39] px-4 py-[6px] text-[9px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
