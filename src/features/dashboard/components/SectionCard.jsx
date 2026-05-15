export default function SectionCard({ title, actionLabel, badgeCount, children }) {
  return (
    <section className="rounded-[10px] border border-[#e8e2da] bg-white px-[10px] pb-3 pt-2.5 shadow-[0_1px_2px_rgba(38,23,14,0.08),0_6px_14px_rgba(38,23,14,0.06)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h2 className="type-h5 m-0 text-[#1c1510]">{title}</h2>
          {badgeCount ? (
            <span className="type-subpara inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#d94032] px-[5px] text-[10px] text-white">
              {badgeCount}
            </span>
          ) : null}
        </div>
        {actionLabel ? (
          <button className="type-subpara border-0 bg-transparent p-0 text-[#3f78d4]" type="button">
            {actionLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}
