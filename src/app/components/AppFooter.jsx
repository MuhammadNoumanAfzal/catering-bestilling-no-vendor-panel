import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Help Center", to: "/help-center" },
];

export default function AppFooter({ overlay = false }) {
  return (
    <footer
      className={`flex items-center justify-between gap-4 px-5 py-3 max-[720px]:flex-col max-[720px]:items-start ${
        overlay
          ? "absolute inset-x-0 bottom-0 z-[1] bg-transparent"
          : "border-t border-[#e6ddd4] bg-[#fffdf9]"
      }`}
    >
      <p
        className={`m-0 text-[11px] font-semibold ${
          overlay
            ? "text-[#2f241d] [text-shadow:0_1px_10px_rgba(255,255,255,0.85)]"
            : "text-[#1d1612]"
        }`}
      >
        &copy;2026 Cateringbestilling All rights reserved
      </p>

      <nav
        className="flex items-center gap-5 max-[720px]:flex-wrap max-[720px]:gap-3"
        aria-label="Footer links"
      >
        {footerLinks.map((link) => (
          <Link
            key={link.label}
            className={`text-[11px] font-semibold no-underline transition hover:underline ${
              overlay
                ? "text-[#2f241d] [text-shadow:0_1px_10px_rgba(255,255,255,0.85)]"
                : "text-[#1d1612]"
            }`}
            to={link.to}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
