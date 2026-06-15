import { AlertCircle, CornerUpLeft, Star } from "lucide-react";

export default function ReviewListItem({ review }) {
  return (
    <article
      className={`rounded-[12px] border px-4 py-3 shadow-[0_3px_10px_rgba(43,30,20,0.04)] ${
        review.tone === "alert"
          ? "border-[#efc4c4] bg-[#fff7f7]"
          : "border-[#ddd5ce] bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3 max-[520px]:flex-col max-[520px]:items-stretch max-[520px]:gap-3.5">
        <div className="flex items-start gap-3">
          <img
            alt={review.author}
            className="h-9 w-9 rounded-full object-cover"
            src={review.avatar}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="type-h4 m-0 text-[#181310]">{review.author}</h3>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#f4c33f]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={12}
                    fill={index < review.rating ? "currentColor" : "none"}
                    className={index < review.rating ? "" : "text-[#dbd1c8]"}
                  />
                ))}
              </div>
              <span className="text-[14px] font-medium text-[#a3978b]">{review.age}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 max-[520px]:w-full max-[520px]:justify-between max-[520px]:border-t max-[520px]:border-[#efe6de] max-[520px]:pt-2.5">
          <div className="flex flex-col items-end max-[520px]:items-start leading-none">
            <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#9c8f83]">
              Order Ref
            </span>
            <span className="mt-1 text-[13px] font-extrabold text-[#201914]">#{review.id}</span>
          </div>
          <button
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#d8d0c9] cursor-pointer bg-white px-3 py-[7px] text-[10px] font-bold text-[#201914] active:scale-95 transition"
            onClick={review.onReplyClick}
            type="button"
          >
            <CornerUpLeft size={11} />
            Reply
          </button>
        </div>
      </div>

      <p className="type-subpara mt-3 text-[#75695f]">{review.text}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#fff2ec] px-2.5 py-1 text-[12px] font-bold text-[#d96e39]">
          {review.orderType}
        </span>
        <span className="rounded-full border border-[#ecd8d8] bg-[#fff7f7] px-2.5 py-1 text-[12px] font-bold text-[#dd7777]">
          {review.eventLabel}
        </span>
      </div>

      {review.tone === "alert" ? (
        <div className="mt-3 flex items-center gap-2 rounded-[4px] border border-[#eda5a5] bg-[#fff3f3] px-3 py-2">
          <AlertCircle size={12} className="shrink-0 text-[#d12929]" />
          <span className="text-[12px] font-medium text-[#e62828]">
            Priority Attention Required: Negative feedback affects merchant score.
          </span>
        </div>
      ) : null}
    </article>
  );
}
