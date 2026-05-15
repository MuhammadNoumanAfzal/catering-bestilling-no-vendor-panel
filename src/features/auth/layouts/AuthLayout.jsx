import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Help Center", to: "/help-center" },
];

export default function AuthLayout({ children }) {
  return (
    <main className="auth-page-shell">
      <div className="auth-frame">
        <section className="auth-stage">
          <div className="auth-background-layer" />

          <div className="auth-content">
            <img className="auth-logo" src="/logo.png" alt="Catering bestilling.no" />
            {children}
          </div>

          <footer className="auth-footer">
            <p className="auth-copyright type-h5">
              &copy;2026 Cateringbestilling. All rights reserved
            </p>

            <nav className="auth-footer-nav" aria-label="Footer links">
              {footerLinks.map((link) => (
                <Link key={link.label} className="auth-footer-link type-h5" to={link.to}>
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
