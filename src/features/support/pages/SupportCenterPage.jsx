import { Link, useLocation } from "react-router-dom";
import SupportTicketForm from "../components/SupportTicketForm";
import { useTranslation } from "react-i18next";

export default function SupportCenterPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const initialForm = location.state?.initialSupportForm || null;

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="type-h2 m-0 text-[#15110f]">{t("support.title", { defaultValue: "Support Center" })}</h1>
          <p className="type-para mt-1 text-[#746a62]">
            {t("support.subtitle", { defaultValue: "We’re here to help. Find answers or get in touch with our team." })}
          </p>
        </div>

        <Link
          className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] border border-[#cf6e38] bg-[#cf6e38] px-5 text-[14px] font-bold text-white no-underline shadow-sm transition hover:bg-[#b85d2b] hover:border-[#b85d2b] active:scale-[0.98]"
          to="/support/responses"
        >
          Vis innboks
        </Link>
      </header>

      <SupportTicketForm initialForm={initialForm} />
    </section>
  );
}
