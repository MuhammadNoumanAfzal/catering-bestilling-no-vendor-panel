export default function AuthLayout({ children }) {
  return <main className="min-h-screen bg-[#30231b]">
    <section className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center" style={{backgroundImage:'url("/heroBg.webp")'}} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{background:'linear-gradient(135deg, rgba(35,25,18,0.72), rgba(65,38,22,0.60))'}} />
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-8 sm:py-10">
        <div className="px-5 py-3">
          <div className="relative h-[88px] w-[230px] overflow-hidden">
            <img className="absolute left-1/2 top-[66%] h-[270px] w-[270px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain" src="/logo (2).png" alt="GoCatering" />
          </div>
        </div>
        {children}
      </div>
    </section>
  </main>;
}
