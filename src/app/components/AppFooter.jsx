import { Link } from "react-router-dom";
import { HelpCircle, FileText, Shield, Sparkles } from "lucide-react";

const footerLinks = [
  { label: "Privacy Policy", to: "/privacy-policy", icon: Shield },
  { label: "Terms of Service", to: "/terms-of-service", icon: FileText },
  { label: "Help Center", to: "/help-center", icon: HelpCircle },
];

export default function AppFooter({ overlay = false }) {
  return (
    <footer
      className={`mx-5 mb-5 mt-0 flex items-center justify-between gap-6 px-6 py-4 transition-all duration-300 rounded-2xl border max-[720px]:mx-[14px] max-[720px]:mb-[14px] ${
        overlay
          ? "absolute bottom-4 left-0 right-0 z-10 m-4 border-white/25 bg-white/30 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-[960px]:relative max-[960px]:m-4 max-[960px]:bottom-0"
          : "border-[#e6ddd4]/80 bg-white/60 backdrop-blur-md shadow-[0_4px_20px_rgba(38,23,14,0.03)]"
      } max-[768px]:flex-col max-[768px]:items-center max-[768px]:gap-4 max-[768px]:px-5 max-[768px]:py-5`}
    >
      {/* Copyright and Brand */}
      <div className="flex items-center gap-2 max-[768px]:text-center">
        <Sparkles
          className={overlay ? "text-[#d86c3d]" : "text-[#cf6e38] animate-pulse"}
          size={14}
        />
        <p
          className={`m-0 text-[12px] font-semibold tracking-wide ${
            overlay ? "text-[#2f241d]" : "text-[#2f241d]/90"
          }`}
        >
          &copy; {new Date().getFullYear()} <span className="font-bold">Cateringbestilling</span>. All rights reserved.
        </p>
      </div>

      {/* System Live Status */}
      {!overlay && (
        <div className="flex items-center gap-2 rounded-full border border-[#c7ebcf] bg-[#e7f8ea]/80 px-3 py-1 shadow-[inset_0_1px_2px_rgba(35,122,57,0.05)] max-[768px]:order-last">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#237a39] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#237a39]"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#237a39]">
            Systems Operational
          </span>
        </div>
      )}

      {/* Links Navigation */}
      <nav
        className="flex items-center gap-6 max-[768px]:flex-wrap max-[768px]:justify-center max-[768px]:gap-4"
        aria-label="Footer navigation"
      >
        {footerLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.label}
              className={`group flex items-center gap-1.5 text-[12px] font-bold no-underline transition duration-200 ${
                overlay
                  ? "text-[#2f241d] hover:text-[#d86c3d]"
                  : "text-[#53463e] hover:text-[#cf6e38]"
              }`}
              to={link.to}
            >
              <Icon
                size={13}
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  overlay
                    ? "text-[#2f241d]/60 group-hover:text-[#d86c3d]"
                    : "text-[#a69486] group-hover:text-[#cf6e38]"
                }`}
              />
              <span className="relative py-0.5">
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 h-[1.5px] w-0 bg-current transition-all duration-200 group-hover:w-full ${
                    overlay ? "bg-[#d86c3d]" : "bg-[#cf6e38]"
                  }`}
                />
              </span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
