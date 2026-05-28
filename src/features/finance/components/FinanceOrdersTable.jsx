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

      <div className="flex items-center justify-between gap-3 px-3 py-3 max-[860px]:flex-col max-[860px]:items-start">
        <span className="type-subpara text-[#7a6d63]">
          Showing {startItem} to {endItem} of {totalItems} Orders
        </span>
        <div className="flex items-center gap-1.5">
          <button
            className="flex h-5 w-5 items-center justify-center rounded-[3px] border border-[#d8d0c8] bg-white text-[10px] font-bold text-[#8c7f73] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            &lt;
          </button>

          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-[10px] font-semibold text-[#8c7f73]">
                ...
              </span>
            ) : (
              <button
                key={item}
                className={
                  item === currentPage
                    ? "flex h-5 min-w-[20px] items-center justify-center rounded-[3px] bg-[#e36f3a] px-1.5 text-[10px] font-bold text-white"
                    : "flex h-5 min-w-[20px] items-center justify-center rounded-[3px] bg-transparent px-1.5 text-[10px] font-semibold text-[#8c7f73]"
                }
                onClick={() => onPageChange(item)}
                type="button"
              >
                {item}
              </button>
            ),
          )}

          <button
            className="flex h-5 w-5 items-center justify-center rounded-[3px] border border-[#d8d0c8] bg-white text-[10px] font-bold text-[#8c7f73] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            &gt;
          </button>
        </div>
      </div>
    </section>
  );
}
