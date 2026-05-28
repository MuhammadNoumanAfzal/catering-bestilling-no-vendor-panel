export default function FinancePageHeader() {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="type-h2 m-0 text-[#15110f]">Finance &amp; Earnings</h1>
        <p className="type-para mt-1 text-[#746a62]">
          Track your income and financial performance.
        </p>
      </div>
      <button
        className="cursor-pointer rounded-[8px] border border-[#d9d1c9] bg-white px-3 py-2 text-[11px] font-semibold text-[#4f433a]"
        type="button"
      >
        Last 7.0 days
      </button>
    </header>
  );
}
