import { ag, useAgreementLanguage, agreementDate } from "./agreementTranslations.js";
import { Link } from "react-router-dom";
import "./VendorAgreementPage.css";
import { FileText, PenLine, ShieldCheck, Store, Check, ArrowDown, RefreshCw, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useAgreement } from "./agreementContext";
import { agreementRequest, downloadAgreement } from "./agreementApi";
import { canSign, canGoLive} from "./agreementModel";
import {
  AgreementHeader,
  AgreementText,
  AgreementTimeline,
  DocumentButton,
  ErrorNotice,
  ServiceNotice,
  buttonClass,
} from "./AgreementUi";
import SignAgreementDialog from "./SignAgreementDialog";
export default function VendorAgreementPage() {
  useAgreementLanguage();
  const { agreement, loading, error, refresh, enabled } = useAgreement();
  const [signing, setSigning] = useState(false),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState(""),
    [notice, setNotice] = useState("");
  const pending = useRef(false);
  async function action(callback) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setActionError("");
    try {
      await callback();
    } catch (e) {
      setActionError(e.message);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  async function goLive() {
    await agreementRequest("live", {
      input: {
        agreementId: agreement.id,
        revision: agreement.revision,
        idempotencyKey: crypto.randomUUID(),
      },
    });
    setNotice(ag("Your store activation was confirmed by the server."));
    await refresh();
  }
  return (
    <div className="vendor-agreement-page mx-auto max-w-6xl pb-8">
      <div className="agreement-hero"><div><span className="agreement-eyebrow"><ShieldCheck size={16} />{" " + ag("YOUR PARTNERSHIP WITH GOCATERING")}</span><AgreementHeader agreement={agreement} /></div><div className="agreement-hero-mark" aria-hidden="true"><FileText size={46} strokeWidth={1.3} /><span>{ag("Read. Sign. Get ready.")}</span></div></div>
      {!enabled ? (
        <ServiceNotice />
      ) : loading ? (
        <p role="status">{ag("Loading your agreement...")}</p>
      ) : error ? (
        <ErrorNotice message={error} retry={refresh} />
      ) : agreement ? (
        <>
          <ol className="agreement-steps" aria-label={ag("Agreement stages")}>{[
 {label:ag("Review contract"), hint:ag("Read the complete agreement"), icon:FileText, done:Boolean(agreement.signedAt)},
 {label:ag("Your signature"), hint:ag("Name, consent and email code"), icon:PenLine, done:Boolean(agreement.signedAt)},
 {label:ag("Admin approval"), hint:ag("Company and authority review"), icon:ShieldCheck, done:agreement.status === "ACTIVE", rejected:agreement.status === "REJECTED"},
 {label:ag("Ready to go live"), hint:ag("Complete all onboarding checks"), icon:Store, done:canGoLive(agreement)},
].map((step, index) => <li key={step.label} className={step.rejected ? "is-rejected" : step.done ? "is-complete" : ""}><span className="agreement-step-icon">{step.rejected ? <AlertCircle size={18}/> : step.done ? <Check size={18}/> : <step.icon size={18}/>}</span><div><strong>{step.label}</strong><span>{step.hint}</span></div><small>{String(index+1).padStart(2,"0")}</small></li>)}</ol>
          <div className="agreement-status-strip mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8dfd5] bg-white p-4">
            <p className="text-sm text-[#786454]">
              {agreement.status === "ACTIVE"
                ? ag("Your agreement is active. Other onboarding requirements still apply.")
                : agreement.status === "PENDING_APPROVAL"
                  ? ag("Thank you. Your signed agreement has been submitted for review.")
                  : agreement.status === "REJECTED"
                    ? ag("Your agreement needs attention from GoCatering before you can sign again.")
                    : ag("Review the complete contract before signing.")}
            </p>
            <button
              type="button"
              onClick={refresh}
              className="agreement-refresh text-sm"
            >
              <RefreshCw size={14}/>{ag("Refresh status")}</button>
          </div>
          {agreement.status === "PENDING_SIGNATURE" && !agreement.organisationNumber?.trim() && <div role="status" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>{ag("Complete your company details before signing")}</strong><p className="mt-1">{ag("Add a valid organisation number in business settings, then refresh this agreement.")}</p><Link to="/settings" className="mt-2 inline-block font-semibold underline">{ag("Update company details")}</Link></div>}
          {agreement.rejectionReason && (
            <div
              role="status"
              className="agreement-review-notice"
            ><span className="agreement-review-icon"><AlertCircle size={20}/></span><div><h2>{ag("Agreement requires an update")}</h2><p className="agreement-review-reason">{agreement.rejectionReason}</p><p>{ag("GoCatering must issue a new signing attempt before you can sign again.")}</p><a href="mailto:support@gocatering.no">{ag("Contact GoCatering")}</a></div></div>
          )}
          {actionError && <ErrorNotice message={actionError} />}
          {notice && (
            <p
              role="status"
              className="mb-4 rounded-xl bg-green-50 p-4 text-sm"
            >
              {ag(notice)}
            </p>
          )}
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-5">
              {agreement.bodySections?.length > 0 && <nav className="agreement-contents" aria-label={ag("Contract contents")}><div><span className="agreement-eyebrow">{ag("IN THIS AGREEMENT")}</span><span>{agreement.bodySections.length}{" " + ag("sections") + " "}<ArrowDown size={13}/></span></div><div className="agreement-contents-links">{agreement.bodySections.map((section,index)=><a key={index} href={"#agreement-clause-"+index}><span>{String(index+1).padStart(2,"0")}</span>{section.heading.replace(/^\d+[.)]\s*/, "")}</a>)}</div></nav>}
              <AgreementText agreement={agreement} />
              <AgreementTimeline agreement={agreement} />
            </div>
            <aside className="agreement-actions space-y-4 rounded-2xl border border-[#e7dfd7] bg-white p-5 lg:sticky lg:top-5">
              <span className="agreement-eyebrow">{ag("YOUR DOCUMENT")}</span><h2 className="font-semibold">{ag("Agreement details")}</h2>
              <table className="agreement-facts"><caption className="sr-only">{ag("Agreement details")}</caption><tbody>
<tr><th scope="row">{ag("Company")}</th><td>{agreement.companyName}</td></tr>
<tr><th scope="row">{ag("Version")}</th><td>{agreement.version}</td></tr>
<tr><th scope="row">{ag("Sent")}</th><td>{agreementDate(agreement.sentAt)}</td></tr>
<tr><th scope="row">{ag("Signed")}</th><td>{agreementDate(agreement.signedAt)}</td></tr>
{agreement.signer && <tr><th scope="row">{ag("Signed by")}</th><td>{agreement.signer.fullName}<br/>{agreement.signer.role}</td></tr>}
</tbody></table>
              <DocumentButton
                disabled={busy}
                onClick={() =>
                  action(() => downloadAgreement(agreement.id, "ORIGINAL"))
                }
              >{ag("Read / download contract")}</DocumentButton>
              {agreement.signedAt && (
                <DocumentButton
                  disabled={busy}
                  onClick={() =>
                    action(() =>
                      downloadAgreement(agreement.id, "VENDOR_SIGNED"),
                    )
                  }
                >{ag("Download signed copy")}</DocumentButton>
              )}
              {agreement.approvedAt && (
                <DocumentButton
                  disabled={busy}
                  onClick={() =>
                    action(() => downloadAgreement(agreement.id, "FINAL"))
                  }
                >{ag("Download final agreement")}</DocumentButton>
              )}
              {canSign(agreement) && (
                <button
                  className={buttonClass + " w-full"}
                  onClick={() => setSigning(true)}
                  disabled={busy}
                >{ag("Sign agreement")}</button>
              )}
              <button
                className={buttonClass + " w-full"}
                disabled={busy || !canGoLive(agreement)}
                onClick={() => action(goLive)}
              >{ag("Go live")}</button>
              <p className="text-xs leading-5 text-[#8b7766]">{ag("Going live is available only after agreement approval and completion of the server's onboarding checks.")}</p>
              <a
                href="mailto:support@gocatering.no"
                className="block text-xs underline"
              >{ag("Questions? Contact GoCatering")}</a>
            </aside>
          </div>
          {signing && (
            <SignAgreementDialog
              key={agreement.revision}
              agreement={agreement}
              onClose={() => setSigning(false)}
              onSigned={async () => {
                setNotice(
                  ag("Your signature was submitted. PDF creation and email delivery status are recorded in the progress log."),
                );
                await refresh();
              }}
            />
          )}
        </>
      ) : (
        <ErrorNotice
          message={ag("No agreement was returned. Contact GoCatering.")}
          retry={refresh}
        />
      )}
    </div>
  );
}
