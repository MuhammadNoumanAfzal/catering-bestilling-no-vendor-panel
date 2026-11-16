import { ag, useAgreementLanguage, agreementDate } from "./agreementTranslations.js";
import { FileCheck2, Download, RefreshCw } from "lucide-react";
import { statusLabel} from "./agreementModel";
export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#ca6838] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b9562b] disabled:cursor-not-allowed disabled:opacity-40";
export const inputClass =
  "mt-1 w-full rounded-xl border border-[#dfd5cc] bg-white px-3 py-2.5 text-sm text-[#342b24] outline-none focus:border-[#ca6838] focus:ring-2 focus:ring-orange-100";
export function StatusBadge({ status }) {
  useAgreementLanguage();
  return (
    <span
      className={
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
        (status === "ACTIVE"
          ? "bg-green-50 text-green-800"
          : status === "REJECTED" || status === "REVOKED"
            ? "bg-red-50 text-red-800"
            : "bg-amber-50 text-amber-900")
      }
    >
      {ag(statusLabel(status))}
    </span>
  );
}
export function ServiceNotice() {
  useAgreementLanguage();
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
      <h2 className="font-semibold">{ag("Vendor Agreement is not available yet")}</h2>
      <p className="mt-2 leading-6">{ag("GoCatering is setting up the agreement service. Your contract, signing link and approval status will appear here when it is ready. No agreement has been signed through this page.")}</p>
      <a
        className="mt-3 inline-block underline"
        href="mailto:support@gocatering.no"
      >{ag("Contact GoCatering")}</a>
    </div>
  );
}
export function ErrorNotice({ message, retry }) {
  useAgreementLanguage();
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
    >
      <p>{ag(message)}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="mt-2 inline-flex items-center gap-2 font-semibold underline"
        >
          <RefreshCw size={14} />{ag("Try again")}</button>
      )}
    </div>
  );
}
export function AgreementHeader({ agreement, title = ag("Vendor Agreement") }) {
  useAgreementLanguage();
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#a76642]">
          <FileCheck2 size={16} />{ag("GoCatering agreements")}</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#302923]">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[#7d7066]">{ag("Read, sign and keep track of your agreement in one place.")}</p>
      </div>
      {agreement && <StatusBadge status={agreement.status} />}
    </header>
  );
}
export function DocumentButton({
  children = ag("Download PDF"),
  onClick,
  disabled,
}) {
  useAgreementLanguage();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfd5cc] bg-white px-4 py-2.5 text-sm font-medium text-[#655143] hover:bg-[#faf6f2] disabled:opacity-40"
    >
      <Download size={16} />
      {children}
    </button>
  );
}
export function AgreementText({ agreement }) {
  useAgreementLanguage();
  return (
    <article className="agreement-contract min-w-0 rounded-2xl border border-[#e7dfd7] bg-white p-6 sm:p-8">
      <p className="text-xs uppercase tracking-widest text-[#9c806a]">{ag("Version")}{agreement.version}
      </p>
      <h2 className="mt-3 text-2xl font-bold text-[#302923]">
        {agreement.title}
      </h2>
      <p className="mt-2 text-sm text-[#7d7066]">
        {agreement.companyName}{" " + ag("/ Org. no.") + " "}{agreement.organisationNumber}
      </p>
      {agreement.bodySections?.length ? (
        agreement.bodySections.map((section, i) => (
          <section id={"agreement-clause-" + i} key={i} className="mt-7 border-t border-[#eee7df] pt-6">
            <h3 className="font-semibold text-[#47392e]">{section.heading}</h3>
            {section.paragraphs.map((text, j) => (
              <p
                key={j}
                className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-[#75685d]"
              >
                {text}
              </p>
            ))}
          </section>
        ))
      ) : (
        <p className="mt-6 text-sm text-red-700">{ag("Contract text is unavailable. Download the PDF to review it before signing.")}</p>
      )}
    </article>
  );
}
export function AgreementTimeline({ agreement }) {
  useAgreementLanguage();
  return (
    <section className="agreement-audit rounded-2xl border border-[#e7dfd7] bg-white p-6">
      <h2 className="font-semibold">{ag("Agreement progress")}</h2>
      <ol className="mt-4 divide-y divide-[#eee7df]">
        {(agreement.events || []).map((event) => (
          <li
            key={event.id}
            className="flex flex-wrap justify-between gap-2 py-3 text-sm"
          >
            <span>{event.label}</span>
            <time className="text-xs text-[#8d7a69]">
              {agreementDate(event.createdAt)}
            </time>
          </li>
        ))}
      </ol>
    </section>
  );
}
