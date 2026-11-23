import { ag, useAgreementLanguage } from "./agreementTranslations.js";
import { Link } from "react-router-dom";
import { CircleCheck, LockKeyhole } from "lucide-react";
import { useAgreement } from "./agreementContext";
export default function AgreementBanner() {
  useAgreementLanguage();
  const { agreement, enabled, loading, error } = useAgreement();
  if (!enabled) return null;
  const active = agreement?.status === "ACTIVE";
  const waiting = agreement?.status === "PENDING_APPROVAL";
  if (active && !loading && !error) return null;
  return (
    <div
      role="status"
      className={
        "mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 " +
        (active
          ? "border-green-200 bg-green-50 text-green-900"
          : "border-amber-200 bg-amber-50 text-amber-950")
      }
    >
      <div className="flex items-start gap-3">
        {active ? <CircleCheck size={20} /> : <LockKeyhole size={20} />}
        <div>
          <p className="text-sm font-semibold">
            {loading
              ? ag("Checking your Vendor Agreement")
              : error
                ? ag("Your agreement status could not be verified")
                : active
                  ? ag("Your Vendor Agreement is active")
                  : waiting
                    ? ag("Thank you. Your agreement is waiting for approval")
                    : agreement?.status === "REJECTED"
                      ? ag("Your agreement needs attention")
                      : ag("Your Vendor Agreement is pending")}
          </p>
          <p className="mt-1 text-xs">
            {active
              ? ag("View your accepted agreement and store eligibility.")
              : ag("You can set up your profile and menus. Going live requires an active agreement and all other onboarding checks.")}
          </p>
        </div>
      </div>
      <Link
        to="/agreement"
        className="rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold underline"
      >
        {active
          ? ag("View agreement")
          : waiting
            ? ag("View progress")
            : ag("Review agreement")}
      </Link>
    </div>
  );
}
