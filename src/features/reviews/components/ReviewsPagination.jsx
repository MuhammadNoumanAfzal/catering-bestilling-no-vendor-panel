import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <div className="flex items-center justify-between gap-4 px-4 py-3.5 max-[760px]:flex-col max-[760px]:items-center max-[760px]:text-center">
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
  );
}
