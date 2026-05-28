import { useMemo, useState } from "react";
import { reviewItems } from "../data/reviewsData";

const PAGE_SIZE = 10;

function parseReviewDate(dateText) {
  return new Date(dateText);
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export default function useReviewsPageState() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [selectedDateOption, setSelectedDateOption] = useState("lastMonth");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedCustomRange, setAppliedCustomRange] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState(() =>
    Object.fromEntries(
      reviewItems
        .filter((item) => item.initialReply)
        .map((item) => [item.id, item.initialReply]),
    ),
  );

  const filteredReviews = useMemo(() => {
    const latestReviewDate = reviewItems.reduce((latest, item) => {
      const reviewDate = parseReviewDate(item.reviewDate);
      return reviewDate > latest ? reviewDate : latest;
    }, parseReviewDate(reviewItems[0].reviewDate));

    return reviewItems.filter((item) => {
      const matchesRating =
        activeFilter === "All" ||
        item.rating === Number(activeFilter.split(".")[0]);

      const reviewDate = parseReviewDate(item.reviewDate);
      let matchesDate = true;

      if (selectedDateOption === "lastMonth") {
        const threshold = new Date(latestReviewDate);
        threshold.setMonth(threshold.getMonth() - 1);
        matchesDate = reviewDate >= threshold;
      } else if (selectedDateOption === "last3Months") {
        const threshold = new Date(latestReviewDate);
        threshold.setMonth(threshold.getMonth() - 3);
        matchesDate = reviewDate >= threshold;
      } else if (selectedDateOption === "last6Months") {
        const threshold = new Date(latestReviewDate);
        threshold.setMonth(threshold.getMonth() - 6);
        matchesDate = reviewDate >= threshold;
      } else if (selectedDateOption === "thisYear") {
        matchesDate =
          reviewDate.getFullYear() === latestReviewDate.getFullYear();
      } else if (
        selectedDateOption === "custom" &&
        appliedCustomRange?.from &&
        appliedCustomRange?.to
      ) {
        const fromDate = new Date(appliedCustomRange.from);
        const toDate = new Date(appliedCustomRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = reviewDate >= fromDate && reviewDate <= toDate;
      }

      return matchesRating && matchesDate;
    });
  }, [activeFilter, appliedCustomRange, selectedDateOption]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredReviews.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredReviews]);

  const selectedReview = useMemo(
    () => reviewItems.find((item) => item.id === selectedReviewId) ?? null,
    [selectedReviewId],
  );

  const dateButtonLabel =
    selectedDateOption === "custom" &&
    appliedCustomRange?.from &&
    appliedCustomRange?.to
      ? `From: ${formatDateLabel(appliedCustomRange.from)} To: ${formatDateLabel(appliedCustomRange.to)}`
      : selectedDateOption === "last3Months"
        ? "Last 3 Months"
        : selectedDateOption === "last6Months"
          ? "Last 6 Months"
          : selectedDateOption === "thisYear"
            ? "This Year"
            : selectedDateOption === "custom"
              ? "Custom Date"
              : "Last Month";

  function handleFilterChange(filter) {
    setActiveFilter(filter);
    setCurrentPage(1);
  }

  function handleToggleDateMenu() {
    setIsDateMenuOpen((current) => !current);
  }

  function handleSelectDateOption(optionId) {
    setSelectedDateOption(optionId);
    setCurrentPage(1);

    if (optionId === "custom") {
      setIsCustomDateOpen(true);
      setIsDateMenuOpen(true);
      return;
    }

    setIsDateMenuOpen(false);
    setIsCustomDateOpen(false);
    setAppliedCustomRange(null);
  }

  function handleApplyCustomDate() {
    if (!customFrom || !customTo) {
      return;
    }

    setAppliedCustomRange({
      from: customFrom,
      to: customTo,
    });
    setSelectedDateOption("custom");
    setIsCustomDateOpen(false);
    setIsDateMenuOpen(false);
    setCurrentPage(1);
  }

  function handleClearFilters() {
    setActiveFilter("All");
    setSelectedDateOption("lastMonth");
    setIsDateMenuOpen(false);
    setIsCustomDateOpen(false);
    setCustomFrom("");
    setCustomTo("");
    setAppliedCustomRange(null);
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

  return {
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
    onCustomFromChange: setCustomFrom,
    onCustomToChange: setCustomTo,
    pageSize: PAGE_SIZE,
    paginatedReviews,
    replyDrafts,
    selectedReview,
    totalPages,
  };
}
