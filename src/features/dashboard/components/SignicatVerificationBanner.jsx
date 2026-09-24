import { useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { startSignicatVerification } from "../api/dashboardApi";
import { showVendorErrorAlert } from "../../../utils/vendorAlerts";

function formatProvider(provider) {
  const normalized = `${provider ?? ""}`.trim();

  if (!normalized) {
    return "BankID";
  }

  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function SignicatVerificationBanner({ identityVerification }) {
  const [isStarting, setIsStarting] = useState(false);
  const isVerified = Boolean(identityVerification?.isVerified);
  const providerLabel = formatProvider(identityVerification?.provider);

  async function handleStartVerification() {
    try {
      setIsStarting(true);
      const result = await startSignicatVerification({ flow: "vendor_onboarding" });
      window.location.href = result.redirectUrl;
    } catch (error) {
      setIsStarting(false);
      await showVendorErrorAlert(
        error.message || "Unable to start BankID verification. Please try again.",
        "Identity verification",
      );
    }
  }

  if (isVerified) {
    return (
      <section className="rounded-[22px] border border-[#cde9d5] bg-[#f3fbf5] px-5 py-4 shadow-[0_14px_32px_rgba(26,83,44,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dff5e6] text-[#16803b]">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[14px] font-bold text-[#173b25]">Identity verified with {providerLabel}</p>
              <p className="mt-0.5 text-[12px] text-[#52715d]">Your vendor account identity check is complete.</p>
            </div>
          </div>
          {identityVerification?.verifiedAt ? (
            <span className="rounded-full border border-[#cde9d5] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#16803b]">
              Verified
            </span>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-[#f0d9bf] bg-[linear-gradient(135deg,#fff9ef_0%,#fff3e3_100%)] px-5 py-5 shadow-[0_18px_42px_rgba(134,81,31,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex max-w-[760px] items-start gap-3">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#cf6e38] shadow-[0_10px_24px_rgba(207,110,56,0.14)]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-[#231913]">Identity verification required</p>
            <p className="mt-1 max-w-[640px] text-[13px] leading-[1.6] text-[#7b6250]">
              Verify your identity with BankID via Signicat to activate your vendor account and continue securely.
            </p>
          </div>
        </div>
        <button
          className="inline-flex min-h-[44px] cursor-pointer items-center justify-center rounded-full bg-[#cf6e38] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_12px_24px_rgba(207,110,56,0.22)] transition hover:bg-[#b95e2f] disabled:cursor-wait disabled:opacity-65"
          disabled={isStarting}
          onClick={handleStartVerification}
          type="button"
        >
          {isStarting ? "Connecting to BankID..." : "Verify with BankID"}
        </button>
      </div>
    </section>
  );
}