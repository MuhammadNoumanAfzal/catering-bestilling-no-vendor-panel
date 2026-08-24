import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function StatusBadge({ status }) {
  const normalized = `${status || ""}`.toUpperCase();
  const tone =
    normalized === "PAID"
      ? "bg-[#edf9ef] text-[#38a657]"
      : normalized === "RELEASED"
        ? "bg-[#eef4ff] text-[#3b70a6]"
        : "bg-[#fff4dd] text-[#d8a12f]";

  return (
    <span
      className={`inline-flex min-h-[22px] items-center justify-center rounded-full px-[11px] text-[12px] font-bold ${tone}`}
    >
      {status}
    </span>
  );
}

function PayoutDetailModal({ payout, onClose }) {
  if (!payout) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-[460px] rounded-[20px] border border-[#e8dfd5] bg-[#fffdfa] p-5 shadow-[0_20px_50px_rgba(58,40,25,0.18)]">
        <div className="relative -mx-5 -mt-5 rounded-t-[20px] bg-gradient-to-r from-[#cf6e38] to-[#e78c58] px-5 py-4 text-white shadow-sm">
          <span className="text-[12px] font-bold uppercase tracking-wider text-white/80">
            Catering bestilling.no
          </span>
          <h2 className="mt-1 text-[20px] font-extrabold text-white">
            {payout.payoutNumber || payout.payoutId}
          </h2>
          <button
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/25 focus:outline-none active:scale-90"
            onClick={onClose}
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-start justify-between gap-4 border-b border-[#f2ece6] pb-3">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#9a8f85]">
                Linked invoice
              </p>
              <strong className="mt-1 block text-[16px] font-extrabold text-[#1c1510]">
                {payout.invoiceNumber || "--"}
              </strong>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#9a8f85]">
                Payout status
              </span>
              <div className="mt-1">
                <StatusBadge status={payout.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#d6e4f0] bg-[#f0f4f8] p-3 text-center">
              <span className="block text-[12px] font-extrabold uppercase tracking-wide text-[#3b70a6]">
                Updated
              </span>
              <span className="mt-1 block text-[14px] font-extrabold text-[#3b70a6]">
                {payout.eventDate || "--"}
              </span>
            </div>
            <div className="rounded-xl border border-[#d8ecd5] bg-[#f3fbf1] p-3 text-center">
              <span className="block text-[12px] font-extrabold uppercase tracking-wide text-[#2f8a4f]">
                Vendor receives
              </span>
              <span className="mt-1 block text-[14px] font-extrabold text-[#237a39]">
                {payout.netAmount || "--"}
              </span>
            </div>
          </div>

          <div className="rounded-[16px] border border-[#f0e5dd] bg-[#fffaf6] p-4">
            <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-[#9a8f85]">
              Payout summary
            </h3>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between text-[14px]">
                <span className="font-semibold text-[#6f6358]">Platform commission</span>
                <span className="font-extrabold text-[#cf6e38]">
                  {payout.commissionAmount || "--"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[14px]">
                <span className="font-semibold text-[#6f6358]">Transfer reference</span>
                <span className="font-bold text-[#1c1510]">
                  {payout.payoutReference || "Not added yet"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[14px]">
                <span className="font-semibold text-[#6f6358]">Payout ID</span>
                <span className="font-bold text-[#1c1510]">
                  {payout.payoutId || "--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end border-t border-[#f2ece6] pt-3">
          <button
            className="h-[38px] rounded-lg bg-[#cf6e38] px-4 text-[14px] font-bold text-white transition hover:bg-[#bf622f] active:scale-95"
            onClick={onClose}
            type="button"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinancePayoutsTable({
  currentPage,
  isLoading = false,
  onPageChange,
  onRequestDetail,
  pageSize,
  rows = [],
  totalItems = 0,
  totalPages = 1,
}) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    function handleOutsideClick() {
      setOpenDropdownId(null);
    }

    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  function handleToggleDropdown(rowUniqueId) {
    setOpenDropdownId((current) => (current === rowUniqueId ? null : rowUniqueId));
  }

  async function handleViewDetail(row) {
    setIsDetailLoading(true);
    const detail = await onRequestDetail(row.id).catch(() => row);
    setSelectedPayout(detail || row);
    setIsDetailLoading(false);
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
      <div className="border-b border-[#eee7df] px-4 py-4">
        <h3 className="text-[20px] font-extrabold text-[#1c1510]">Payout Activity</h3>
        <p className="mt-1 text-[14px] leading-6 text-[#7a6d63]">
          Track what is pending, released by admin, and fully paid into your bank account.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse">
          <thead>
            <tr className="border-b border-[#ede5de] text-left">
              {[
                "Sr.",
                "Payout",
                "Invoice",
                "Updated",
                "Vendor Receives",
                "Commission",
                "Status",
                "Reference",
                "",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-[#eee7df] px-[10px] py-3 text-left text-[15px] font-extrabold text-[#17120e]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && !rows.length ? (
              <tr>
                <td
                  className="px-[10px] py-8 text-center text-[15px] font-semibold text-[#8b7d72]"
                  colSpan={9}
                >
                  Loading payout activity...
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row, index) => (
                <tr key={`${row.id}-${index}`} className="border-b border-[#f2ece6] last:border-b-0">
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-extrabold text-[#17120e]">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[16px] font-extrabold text-[#1c1510]">
                    {row.payoutNumber || row.payoutId || "--"}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-semibold text-[#5f534c]">
                    {row.invoiceNumber || "--"}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-semibold text-[#75695f]">
                    {row.eventDate || "--"}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-extrabold text-[#17120e]">
                    {row.netAmount || "--"}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-semibold text-[#cf6e38]">
                    {row.commissionAmount || "--"}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3">
                    <StatusBadge status={row.paymentStatus} />
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[14px] font-semibold text-[#75695f]">
                    {row.payoutReference || "--"}
                  </td>
                  <td className="relative border-b border-[#eee7df] px-[10px] py-3 text-[16px]">
                    <button
                      className="cursor-pointer font-bold tracking-[0.2em] text-[#6f6358] transition hover:text-[#cf6e38] focus:outline-none active:scale-90"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleToggleDropdown(`${row.id}-${index}`);
                      }}
                      type="button"
                    >
                      ...
                    </button>

                    {openDropdownId === `${row.id}-${index}` ? (
                      <div className="absolute right-2.5 top-[38px] z-10 w-28 rounded-lg border border-[#e4d9cf] bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                        <button
                          className="w-full rounded-md px-2.5 py-1.5 text-left text-[13px] font-semibold text-[#17120e] transition hover:bg-[#fff7f2] hover:text-[#cf6e38] focus:outline-none"
                          onClick={() => handleViewDetail(row)}
                          type="button"
                        >
                          View Detail
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-[10px] py-8 text-center text-[15px] font-semibold text-[#8b7d72]"
                  colSpan={9}
                >
                  No payout activity found in the selected range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 px-4 py-3.5 max-[860px]:flex-col max-[860px]:items-center max-[860px]:text-center">
        <span className="text-[14px] font-medium text-[#7a6d63]">
          Showing <span className="font-bold text-[#1c1510]">{startItem}</span> to{" "}
          <span className="font-bold text-[#1c1510]">{endItem}</span> of{" "}
          <span className="font-bold text-[#1c1510]">{totalItems}</span> payout records
        </span>

        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d8d0c8] bg-white text-[#8c7f73] transition hover:bg-[#faf7f4] hover:text-[#1c1510] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            <ChevronLeft size={16} />
          </button>

          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1.5 text-[13px] font-semibold text-[#8c7f73]">
                ...
              </span>
            ) : (
              <button
                key={item}
                className={
                  item === currentPage
                    ? "flex h-8 min-w-[32px] items-center justify-center rounded-[6px] bg-[#d96e39] px-2 text-[13px] font-extrabold text-white shadow-[0_2px_6px_rgba(217,110,57,0.18)] transition active:scale-95"
                    : "flex h-8 min-w-[32px] items-center justify-center rounded-[6px] bg-transparent px-2 text-[13px] font-semibold text-[#8c7f73] transition hover:bg-[#faf7f4] hover:text-[#1c1510] active:scale-95"
                }
                onClick={() => onPageChange(item)}
                type="button"
              >
                {item}
              </button>
            ),
          )}

          <button
            className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#d8d0c8] bg-white text-[#8c7f73] transition hover:bg-[#faf7f4] hover:text-[#1c1510] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {selectedPayout ? (
        <PayoutDetailModal
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
        />
      ) : null}

      {isDetailLoading ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 text-[14px] font-semibold text-white">
          Loading payout details...
        </div>
      ) : null}
    </section>
  );
}
