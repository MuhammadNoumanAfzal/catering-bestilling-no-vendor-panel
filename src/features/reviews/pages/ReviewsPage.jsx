import ReplyReviewModal from "../components/ReplyReviewModal";
import ReviewsFiltersBar from "../components/ReviewsFiltersBar";
import ReviewsListSection from "../components/ReviewsListSection";
import ReviewsPageHeader from "../components/ReviewsPageHeader";
import ReviewsPagination from "../components/ReviewsPagination";
import ReviewsSummaryCard from "../components/ReviewsSummaryCard";
import {
  ratingBreakdown,
  reviewFilters,
  reviewStats,
} from "../data/reviewsData";
import useReviewsPageState from "../hooks/useReviewsPageState";

export default function ReviewsPage() {
  const {
    activeFilter,
    currentPage,
    customFrom,
    customTo,
    dateButtonLabel,
    filteredReviews,
    handleApplyCustomDate,
    handleClearFilters,
    handleDraftChange,
    handleFilterChange,
    handlePageChange,
    handleReplyClose,
    handleReplyOpen,
    handleReplySubmit,
    handleSelectDateOption,
    handleToggleDateMenu,
    isCustomDateOpen,
    isDateMenuOpen,
    onCustomFromChange,
    onCustomToChange,
    pageSize,
    paginatedReviews,
    replyDrafts,
    selectedReview,
    totalPages,
  } = useReviewsPageState();

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <ReviewsPageHeader />

      <ReviewsSummaryCard breakdown={ratingBreakdown} stats={reviewStats} />

      <div className="mt-4">
        <ReviewsFiltersBar
          activeFilter={activeFilter}
          customFrom={customFrom}
          customTo={customTo}
          dateButtonLabel={dateButtonLabel}
          filters={reviewFilters}
          isCustomDateOpen={isCustomDateOpen}
          isDateMenuOpen={isDateMenuOpen}
          onApplyCustomDate={handleApplyCustomDate}
          onClearFilters={handleClearFilters}
          onCustomFromChange={onCustomFromChange}
          onCustomToChange={onCustomToChange}
          onFilterChange={handleFilterChange}
          onSelectDateOption={handleSelectDateOption}
          onToggleDateMenu={handleToggleDateMenu}
        />
      </div>

      <ReviewsListSection
        onReplyOpen={handleReplyOpen}
        reviews={paginatedReviews}
      />

      <div className="mt-4">
        <ReviewsPagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          totalItems={filteredReviews.length}
          totalPages={totalPages}
        />
      </div>
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
