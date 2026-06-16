import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function TransactionDetailModal({ order, onClose }) {
  if (!order) return null;

  const [orderId, customer, event, date, total, commission, net, status] = order;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[420px] rounded-[18px] border border-[#e8dfd5] bg-[#fffdfa] p-5 shadow-[0_20px_50px_rgba(58,40,25,0.18)]">
        {/* Modal Header with beautiful color gradient */}
        <div className="relative -mx-5 -mt-5 rounded-t-[18px] bg-gradient-to-r from-[#cf6e38] to-[#e78c58] px-5 py-4 text-white shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
            Catering bestilling.no
          </span>
          <h2 className="m-0 text-[19px] font-extrabold mt-0.5 text-white">
            Order {orderId} Details
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/25 transition focus:outline-none active:scale-90"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-4 space-y-4">
          {/* Status and Customer */}
          <div className="flex items-center justify-between border-b border-[#f2ece6] pb-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9a8f85]">Customer</span>
              <strong className="text-[14px] text-[#1c1510] font-extrabold">{customer}</strong>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9a8f85]">Status</span>
              <span
                className={`inline-flex min-h-[22px] items-center justify-center rounded-full px-3 text-[11px] font-extrabold shadow-sm mt-0.5 ${
                  status === "Pending" ? "bg-[#fff4dd] text-[#d8a12f]" : "bg-[#edf9ef] text-[#38a657]"
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#ffefe5] border border-[#ffdcd0] p-3 text-center">
              <span className="block text-[10px] font-extrabold text-[#c85e2f] uppercase tracking-wide">Event Type</span>
              <span className="text-[13px] font-extrabold text-[#cf6e38] mt-1 block">{event}</span>
            </div>
            <div className="rounded-xl bg-[#f0f4f8] border border-[#d6e4f0] p-3 text-center">
              <span className="block text-[10px] font-extrabold text-[#3b70a6] uppercase tracking-wide">Event Date</span>
              <span className="text-[13px] font-extrabold text-[#3b70a6] mt-1 block">{date}</span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border-t border-[#f2ece6] pt-3">
            <h3 className="m-0 text-[11px] font-extrabold text-[#9a8f85] uppercase tracking-wider mb-2">
              Financial Breakdown
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[13px] px-1">
                <span className="font-semibold text-[#6f6358]">Total Charged</span>
                <span className="font-extrabold text-[#1c1510] text-[14px]">{total}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] px-1">
                <span className="font-semibold text-[#6f6358]">Platform Commission</span>
                <span className="font-bold text-[#de5f5f] bg-[#fff0f0] px-2 py-0.5 rounded-full text-[12px]">{commission}</span>
              </div>

              <div className="mt-3 bg-[#edf9ef] border border-[#c7ebd0] px-4 py-3 rounded-xl flex justify-between items-center shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#38a657]">Net Earnings</span>
                  <span className="text-[12px] font-medium text-[#4c8f59]">Transferred to Wallet</span>
                </div>
                <span className="text-[20px] font-extrabold text-[#237a39]">{net}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-[#f2ece6] flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="h-[38px] px-4 cursor-pointer rounded-lg bg-[#cf6e38] text-[13px] font-bold text-white hover:bg-[#bf622f] active:scale-95 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinanceOrdersTable({
  currentPage,
  onPageChange,
  pageSize,
  rows,
  totalItems,
  totalPages,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    function handleOutsideClick() {
      setOpenDropdownId(null);
    }
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  function handleToggleDropdown(rowUniqueId) {
    if (openDropdownId === rowUniqueId) {
      setOpenDropdownId(null);
    } else {
      setOpenDropdownId(rowUniqueId);
    }
  }

  function handleViewDetail(row) {
    setSelectedOrder(row);
    setOpenDropdownId(null);
  }

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
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[13px] font-semibold text-[#75695f]">
                    {row[3]}
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
                  <td className="relative border-b border-[#eee7df] px-[10px] py-3 text-[14px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDropdown(`${row[0]}-${index}`);
                      }}
                      className="cursor-pointer text-[#6f6358] hover:text-[#cf6e38] font-bold tracking-[0.2em] focus:outline-none transition active:scale-90"
                      type="button"
                    >
                      ...
                    </button>

                    {openDropdownId === `${row[0]}-${index}` && (
                      <div className="absolute right-2.5 top-[38px] z-10 w-28 rounded-lg border border-[#e4d9cf] bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                        <button
                          onClick={() => handleViewDetail(row)}
                          className="w-full text-left rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-[#17120e] hover:bg-[#fff7f2] hover:text-[#cf6e38] transition focus:outline-none"
                          type="button"
                        >
                          View Detail
                        </button>
                      </div>
                    )}
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

      {selectedOrder && (
        <TransactionDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}
