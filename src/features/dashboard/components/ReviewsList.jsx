import { ChevronRight, Star } from "lucide-react";

export default function ReviewsList({ reviews }) {
  return (
    <>
      <p className="type-para -mt-1 ">Customer feedback on latest events</p>
      <div className="mt-3 flex flex-col gap-3">
        {reviews.map((review, index) => (
          <article
            key={`${review.name}-${index}`}
            className="flex gap-2.5 bg-transparent p-0"
          >
            <div
              className="h-9 w-9 shrink-0 rounded-full bg-[#e2e2e2]"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2.5">
                <div>
                  <h3 className="type-para m-0 text-[#201914]">
                    {review.name}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div
                      className="inline-flex gap-0.5 text-[#ffb400]"
                      aria-label={`${review.rating} stars`}
                    >
                      {[...Array(5)].map((_, starIndex) => (
                        <Star
                          key={`${review.name}-${starIndex}`}
                          size={10}
                          fill="currentColor"
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                    {review.time ? (
                      <span className="type-subpara text-[9px] text-[#7a6c61]">
                        {review.time}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="type-subpara text-[9px] text-[#7a6c61]">
                  {review.id}
                </span>
              </div>
              <p className="type-subpara mt-1.5 text-[10px] leading-[1.4] ]">
                {review.summary}
              </p>
            </div>
          </article>
        ))}
      </div>
      <button
        className="type-para cursor-pointer mt-3 inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[#2f69c8]"
        type="button"
      >
        Manage reviews
        <ChevronRight size={12} />
      </button>
    </>
  );
}
