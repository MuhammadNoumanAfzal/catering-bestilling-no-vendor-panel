export default function DeliverySectionCard({ title, description, children }) {
  return (
    <section className="rounded-[12px] border border-[#d9d1c9] bg-white px-4 py-4 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <header className="mb-3">
        <h2 className="type-h5 m-0 text-[#181310]">{title}</h2>
        <p className="type-para mt-1 text-[#94867a]">{description}</p>
      </header>
      {children}
    </section>
  );
}
