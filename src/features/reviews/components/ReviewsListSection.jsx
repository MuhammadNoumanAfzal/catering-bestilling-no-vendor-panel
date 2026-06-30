import ReviewListItem from "./ReviewListItem";

export default function ReviewsListSection({ reviews, onReplyOpen, isLoading = false }) {
  if (isLoading && reviews.length === 0) {
    return (
      <div className="mt-4 rounded-[12px] border border-[#ddd5ce] bg-white px-4 py-6 text-center text-[14px] font-medium text-[#7a6d63] shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
        Loading reviews...
      </div>
    );
  }

  if (!isLoading && reviews.length === 0) {
    return (
      <div className="mt-4 rounded-[12px] border border-[#ddd5ce] bg-white px-4 py-6 text-center text-[14px] font-medium text-[#7a6d63] shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
        No reviews found for the selected filters.
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {reviews.map((review) => (
        <ReviewListItem
          key={review.id}
          review={{ ...review, onReplyClick: () => onReplyOpen(review) }}
        />
      ))}
    </div>
  );
}
