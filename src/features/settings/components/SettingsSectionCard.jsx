export default function SettingsSectionCard({
  title,
  description,
  children,
  tone = "default",
}) {
  const toneClasses =
    tone === "danger"
      ? "border-[#efcfc7] bg-[#fffaf8]"
      : "border-[#ddd5ce] bg-white";

  return (
    <section
      className={`rounded-[12px] border px-4 py-4 shadow-[0_3px_10px_rgba(43,30,20,0.04)] ${toneClasses}`}
    >
      <header className="mb-3">
        <h2 className="type-h4 m-0 text-[#181310]">{title}</h2>
        {description ? (
          <p className="type-subpara mt-1 text-[#94867a]">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
