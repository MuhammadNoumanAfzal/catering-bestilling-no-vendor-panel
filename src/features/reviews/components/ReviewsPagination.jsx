export default function ReviewsPagination({
  currentPage,
  onPageChange,
  pageSize,
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
    <div className="flex items-center justify-between gap-3 max-[760px]:flex-col max-[760px]:items-start">
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
  );
}
