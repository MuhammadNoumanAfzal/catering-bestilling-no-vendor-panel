import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Help Center", to: "/help-center" },
];

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

          <footer className="absolute inset-x-0 bottom-0 z-[1] flex items-center justify-between gap-3 bg-transparent px-5 py-3 max-[720px]:flex-col max-[720px]:items-start">
            <p className="type-h5 m-0 text-[#2f241d] [text-shadow:0_1px_10px_rgba(255,255,255,0.85)]">
              &copy;2026 Cateringbestilling. All rights reserved
            </p>

            <nav
              className="flex items-center gap-[18px] max-[720px]:flex-wrap max-[720px]:gap-3"
              aria-label="Footer links"
            >
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  className="type-h5 text-[#2f241d] no-underline [text-shadow:0_1px_10px_rgba(255,255,255,0.85)] hover:underline"
                  to={link.to}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </footer>
        </section>
      </div>
    </main>
  );
}
