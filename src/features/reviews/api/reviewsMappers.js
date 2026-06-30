function normalizeString(value) {
  return value == null ? "" : String(value);
}

function formatCurrencyAmount(value) {
  const normalized = normalizeString(value).trim();

  if (!normalized) {
    return "";
  }

  return normalized.includes("kr") ? normalized : `${normalized} kr`;
}

export function createEmptyReviewSummary() {
  return {
    averageRating: 0,
    totalCount: 0,
    newReviewsCount: 0,
    repliedCount: 0,
    responseRate: 0,
    ratingBreakdown: [
      { stars: 5, count: 0 },
      { stars: 4, count: 0 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  };
}

export function mapVendorReviewSummary(data) {
  const summary = data?.vendorReviewSummary;

  if (!summary) {
    return createEmptyReviewSummary();
  }

  const existingBreakdown = Array.isArray(summary.ratingBreakdown) ? summary.ratingBreakdown : [];
  const breakdownMap = new Map(existingBreakdown.map((item) => [item?.stars, Number(item?.count) || 0]));

  return {
    averageRating: Number(summary.averageRating) || 0,
    totalCount: Number(summary.totalCount) || 0,
    newReviewsCount: Number(summary.newReviewsCount) || 0,
    repliedCount: Number(summary.repliedCount) || 0,
    responseRate: Number(summary.responseRate) || 0,
    ratingBreakdown: [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: breakdownMap.get(stars) || 0,
    })),
  };
}

export function mapVendorReviewNode(node) {
  const rating = Number(node?.rating) || 0;
  const hasReply = Boolean(node?.vendorReply?.message);
  const status = normalizeString(node?.status).toLowerCase();
  const needsAttention = !hasReply && rating <= 2;

  return {
    id: normalizeString(node?.id),
    author: normalizeString(node?.customer?.fullName) || "Anonymous Customer",
    avatar: normalizeString(node?.customer?.avatarUrl),
    rating,
    age: normalizeString(node?.ageLabel),
    reviewDate: normalizeString(node?.eventDate || node?.createdOn),
    text: normalizeString(node?.comment),
    title: normalizeString(node?.title),
    orderType: normalizeString(node?.occasion) || "Review",
    eventLabel: node?.isVerifiedOrder ? "Verified Order" : "Customer Review",
    orderRef: normalizeString(node?.orderRef),
    orderAmount: formatCurrencyAmount(node?.orderAmount),
    deliveryType: normalizeString(node?.deliveryType),
    deliveryTime: normalizeString(node?.deliveryTime),
    reviewedOn: normalizeString(node?.reviewedOnLabel),
    initialReply: normalizeString(node?.vendorReply?.message),
    vendorReplyId: normalizeString(node?.vendorReply?.id),
    vendorReplyCreatedOn: normalizeString(node?.vendorReply?.createdOn),
    status,
    tone: needsAttention ? "alert" : "neutral",
    attentionRequired: needsAttention,
  };
}

export function mapVendorReviewsConnection(data) {
  const connection = data?.vendorReviews;
  const edges = Array.isArray(connection?.edges) ? connection.edges : [];

  return {
    reviews: edges.map((edge) => mapVendorReviewNode(edge?.node)).filter((item) => item.id),
    pageInfo: {
      hasNextPage: Boolean(connection?.pageInfo?.hasNextPage),
      hasPreviousPage: Boolean(connection?.pageInfo?.hasPreviousPage),
      startCursor: normalizeString(connection?.pageInfo?.startCursor),
      endCursor: normalizeString(connection?.pageInfo?.endCursor),
    },
    totalCount: Number(connection?.totalCount) || 0,
  };
}

export function getReviewQueryVariables({
  pageSize,
  ratingFilter,
  selectedDateOption,
  appliedCustomRange,
}) {
  const variables = {
    first: pageSize,
  };

  if (ratingFilter && ratingFilter !== "All") {
    variables.rating = Number(ratingFilter.split(".")[0]);
  }

  if (selectedDateOption === "custom" && appliedCustomRange?.from && appliedCustomRange?.to) {
    variables.dateFrom = appliedCustomRange.from;
    variables.dateTo = appliedCustomRange.to;
  } else if (selectedDateOption && selectedDateOption !== "custom") {
    variables.datePreset = selectedDateOption;
  }

  return variables;
}
