import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OrderPagination({
  currentPage,
  onPageChange,
  pageSize,
  totalItems,
  totalPages,
}) {
  function getVisiblePages() {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  }

  const visiblePages = getVisiblePages();
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-4 max-[720px]:flex-col max-[720px]:items-start">
      <p className="type-para m-0 text-[12px] text-[#2f2822]">
        Showing {startItem} - {endItem} of {totalItems} Orders
      </p>

      <div className="flex items-center gap-1.5 rounded-[8px] bg-white px-2 py-1 text-[#2f2822]">
        <button
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[3px] border border-[#d9d1c8] bg-white text-[#6c625a] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <ChevronLeft size={12} />
        </button>
        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-[10px] text-[#2f2822]"
            >
              ....
            </span>
          ) : (
            <button
              key={page}
              className={`h-9 min-w-9 rounded-[3px] cursor-pointer px-1 text-[10px] ${
                currentPage === page
                  ? "bg-[#cf6e38] text-white"
                  : "bg-transparent text-[#2f2822]"
              }`}
              onClick={() => onPageChange(page)}
              type="button"
            >
              {page}
            </button>
          ),
        )}
        <button
          className="flex cursor-pointer h-9 w-9 items-center justify-center rounded-[3px] border border-[#d9d1c8] bg-white text-[#6c625a] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
