export default function AppSectionPage({ title, description }) {
  return (
    <section className="grid min-h-[calc(100vh-128px)] place-items-center">
      <div className="w-full max-w-[620px] rounded-[18px] border border-[#e7ddd4] bg-[#fffdfb] p-7 shadow-[0_12px_22px_rgba(50,35,24,0.05)]">
        <p className="type-subpara m-0 text-[#7a6c61]">Shared app layout</p>
        <h1 className="type-h3 mb-3 mt-2.5 text-[#1c1510]">{title}</h1>
        <p className="type-para m-0 text-[#7a6c61]">{description}</p>
      </div>
    </section>
  );
}
