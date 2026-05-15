import { ChevronRight, Star } from "lucide-react";

export default function ReviewsList({ reviews }) {
  return (
    <>
      <p className="dashboard-review-caption type-subpara">
        Customer feedback on latest events
      </p>
      <div className="dashboard-review-list">
        {reviews.map((review, index) => (
          <article key={`${review.name}-${index}`} className="dashboard-review-card">
            <div className="dashboard-review-avatar" aria-hidden="true" />
            <div className="dashboard-review-content">
              <div className="dashboard-review-top">
                <div>
                  <h3 className="dashboard-review-name type-subpara">{review.name}</h3>
                  <div className="dashboard-review-stars" aria-label={`${review.rating} stars`}>
                    {[...Array(5)].map((_, starIndex) => (
                      <Star key={`${review.name}-${starIndex}`} size={10} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <span className="dashboard-review-id type-subpara">{review.id}</span>
              </div>
              <p className="dashboard-review-summary type-subpara">{review.summary}</p>
            </div>
          </article>
        ))}
      </div>
      <button className="dashboard-review-link type-subpara" type="button">
        Manage reviews
        <ChevronRight size={12} />
      </button>
    </>
  );
}
