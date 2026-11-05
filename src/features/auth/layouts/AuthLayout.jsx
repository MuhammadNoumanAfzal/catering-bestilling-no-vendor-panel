export default function AuthLayout({ children }) {
  return (
    <main className="min-h-dvh bg-[#f4eee7]">
      <section
        className="relative isolate min-h-dvh"
        style={{
          backgroundImage:
            'url("/heroBg.webp")',
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/60" />
        <div className="relative z-[1] flex min-h-dvh flex-col items-center justify-center gap-0 px-4 py-4 sm:py-5">
          <img
            className="-mb-12 -mt-6 h-48 w-auto max-w-full shrink-0 object-contain sm:h-56"
            src="/logo (2).png"
            alt="Go Catering"
          />
          {children}
        </div>
      </section>
    </main>
  );
}
