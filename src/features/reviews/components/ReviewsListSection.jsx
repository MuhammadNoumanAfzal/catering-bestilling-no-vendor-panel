import ReviewListItem from "./ReviewListItem";

export default function ReviewsListSection({ reviews, onReplyOpen }) {
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
