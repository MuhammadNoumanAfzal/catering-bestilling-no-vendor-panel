import { useEffect, useMemo, useState } from "react";
import {
  getVendorReviewDetail,
  getVendorReviews,
  getVendorReviewSummary,
  saveVendorReviewReply,
} from "../api/reviewsApi";
import {
  createEmptyReviewSummary,
  getReviewQueryVariables,
  mapVendorReviewNode,
  mapVendorReviewsConnection,
  mapVendorReviewSummary,
} from "../api/reviewsMappers";
import {
  showReplyPostedSuccess,
  showVendorErrorAlert,
} from "../../../utils/vendorAlerts";

const PAGE_SIZE = 10;

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
  const [replyDrafts, setReplyDrafts] = useState({});
  const [reviewSummary, setReviewSummary] = useState(createEmptyReviewSummary);
  const [pageCache, setPageCache] = useState({});
  const [selectedReview, setSelectedReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplySaving, setIsReplySaving] = useState(false);

  const queryVariables = useMemo(
    () =>
      getReviewQueryVariables({
        pageSize: PAGE_SIZE,
        ratingFilter: activeFilter,
        selectedDateOption,
        appliedCustomRange,
      }),
    [activeFilter, appliedCustomRange, selectedDateOption],
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadInitialReviewData() {
      setIsLoading(true);

      try {
        const [summaryResult, listResult] = await Promise.all([
          getVendorReviewSummary(queryVariables),
          getVendorReviews(queryVariables),
        ]);

        if (isCancelled) {
          return;
        }

        const mappedSummary = mapVendorReviewSummary(summaryResult);
        const mappedList = mapVendorReviewsConnection(listResult);

        setReviewSummary(mappedSummary);
        setPageCache({
          1: mappedList,
        });
        setCurrentPage(1);
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error.message || "Unable to load reviews right now.",
            "Reviews unavailable",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    setSelectedReviewId(null);
    setSelectedReview(null);
    loadInitialReviewData();

    return () => {
      isCancelled = true;
    };
  }, [queryVariables]);

  const currentPageData = pageCache[currentPage] || {
    reviews: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "",
      endCursor: "",
    },
    totalCount: 0,
  };

  const filteredReviews = currentPageData.reviews;
  const paginatedReviews = currentPageData.reviews;
  const totalItems = currentPageData.totalCount || reviewSummary.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

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
  }

  function handleToggleDateMenu() {
    setIsDateMenuOpen((current) => !current);
  }

  function handleSelectDateOption(optionId) {
    setSelectedDateOption(optionId);

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
  }

  function handleClearFilters() {
    setActiveFilter("All");
    setSelectedDateOption("lastMonth");
    setIsDateMenuOpen(false);
    setIsCustomDateOpen(false);
    setCustomFrom("");
    setCustomTo("");
    setAppliedCustomRange(null);
  }

  async function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    if (pageCache[nextPage]) {
      setCurrentPage(nextPage);
      return;
    }

    if (nextPage < currentPage) {
      setCurrentPage(nextPage);
      return;
    }

    try {
      setIsLoading(true);

      let lastKnownPage = currentPage;
      let nextCache = { ...pageCache };

      while (lastKnownPage < nextPage) {
        const currentData = nextCache[lastKnownPage];

        if (!currentData?.pageInfo?.hasNextPage || !currentData?.pageInfo?.endCursor) {
          break;
        }

        const result = await getVendorReviews({
          ...queryVariables,
          after: currentData.pageInfo.endCursor,
        });
        const mappedPage = mapVendorReviewsConnection(result);
        nextCache[lastKnownPage + 1] = mappedPage;
        lastKnownPage += 1;
      }

      setPageCache(nextCache);
      setCurrentPage(Math.min(nextPage, lastKnownPage));
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to load more reviews right now.",
        "Pagination failed",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReplyOpen(review) {
    setSelectedReviewId(review.id);

    try {
      const result = await getVendorReviewDetail(review.id);
      const mappedReview = mapVendorReviewNode(result?.vendorReview);

      setSelectedReview(mappedReview);
      setReplyDrafts((currentDrafts) => ({
        ...currentDrafts,
        [review.id]: currentDrafts[review.id] ?? mappedReview.initialReply ?? "",
      }));
    } catch (error) {
      setSelectedReview(review);
      setReplyDrafts((currentDrafts) => ({
        ...currentDrafts,
        [review.id]: currentDrafts[review.id] ?? review.initialReply ?? "",
      }));
      await showVendorErrorAlert(
        error.message || "Unable to load the full review details.",
        "Review detail unavailable",
      );
    }
  }

  function handleReplyClose() {
    setSelectedReviewId(null);
    setSelectedReview(null);
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

  async function handleReplySubmit() {
    if (!selectedReviewId) {
      return;
    }

    const replyText = (replyDrafts[selectedReviewId] || "").trim();

    if (!replyText) {
      return;
    }

    try {
      setIsReplySaving(true);
      const result = await saveVendorReviewReply({
        id: selectedReviewId,
        replyText,
        attentionRequired: selectedReview?.attentionRequired || false,
      });

      setPageCache((currentCache) => {
        const nextCache = {};

        Object.entries(currentCache).forEach(([page, value]) => {
          nextCache[page] = {
            ...value,
            reviews: value.reviews.map((item) =>
              item.id === selectedReviewId
                ? {
                    ...item,
                    initialReply: result.instance?.vendorReply?.message || replyText,
                    vendorReplyId: result.instance?.vendorReply?.id || item.vendorReplyId,
                    vendorReplyCreatedOn:
                      result.instance?.vendorReply?.createdOn || item.vendorReplyCreatedOn,
                    status: result.instance?.status || item.status,
                    tone: "neutral",
                    attentionRequired: false,
                  }
                : item,
            ),
          };
        });

        return nextCache;
      });

      setSelectedReview((current) =>
        current
          ? {
              ...current,
              initialReply: result.instance?.vendorReply?.message || replyText,
              vendorReplyId: result.instance?.vendorReply?.id || current.vendorReplyId,
              vendorReplyCreatedOn:
                result.instance?.vendorReply?.createdOn || current.vendorReplyCreatedOn,
              status: result.instance?.status || current.status,
              tone: "neutral",
              attentionRequired: false,
            }
          : current,
      );
      setSelectedReviewId(null);
      setSelectedReview(null);
      await showReplyPostedSuccess();
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to post the review reply right now.",
        "Reply failed",
      );
    } finally {
      setIsReplySaving(false);
    }
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
    isLoading,
    isReplySaving,
    onCustomFromChange: setCustomFrom,
    onCustomToChange: setCustomTo,
    pageSize: PAGE_SIZE,
    paginatedReviews,
    replyDrafts,
    reviewSummary,
    selectedReview,
    totalPages,
    totalItems,
    selectedDateOption,
  };
}
