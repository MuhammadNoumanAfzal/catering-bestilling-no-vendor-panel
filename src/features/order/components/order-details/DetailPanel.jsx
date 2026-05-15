export default function DetailPanel({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-lg border border-[#ddd4cb] bg-white p-3 shadow-[0_1px_4px_rgba(38,23,14,0.05)] ${className}`.trim()}
    >
      <h2 className="mb-[10px] text-2xl font-extrabold leading-[1.15] text-[#1b1510]">{title}</h2>
      {children}
    </section>
  );
}
