export default function EarningChart({ values }) {
  return (
    <>
      <p className="type-para -mt-1 ">Revenue performance over the last 7 days</p>
      <div className="mt-[40px] grid grid-cols-[48px_minmax(0,1fr)] gap-[10px] items-stretch max-[720px]:grid-cols-1">
        <div className="flex h-[210px] flex-col justify-between text-[#4e433a] max-[720px]:hidden">
          <span className="type-subpara">$10000</span>
          <span className="type-subpara">$7500</span>
          <span className="type-subpara">$5000</span>
          <span className="type-subpara">$2500</span>
          <span className="type-subpara">$0</span>
        </div>

        <div className="relative h-[210px] pt-0.5 max-[720px]:h-[198px]">
          <div className="absolute inset-x-0 bottom-5 top-0 flex flex-col justify-between" aria-hidden="true">
            <span className="block w-full border-t border-[#c7beb4]" />
            <span className="block w-full border-t border-[#c7beb4]" />
            <span className="block w-full border-t border-[#c7beb4]" />
            <span className="block w-full border-t border-[#c7beb4]" />
          </div>

          <div className="relative z-[1] grid h-full grid-cols-7 items-end gap-[14px] max-[720px]:gap-2">
            {values.map((item) => (
              <div key={item.month} className="flex flex-col items-center justify-end gap-[7px]">
                <div className="flex h-[182px] w-full items-end">
                  <div
                    className="w-6 max-w-full rounded-t-[999px] bg-[#cc6334]"
                    style={{ height: `${item.value}%` }}
                  />
                </div>
                <span className="type-subpara text-[10px] text-[#2f2822]">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
