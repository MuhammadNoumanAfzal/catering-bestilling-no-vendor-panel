import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OrderPagination({
  currentPage,
  onPageChange,
  pageSize,
  totalItems,
  totalPages,
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex items-center justify-between gap-3 max-[960px]:flex-col max-[960px]:items-start">
      <p className="m-0 text-[12px] font-extrabold text-[#17120e]">
        Showing {startItem} - {endItem} of {totalItems} Orders
      </p>
      <div className="flex items-center gap-1.5">
        <button
          className="flex h-5 min-w-5 items-center justify-center rounded border border-[#d9d1c8] bg-white text-[#3a3029] disabled:cursor-not-allowed disabled:opacity-45"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
        >
          <ChevronLeft size={12} />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            className={`h-5 min-w-5 rounded border text-[10px] ${
              currentPage === page
                ? "border-[#cf6e38] bg-[#cf6e38] text-white"
                : "border-[#d9d1c8] bg-white text-[#3a3029]"
            }`}
            onClick={() => onPageChange(page)}
            type="button"
          >
            {page}
          </button>
        ))}
        <button
          className="flex h-5 min-w-5 items-center justify-center rounded border border-[#d9d1c8] bg-white text-[#3a3029] disabled:cursor-not-allowed disabled:opacity-45"
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
