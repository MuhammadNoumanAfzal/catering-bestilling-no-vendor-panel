import { ag, useAgreementLanguage } from "./agreementTranslations.js";
import "./SignAgreementDialog.css";
import { useEffect, useRef, useState } from "react";
import { agreementRequest } from "./agreementApi";
import { buttonClass, inputClass, ErrorNotice } from "./AgreementUi";
import { canSign } from "./agreementModel";
import SignatureInput from "./SignatureInput";
export default function SignAgreementDialog({ agreement, onClose, onSigned }) {
  useAgreementLanguage();
  const dialog = useRef(null),
    sending = useRef(false);
  const [name, setName] = useState(""),
    [role, setRole] = useState(""),
    [signature, setSignature] = useState(null),
    [accepted, setAccepted] = useState(false),
    [authority, setAuthority] = useState(false),
    [code, setCode] = useState(""),
    [challenge, setChallenge] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [now, setNow] = useState(Date.now);
  const attempt = useRef({ intent: null, key: null });
  useEffect(() => {
    dialog.current.showModal();
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const expiresIn = challenge ? Math.max(0, Math.ceil((Date.parse(challenge.expiresAt) - now) / 1000)) : 0;
  const expired = challenge && (expiresIn === 0 || errorCode === "OTP_EXPIRED");
  const conflicted = errorCode === "AGREEMENT_CONFLICT";
  const cooldown = challenge
    ? Math.max(
        0,
        Math.ceil((Date.parse(challenge.resendAvailableAt) - now) / 1000),
      )
    : 0;
  async function requestCode() {
    if (sending.current || cooldown || !canSign(agreement)) return;
    sending.current = true;
    setBusy(true);
    setError("");
    setErrorCode("");
    try {
      const c = await agreementRequest("code", {
        input: {
          agreementId: agreement.id,
          revision: agreement.revision,
          documentSha256: agreement.documentSha256,
        },
      });
      setChallenge(c);
      setCode("");
    } catch (e) {
      setError(e.message);
      setErrorCode(e.code || "");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    if (
      sending.current ||
      !canSign(agreement) ||
      !challenge ||
      expired ||
      !name.trim() ||
      !role.trim() ||
      !signature ||
      !accepted ||
      !authority
    )
      return;
    sending.current = true;
    setBusy(true);
    setError("");
    setErrorCode("");
    try {
      const input = {
        agreementId: agreement.id,
        revision: agreement.revision,
        documentSha256: agreement.documentSha256,
        challengeId: challenge.challengeId,
        code,
        fullName: name.trim(),
        role: role.trim(),
        signature,
        acceptedTerms: accepted,
        confirmedAuthority: authority,
      };
      const intent = JSON.stringify(input);
      if (attempt.current.intent !== intent)
        attempt.current = { intent, key: crypto.randomUUID() };
      await agreementRequest("sign", {
        input: { ...input, idempotencyKey: attempt.current.key },
      });
      await onSigned();
      onClose();
    } catch (e) {
      setError(e.message);
      setErrorCode(e.code || "");
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else onClose();
      }}
      className="agreement-sign-dialog m-auto max-h-[90dvh] w-[min(94vw,560px)] overflow-y-auto rounded-2xl bg-white p-0 text-[#3f342c] shadow-2xl backdrop:bg-black/40"
    >
      <form onSubmit={submit} className="agreement-sign-form">
        <header className="flex items-start justify-between border-b border-[#eee5dd] p-5">
          <div>
            <h2 className="text-xl font-bold">{ag("Sign the Vendor Agreement")}</h2>
            <p className="mt-1 text-xs text-[#8d7969]">{ag("Version")}{agreement.version} / {agreement.companyName}
            </p>
          </div>
          <button
            aria-label={ag("Close signing dialog")}
            type="button"
            disabled={busy}
            onClick={onClose}
            className="px-2 text-xl"
          >
            ×
          </button>
        </header>
        <div className="agreement-sign-body space-y-4 p-5">
          {error && <ErrorNotice message={error} />}
          {errorCode === "COMPANY_DETAILS_REQUIRED" && <a href="/settings" className="text-sm font-semibold underline">{ag("Update company details in Settings")}</a>}
          {conflicted && <button type="button" className="text-sm font-semibold underline" disabled={busy} onClick={async () => { await onSigned(); onClose(); }}>{ag("Refresh agreement")}</button>}
          <label className="block text-sm">{ag("Company")}<input
              className={inputClass + " bg-stone-50"}
              value={
                agreement.companyName + " / " + agreement.organisationNumber
              }
              readOnly
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">{ag("Your full name")}<input
                required
                maxLength={160}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                className={inputClass}
              />
            </label>
            <label className="text-sm">{ag("Your role")}<input
                required
                maxLength={120}
                autoComplete="organization-title"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={busy}
                className={inputClass}
              />
            </label>
          </div>
          <SignatureInput disabled={busy} onChange={setSignature} />
          <p className="rounded-lg bg-[#faf6f1] p-3 text-xs leading-5 text-[#514438]">{ag("By submitting, you intend to sign this agreement electronically. Your signature, consent and verification record will be saved with the agreement. The signing record includes your account email, signing date/time and IP address. GoCatering reviews your authority before activation.")}</p>
          <label className="flex gap-2 text-xs leading-5">
            <input
              type="checkbox"
              required
              checked={accepted}
              disabled={busy}
              onChange={(e) => setAccepted(e.target.checked)}
            />{ag("I have read and agree to the GoCatering Vendor Agreement, version")}{" "}
            {agreement.version}.
          </label>
          <label className="flex gap-2 text-xs leading-5">
            <input
              type="checkbox"
              required
              checked={authority}
              disabled={busy}
              onChange={(e) => setAuthority(e.target.checked)}
            />{ag("I am authorised to sign on behalf of")}{agreement.companyName}.
          </label>
          <div className="rounded-xl border border-[#e9dfd5] bg-[#faf7f3] p-4">
            <p className="text-xs leading-5">{ag("We will send a verification code to your registered email:")}{" "}
              {challenge?.maskedEmail || agreement.signerEmail}{ag(". This verifies mailbox access; GoCatering will separately review signing authority.")}</p>
            <button
              type="button"
              onClick={requestCode}
              disabled={busy || cooldown > 0}
              className="mt-2 text-xs font-semibold text-[#b65b31] underline"
            >
              {cooldown
                ? ag("Resend in ") + cooldown + "s"
                : challenge
                  ? ag("Resend code")
                  : ag("Send verification code")}
            </button>
            {challenge && (
              <label className="mt-3 block text-xs">{ag("Email verification code")}<input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  disabled={busy || expired}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  aria-invalid={errorCode === "OTP_INVALID" || expired ? true : undefined}
                  className={inputClass + (errorCode === "OTP_INVALID" || expired ? " border-red-600" : "")}
                />
                {!expired && <span className="mt-2 block text-xs" role="status">{ag("Code expires in") + " "}{Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, "0")}</span>}
                {expired && (
                  <span role="alert" className="text-red-700">{ag("Code expired. Request a new code.")}</span>
                )}
              </label>
            )}
          </div>
          <p className="text-xs leading-5 text-[#8d7969]">{ag("Your name, role, signature and verification record will be stored with this contract. Signing submits it for review; it does not activate your store.")}</p>
        </div>
        <footer className="flex justify-end gap-3 border-t border-[#eee5dd] p-5">
          <button type="button" disabled={busy} onClick={onClose}>{ag("Cancel")}</button>
          <button
            className={buttonClass}
            disabled={
              busy ||
              conflicted ||
              !canSign(agreement) ||
              !name.trim() ||
              !role.trim() ||
              !signature ||
              !accepted ||
              !authority ||
              !challenge ||
              expired ||
              code.length !== 6
            }
          >
            {busy ? ag("Please wait...") : ag("Sign and submit")}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
