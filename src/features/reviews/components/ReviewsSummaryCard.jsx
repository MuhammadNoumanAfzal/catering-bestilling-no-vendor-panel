import { Star } from "lucide-react";

export default function ReviewsSummaryCard({ breakdown, stats }) {
  const maxCount = Math.max(...breakdown.map((item) => item.count));
  const totalCount = breakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-[12px] border border-[#ddd5ce] bg-white px-5 py-3 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="grid grid-cols-[minmax(150px,0.88fr)_minmax(260px,1.2fr)_minmax(190px,0.82fr)] gap-4 max-[980px]:grid-cols-1">
        <div className="flex flex-col items-center justify-center border-r border-[#eadfd7] pr-5 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:pb-4 max-[980px]:pr-0">
          <strong className="type-h1 text-[42px] leading-none text-[#15110f]">
            4.8
          </strong>
          <div className="mt-2 flex items-center gap-1 text-[#f6c444]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={17} fill="currentColor" color="currentColor" />
            ))}
          </div>
          <p className="type-para mt-2">Based on {totalCount} reviews</p>
        </div>

        <div className="flex items-center border-r border-[#eadfd7] pr-4 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:pb-4 max-[980px]:pr-0">
          <div className="flex w-full flex-col justify-center gap-3">
            {breakdown.map((item) => {
              const percentage = Math.round((item.count / totalCount) * 100);

              return (
                <div
                  key={item.stars}
                  className="grid grid-cols-[34px_minmax(220px,1fr)_72px] items-center gap-2"
                >
                  <span className="flex items-center gap-1 text-[13px] font-extrabold leading-none text-[#5b5047]">
                    <span>{item.stars}</span>
                    <Star size={12} fill="#f6c444" color="#f6c444" />
                  </span>
                  <div className="flex items-center">
                    <div className="h-[10px] w-full overflow-hidden rounded-full bg-[#ece7e2]">
                      <div
                        className="h-full rounded-full bg-[#d96e39]"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-right text-[12px] font-bold leading-none text-[#8a7c70]">
                    {item.count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4 max-[680px]:grid-cols-1">
          {stats.map((item, index) => (
            <div
              key={item.label}
              className={index === stats.length - 1 ? "col-span-2 max-[680px]:col-span-1" : ""}
            >
              <p className="type-h6 font-extrabold tracking-[0.04em]">
                {item.label}
              </p>
              <strong className="type-h4 mt-1.5 block font-extrabold text-[#14110e]">
                {item.value}
              </strong>
              <p className="type-para mt-1 font-semibold text-[#3a302a]">
                {item.helper}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
