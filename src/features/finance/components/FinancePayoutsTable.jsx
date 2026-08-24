function StatusBadge({ status }) {
  const normalized = `${status || ""}`.toUpperCase();
  const tone =
    normalized === "PAID"
      ? "bg-[#edf9ef] text-[#38a657]"
      : normalized === "RELEASED"
        ? "bg-[#eef4ff] text-[#3b70a6]"
        : "bg-[#fff4dd] text-[#d8a12f]";

  return (
    <span className={`inline-flex min-h-[22px] items-center justify-center rounded-full px-[11px] text-[12px] font-bold ${tone}`}>
      {status}
    </span>
  );
}

export default function FinancePayoutsTable({ rows = [] }) {
  return (
    <section className="mt-4 rounded-[12px] border border-[#ddd5ce] bg-white shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div className="border-b border-[#eee7df] px-4 py-4">
        <h3 className="text-[20px] font-extrabold text-[#1c1510]">Recent Payout Activity</h3>
        <p className="mt-1 text-[14px] leading-6 text-[#7a6d63]">
          Track released and paid vendor payouts separately from customer invoices.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead>
            <tr className="border-b border-[#ede5de] text-left">
              {["Payout", "Invoice", "Updated", "Vendor Receives", "Commission", "Status", "Reference"].map((heading) => (
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
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-[#f2ece6] last:border-b-0">
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-extrabold text-[#1c1510]">
                    {row.payoutNumber || row.payoutId || "--"}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-semibold text-[#5f534c]">
                    {row.invoiceNumber || "--"}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-semibold text-[#75695f]">
                    {row.eventDate || "--"}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-extrabold text-[#17120e]">
                    {row.netAmount}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[15px] font-semibold text-[#cf6e38]">
                    {row.commissionAmount}
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3">
                    <StatusBadge status={row.paymentStatus} />
                  </td>
                  <td className="border-b border-[#eee7df] px-[10px] py-3 text-[14px] font-semibold text-[#75695f]">
                    {row.payoutReference || "--"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-[10px] py-8 text-center text-[15px] font-semibold text-[#8b7d72]"
                  colSpan={7}
                >
                  No payout activity found in the selected range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
