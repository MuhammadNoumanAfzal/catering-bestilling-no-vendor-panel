export default function DetailPanel({ title, titleIcon: TitleIcon, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-[#ddd4cb] bg-white p-3 shadow-[0_1px_4px_rgba(38,23,14,0.05)] ${className}`.trim()}
    >
      <div className="mb-[10px] flex items-center gap-1.5">
        {TitleIcon ? <TitleIcon className="text-[#d46b39]" size={28} strokeWidth={2.1} /> : null}
        <h2 className="text-2xl font-extrabold leading-[1.15] text-[#1b1510]">{title}</h2>
      </div>
      {children}
    </section>
  );
}
