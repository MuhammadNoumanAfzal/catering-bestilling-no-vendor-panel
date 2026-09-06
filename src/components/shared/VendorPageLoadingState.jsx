const widths = ["w-24", "w-40", "w-16", "w-28", "w-20"];

export default function VendorPageLoadingState({ variant = "table" }) {
  const isDetail = variant === "detail";
  const isForm = variant === "form";

  return (
    <section className="animate-pulse space-y-5" aria-busy="true" aria-label="Loading page content">
      <header className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-[#eadfd6]" />
        <div className="h-4 w-80 max-w-full rounded bg-[#f1e8e1]" />
      </header>

      {isForm ? (
        <div className="space-y-4 rounded-[18px] border border-[#eadfd6] bg-white p-5 shadow-[0_10px_24px_rgba(43,30,20,0.05)]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-3 w-28 rounded bg-[#eee3db]" />
              <div className="h-11 w-full rounded-xl bg-[#f7f1ec]" />
            </div>
          ))}
        </div>
      ) : isDetail ? (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-4 rounded-[18px] border border-[#eadfd6] bg-white p-5">
            <div className="h-6 w-2/5 rounded bg-[#eadfd6]" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-14 rounded-xl bg-[#f7f1ec]" />
            ))}
          </div>
          <div className="space-y-4 rounded-[18px] border border-[#eadfd6] bg-white p-5">
            <div className="h-5 w-1/2 rounded bg-[#eadfd6]" />
            <div className="h-40 rounded-xl bg-[#f7f1ec]" />
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-[#eadfd6] bg-white shadow-[0_10px_24px_rgba(43,30,20,0.05)]">
          <div className="flex items-center justify-between border-b border-[#f0e7e0] px-5 py-4">
            <div className="h-5 w-36 rounded bg-[#eadfd6]" />
            <div className="h-9 w-28 rounded-lg bg-[#f7f1ec]" />
          </div>
          <div className="space-y-1 p-5">
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-4 border-b border-[#f5eee9] py-4 last:border-0">
                {widths.map((width, columnIndex) => (
                  <div key={columnIndex} className={`h-4 rounded bg-[#f1e8e1] ${width}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
