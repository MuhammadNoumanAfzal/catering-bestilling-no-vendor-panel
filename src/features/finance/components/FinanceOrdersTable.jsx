import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FinanceOrdersTable({
  currentPage,
  onPageChange,
  pageSize,
  rows,
  totalItems,
  totalPages,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visiblePages = pageNumbers.filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );
  const paginationItems = [];

  visiblePages.forEach((page, index) => {
    paginationItems.push(page);

    const nextPage = visiblePages[index + 1];
    if (nextPage && nextPage - page > 1) {
      paginationItems.push("ellipsis");
    }
  });

  return (
    <section className="rounded-[12px] border border-[#ddd5ce] bg-white shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="border-b border-[#ede5de] text-left">
              {["Sr.", "Order ID", "Customer", "Event", "Date", "Total Amount", "Commission", "Net Earnings", "Status", ""].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-[#eee7df] px-[10px] py-3 text-left text-[13px] font-extrabold text-[#17120e]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={`${row[0]}-${index}`} className="border-b border-[#f2ece6] last:border-b-0">
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#17120e]">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[14px] font-extrabold text-[#1c1510]">
                    {row[0]}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#17120e]">
                    {row[1]}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#17120e]">
                    {row[2]}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3">
                    <div className="flex flex-col gap-0.5 text-[11px] font-bold leading-[1.2] text-[#75695f]">
                      <span>{row[3]}</span>
                    </div>
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#17120e]">
                    {row[4]}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#de5f5f]">
                    {row[5]}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-extrabold text-[#17120e]">
                    {row[6]}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3">
                    <span
                      className={`inline-flex min-h-[22px] items-center justify-center rounded-full px-[11px] text-[11px] font-bold ${
                        row[7] === "Pending" ? "bg-[#fff4dd] text-[#d8a12f]" : "bg-[#edf9ef] text-[#38a657]"
                      }`}
                    >
                      {row[7]}
                    </span>
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[14px] font-bold tracking-[0.2em] text-[#6f6358]">
                    ...
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-[10px] py-8 text-center text-[13px] font-semibold text-[#8b7d72]"
                  colSpan={10}
                >
                  No orders match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-3.5 max-[860px]:flex-col max-[860px]:items-center max-[860px]:text-center">
        <span className="type-subpara text-[13px] font-medium text-[#7a6d63]">
          Showing <span className="font-bold text-[#1c1510]">{startItem}</span> to{" "}
          <span className="font-bold text-[#1c1510]">{endItem}</span> of{" "}
          <span className="font-bold text-[#1c1510]">{totalItems}</span> Orders
        </span>
        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] border border-[#d8d0c8] bg-white text-[#8c7f73] hover:bg-[#faf7f4] hover:text-[#1c1510] active:scale-95 transition disabled:pointer-events-none disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>

          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1.5 text-[12px] font-semibold text-[#8c7f73]">
                ...
              </span>
            ) : (
              <button
                key={item}
                className={
                  item === currentPage
                    ? "flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-[6px] bg-[#d96e39] px-2 text-[12px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] transition active:scale-95"
                    : "flex h-8 min-w-[32px] cursor-pointer items-center justify-center rounded-[6px] bg-transparent px-2 text-[12px] font-semibold text-[#8c7f73] hover:bg-[#faf7f4] hover:text-[#1c1510] transition active:scale-95"
                }
                onClick={() => onPageChange(item)}
                type="button"
              >
                {item}
              </button>
            ),
          )}

          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-[6px] border border-[#d8d0c8] bg-white text-[#8c7f73] hover:bg-[#faf7f4] hover:text-[#1c1510] active:scale-95 transition disabled:pointer-events-none disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
