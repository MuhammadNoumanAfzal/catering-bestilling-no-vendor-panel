export default function CreateMenuSectionCard({
  children,
  className = "",
  description,
  title,
}) {
  return (
    <section
      className={`rounded-[14px] border border-[#ddd4cb] bg-white px-4 py-4 shadow-[0_2px_10px_rgba(43,30,20,0.03)] ${className}`}
    >
      <header className="mb-3">
        <h2 className="m-0 text-[21px] font-extrabold text-[#17120e]">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] font-medium text-[#8b7f74]">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
