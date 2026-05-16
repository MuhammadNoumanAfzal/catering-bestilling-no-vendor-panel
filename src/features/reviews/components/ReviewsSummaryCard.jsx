import { Star } from "lucide-react";

export default function ReviewsSummaryCard({ breakdown, stats }) {
  const maxCount = Math.max(...breakdown.map((item) => item.count));

  return (
    <section className="rounded-[12px] border border-[#ddd5ce] bg-white px-5 py-3 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="grid grid-cols-[minmax(150px,0.88fr)_minmax(260px,1.2fr)_minmax(190px,0.82fr)] gap-4 max-[980px]:grid-cols-1">
        <div className="flex flex-col items-center justify-center border-r border-[#eadfd7] pr-5 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:pb-4 max-[980px]:pr-0">
          <strong className="type-h2 text-[42px] leading-none text-[#15110f]">4.8</strong>
          <div className="mt-2 flex items-center gap-1 text-[#f6c444]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={17} fill="currentColor" />
            ))}
          </div>
          <p className="type-para mt-2 text-[#746a62]">Based on 128 reviews</p>
        </div>

        <div className="flex items-center border-r border-[#eadfd7] pr-4 max-[980px]:border-r-0 max-[980px]:border-b max-[980px]:pb-4 max-[980px]:pr-0">
          <div className="flex w-full flex-col justify-center gap-3">
            {breakdown.map((item) => (
              <div key={item.stars} className="grid grid-cols-[28px_minmax(220px,1fr)_42px] items-center gap-2">
                <span className="text-[14px] font-extrabold leading-none text-[#5b5047]">
                  {item.stars}★
                </span>
                <div className="flex items-center">
                  <div className="h-[10px] w-full overflow-hidden rounded-full bg-[#ece7e2]">
                    <div
                      className="h-full rounded-full bg-[#d96e39]"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-right text-[14px] font-bold leading-none text-[#8a7c70]">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[980px]:grid-cols-3 max-[680px]:grid-cols-1">
          {stats.map((item) => (
            <div key={item.label}>
              <p className="text-[10px] font-extrabold tracking-[0.04em] text-[#2a211c]">{item.label}</p>
              <strong className="type-h4 mt-1.5 block font-extrabold text-[#14110e]">{item.value}</strong>
              <p className="type-para mt-1 font-semibold text-[#3a302a]">{item.helper}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
