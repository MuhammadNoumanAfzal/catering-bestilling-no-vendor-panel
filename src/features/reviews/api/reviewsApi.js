import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  GET_VENDOR_REVIEW_DETAIL_QUERY,
  GET_VENDOR_REVIEWS_QUERY,
  GET_VENDOR_REVIEW_SUMMARY_QUERY,
  VENDOR_REVIEW_REPLY_MUTATION,
} from "./reviewsQueries";

function unwrapMutationResult(result, key, fallbackMessage) {
  const payload = result?.[key];

  if (!payload?.success) {
    throw new Error(payload?.message || fallbackMessage);
  }

  return payload;
}

export function getVendorReviewSummary(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_REVIEW_SUMMARY_QUERY, variables);
}

export function getVendorReviews(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_REVIEWS_QUERY, {
    first: 10,
    ...variables,
  });
}

export function getVendorReviewDetail(id) {
  return executeProtectedGraphqlRequest(GET_VENDOR_REVIEW_DETAIL_QUERY, { id });
}

export async function saveVendorReviewReply(variables) {
  const result = await executeProtectedGraphqlRequest(VENDOR_REVIEW_REPLY_MUTATION, variables);
  return unwrapMutationResult(
    result,
    "vendorReviewReply",
    "Unable to save the review reply.",
  );
}
