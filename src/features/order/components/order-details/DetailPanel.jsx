export default function DetailPanel({ title, titleIcon: TitleIcon, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-[#ddd4cb] bg-white p-2.5 shadow-[0_1px_4px_rgba(38,23,14,0.05)] ${className}`.trim()}
    >
      <div className="mb-2 flex items-center gap-1.5">
        {TitleIcon ? <TitleIcon className="text-[#d46b39]" size={24} strokeWidth={2.1} /> : null}
        <h2 className="text-[22px] font-extrabold tracking-tight leading-[1.1] text-[#1b1510]">{title}</h2>
      </div>
      {children}
    </section>
  );
}


