import AppFooter from "../../../app/components/AppFooter";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-white">
      <div className="w-full">
        <section className="relative min-h-screen overflow-hidden bg-[#f8f5ef]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.44), rgba(255,255,255,0.44)), url("/heroBg.webp")',
            }}
          />

          <div className="relative z-[1] flex min-h-[calc(100vh-90px)] flex-col items-center justify-center gap-[22px] px-4 pb-[118px] pt-8 max-[720px]:min-h-0 max-[720px]:pb-[140px]">
            <img
              className="h-auto w-[clamp(120px,18vw,178px)]"
              src="/logo.png"
              alt="Catering bestilling.no"
            />
            {children}
          </div>

          <AppFooter overlay />
        </section>
      </div>
    </main>
  );
}
