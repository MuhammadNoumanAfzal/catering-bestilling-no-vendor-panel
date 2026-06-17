export default function EarningChart({ values, subtitle }) {
  if (!values || values.length === 0) {
    return (
      <div className="flex h-[230px] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#ddd4cb] bg-[#faf8f6] p-4 text-center mt-6">
        <p className="type-subpara text-[14px] font-bold text-[#8d7e72]">No Date Range Selected</p>
        <p className="type-para mt-1 text-[12px] text-[#a49b92]">Select a start and end date above to view the earnings overview.</p>
      </div>
    );
  }

  return (
    <>
      <p className="type-para -mt-1 ">{subtitle}</p>
      <div className="mt-[40px] grid grid-cols-[48px_minmax(0,1fr)] gap-[10px] items-start max-[720px]:grid-cols-1 max-[720px]:mt-8">
        {/* Y-axis Labels */}
        <div className="flex h-[182px] flex-col justify-between text-[#4e433a] max-[720px]:hidden">
          <span className="type-subpara leading-none">kr 10000</span>
          <span className="type-subpara leading-none">kr 7500</span>
          <span className="type-subpara leading-none">kr 5000</span>
          <span className="type-subpara leading-none">kr 2500</span>
          <span className="type-subpara leading-none">kr 0</span>
        </div>

        {/* Chart Body */}
        <div className="relative">
          {/* Grid lines and Bars container (perfectly matched 182px height) */}
          <div className="relative h-[182px] w-full">
            {/* Grid lines */}
            <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between" aria-hidden="true">
              <span className="block w-full border-t border-[#e2dcd5]" />
              <span className="block w-full border-t border-[#e2dcd5]" />
              <span className="block w-full border-t border-[#e2dcd5]" />
              <span className="block w-full border-t border-[#e2dcd5]" />
              <span className="block w-full border-t border-[#e2dcd5]" />
            </div>

            {/* Bars */}
            <div
              className="relative z-[1] grid h-full items-end gap-[14px] max-[720px]:gap-2"
              style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
            >
              {values.map((item) => (
                <div key={item.month} className="flex h-full items-end justify-center">
                  <div
                    className="w-6 max-w-full rounded-t-[999px] bg-[#cc6334] max-[720px]:w-4"
                    style={{ height: `${item.value}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Day Labels Row (perfectly matched grid template for center alignment) */}
          <div
            className="grid gap-[14px] mt-[10px] max-[720px]:gap-2"
            style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
          >
            {values.map((item) => (
              <div key={item.month} className="text-center">
                <span className="type-subpara text-[10px] text-[#2f2822]">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
