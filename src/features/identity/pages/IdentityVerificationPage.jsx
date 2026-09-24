import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BadgeCheck, Building2, LogOut, ShieldCheck } from "lucide-react";

import { startSignicatVerification } from "../../dashboard/api/dashboardApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { authUserUpdated } from "../../auth/store/authSlice";
import { updateStoredAuthUser } from "../../auth/store/authStorage";
import { showVendorErrorAlert, showVendorSuccessToast } from "../../../utils/vendorAlerts";

function formatProvider(provider) {
  const normalized = `${provider ?? ""}`.trim();

  if (!normalized) {
    return "BankID";
  }

  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function IdentityVerificationPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const [hasLocalSuccess, setHasLocalSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("identity_verified");
    const provider = params.get("provider");
    const verifiedAt = params.get("verified_at");
    const error = params.get("error");

    if (!status && !error) {
      return;
    }

    if (status === "success") {
      const userPatch = {
        identityVerified: true,
        signicatProvider: provider || "BankID",
        signicatVerifiedAt: verifiedAt || new Date().toISOString(),
      };

      setHasLocalSuccess(true);
      dispatch(authUserUpdated(userPatch));
      updateStoredAuthUser(userPatch);
      void showVendorSuccessToast(`Identity successfully verified with ${formatProvider(provider)}.`);
      navigate("/dashboard", { replace: true });
      return;
    }

    void showVendorErrorAlert(
      "Identity verification was not completed. Please start a fresh verification session and try again.",
      "Identity verification",
    );
    navigate("/identity-verification", { replace: true });
  }, [dispatch, location.search, navigate]);

  async function handleStartVerification() {
    try {
      setIsStarting(true);
      const result = await startSignicatVerification({ flow: "vendor_onboarding" });
      window.location.href = result.redirectUrl;
    } catch (error) {
      setIsStarting(false);
      await showVendorErrorAlert(
        error.message || "Unable to start identity verification. Please try again.",
        "Identity verification",
      );
    }
  }

  async function handleLogout() {
    await logout().catch(() => {});
    navigate("/auth/login", { replace: true });
  }

  if (user?.identityVerified || hasLocalSuccess) {
    return <Navigate replace to="/dashboard" />;
  }

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.companyName || "Vendor";

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#fff1e7_0,#f7f2ee_34%,#eef4f2_100%)] px-5 py-8 text-[#201914]">
      <div className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <img className="h-auto w-36 object-contain" src="/logo (2).png" alt="GoCatering" />
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e3d3c7] bg-white/80 px-4 text-[13px] font-bold text-[#7a4c35] shadow-sm transition hover:bg-white"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f0d7c6] bg-white/70 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#c96432]">
              <ShieldCheck className="h-4 w-4" />
              Identity verification required
            </span>
            <h1 className="mt-5 text-[clamp(34px,5vw,64px)] font-black leading-[0.98] tracking-normal text-[#211713]">
              Verify your identity before entering the vendor dashboard.
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-8 text-[#6d5c52]">
              For account security and compliance, vendor dashboard access is locked until your identity is verified through Signicat.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#ead8cc] bg-white/92 p-6 shadow-[0_24px_70px_rgba(84,57,39,0.14)] backdrop-blur">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0e7] text-[#d06a35]">
              <BadgeCheck className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#221713]">Signicat eID verification</h2>
            <p className="mt-2 text-sm leading-6 text-[#746257]">
              Continue to Signicat. In production, the user authenticates with BankID or another enabled eID provider on Signicat's hosted screen.
            </p>

            <div className="mt-5 rounded-2xl bg-[#f8f3ef] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c96432] shadow-sm">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[#251b16]">{displayName}</p>
                  <p className="truncate text-xs text-[#806b5e]">{user?.email}</p>
                </div>
              </div>
            </div>

            <button
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#cf6e38] px-5 text-sm font-black text-white shadow-[0_18px_34px_rgba(207,110,56,0.24)] transition hover:bg-[#b95e2f] disabled:cursor-wait disabled:opacity-70"
              disabled={isStarting}
              onClick={handleStartVerification}
              type="button"
            >
              {isStarting ? "Connecting to Signicat..." : "Verify identity with Signicat"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}