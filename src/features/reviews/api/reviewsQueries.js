export const GET_VENDOR_REVIEW_SUMMARY_QUERY = `
  query GetVendorReviewSummary(
    $datePreset: String
    $dateFrom: Date
    $dateTo: Date
  ) {
    vendorReviewSummary(
      datePreset: $datePreset
      dateFrom: $dateFrom
      dateTo: $dateTo
    ) {
      averageRating
      totalCount
      newReviewsCount
      repliedCount
      responseRate
      ratingBreakdown {
        stars
        count
      }
    }
  }
`;

export const GET_VENDOR_REVIEWS_QUERY = `
  query GetVendorReviews(
    $first: Int = 10
    $after: String
    $rating: Int
    $datePreset: String
    $dateFrom: Date
    $dateTo: Date
    $hasReply: Boolean
    $search: String
  ) {
    vendorReviews(
      first: $first
      after: $after
      rating: $rating
      datePreset: $datePreset
      dateFrom: $dateFrom
      dateTo: $dateTo
      hasReply: $hasReply
      search: $search
    ) {
      edges {
        node {
          id
          rating
          title
          comment
          occasion
          eventDate
          createdOn
          ageLabel
          status
          orderRef
          orderAmount
          deliveryType
          deliveryTime
          reviewedOnLabel
          isVerifiedOrder
          customer {
            id
            fullName
            avatarUrl
          }
          vendorReply {
            id
            message
            createdOn
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_VENDOR_REVIEW_DETAIL_QUERY = `
  query GetVendorReviewDetail($id: ID!) {
    vendorReview(id: $id) {
      id
      rating
      title
      comment
      occasion
      eventDate
      createdOn
      ageLabel
      status
      orderRef
      orderAmount
      deliveryType
      deliveryTime
      reviewedOnLabel
      isVerifiedOrder
      customer {
        id
        fullName
        avatarUrl
      }
      vendorReply {
        id
        message
        createdOn
      }
    }
  }
`;

export const VENDOR_REVIEW_REPLY_MUTATION = `
  mutation VendorReviewReply($id: ID!, $replyText: String!, $attentionRequired: Boolean) {
    vendorReviewReply(id: $id, replyText: $replyText, attentionRequired: $attentionRequired) {
      success
      message
      instance {
        id
        status
        vendorReply {
          id
          message
          createdOn
        }
      }
    }
  }
`;
