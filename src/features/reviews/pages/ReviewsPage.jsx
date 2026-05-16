import { useMemo, useState } from "react";
import ReviewListItem from "../components/ReviewListItem";
import ReplyReviewModal from "../components/ReplyReviewModal";
import ReviewsFiltersBar from "../components/ReviewsFiltersBar";
import ReviewsFooter from "../components/ReviewsFooter";
import ReviewsPagination from "../components/ReviewsPagination";
import ReviewsSummaryCard from "../components/ReviewsSummaryCard";
import {
  ratingBreakdown,
  reviewFilters,
  reviewItems,
  reviewStats,
} from "../data/reviewsData";

const PAGE_SIZE = 10;

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState(() =>
    Object.fromEntries(
      reviewItems
        .filter((item) => item.initialReply)
        .map((item) => [item.id, item.initialReply]),
    ),
  );

  const filteredReviews = useMemo(() => {
    if (activeFilter === "All") {
      return reviewItems;
    }

    const rating = Number(activeFilter.split(".")[0]);
    return reviewItems.filter((item) => item.rating === rating);
  }, [activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredReviews.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredReviews]);

  const selectedReview = useMemo(
    () => reviewItems.find((item) => item.id === selectedReviewId) ?? null,
    [selectedReviewId],
  );

  function handleFilterChange(filter) {
    setActiveFilter(filter);
    setCurrentPage(1);
  }

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setCurrentPage(nextPage);
  }

  function handleReplyOpen(review) {
    setSelectedReviewId(review.id);
    setReplyDrafts((currentDrafts) => ({
      ...currentDrafts,
      [review.id]: currentDrafts[review.id] ?? review.initialReply ?? "",
    }));
  }

  function handleReplyClose() {
    setSelectedReviewId(null);
  }

  function handleDraftChange(nextValue) {
    if (!selectedReviewId) {
      return;
    }

    setReplyDrafts((currentDrafts) => ({
      ...currentDrafts,
      [selectedReviewId]: nextValue,
    }));
  }

  function handleReplySubmit() {
    if (!selectedReviewId) {
      return;
    }

    setSelectedReviewId(null);
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col px-6 py-5 shadow-[0_10px_28px_rgba(53,34,19,0.05)] max-[720px]:px-4 max-[720px]:py-4">
      <header className="mb-5">
        <h1 className="type-h3 m-0 text-[#15110f]">Reviews &amp; Ratings</h1>
        <p className="type-para mt-1 text-[#746a62]">
          Manage and analyze your customer feedback loop.
        </p>
      </header>

      <ReviewsSummaryCard breakdown={ratingBreakdown} stats={reviewStats} />

      <div className="mt-4">
        <ReviewsFiltersBar
          activeFilter={activeFilter}
          filters={reviewFilters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {paginatedReviews.map((review) => (
          <ReviewListItem
            key={review.id}
            review={{ ...review, onReplyClick: () => handleReplyOpen(review) }}
          />
        ))}
      </div>

      <div className="mt-4">
        <ReviewsPagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={PAGE_SIZE}
          totalItems={filteredReviews.length}
          totalPages={totalPages}
        />
      </div>

      <ReviewsFooter />

      <ReplyReviewModal
        draftReply={selectedReview ? replyDrafts[selectedReview.id] ?? "" : ""}
        onClose={handleReplyClose}
        onDraftChange={handleDraftChange}
        onSubmit={handleReplySubmit}
        review={selectedReview}
      />
    </section>
  );
}
