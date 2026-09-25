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

  if (!normalized || normalized.toLowerCase() === "signicat") {
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
      void showVendorSuccessToast(`Identiteten ble verifisert med ${formatProvider(provider)}.`);
      navigate("/dashboard", { replace: true });
      return;
    }

    void showVendorErrorAlert(
      "Identitetsverifisering ble ikke fullført. Vennligst start en ny verifiseringssesjon og prøv igjen.",
      "Identitetsverifisering",
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
        error.message || "Kunne ikke starte identitetsverifisering. Vennligst prøv igjen.",
        "Identitetsverifisering",
      );
    }
  }

  async function handleLogout() {
    await logout().catch(() => { });
    navigate("/auth/login", { replace: true });
  }

  if (user?.identityVerified || hasLocalSuccess) {
    return <Navigate replace to="/dashboard" />;
  }

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.companyName || "Leverandør";

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,#fff1e7_0,#f7f2ee_34%,#eef4f2_100%)] px-4 py-6 sm:px-6 sm:py-8 text-[#201914]">
      <div className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-6xl flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img className="h-auto w-32 sm:w-36 object-contain" src="/logo (2).png" alt="GoCatering" />
            <span className="hidden h-6 w-px bg-[#e2d5cb] sm:block" />
            <img className="h-7 sm:h-8 w-auto object-contain" src="/banklogo.jpeg" alt="BankID" />
          </div>
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#e3d3c7] bg-white/90 px-4 text-[13px] font-bold text-[#7a4c35] shadow-sm transition hover:bg-white"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Logg ut
          </button>
        </header>

        <section className="mt-8 flex flex-1 flex-col justify-center gap-8 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="w-full min-w-0 flex-1 lg:max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f0d7c6] bg-white/80 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#c96432]">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Identitetsverifisering påkrevd
            </span>
            <h1 className="mt-4 text-[clamp(26px,4vw,46px)] font-black leading-[1.08] tracking-tight text-[#211713] break-words [overflow-wrap:anywhere]">
              Verifiser identiteten din med BankID før du går til leverandørdashbordet.
            </h1>
            <p className="mt-4 text-[15px] sm:text-[16px] leading-7 sm:leading-8 text-[#6d5c52] break-words">
              For kontosikkerhet og samsvar er tilgangen til leverandørdashbordet låst inntil identiteten din er verifisert med BankID.
            </p>
          </div>

          <div className="w-full min-w-0 shrink-0 lg:w-[380px] xl:w-[410px]">
            <div className="rounded-[28px] border border-[#ead8cc] bg-white/95 p-6 sm:p-7 shadow-[0_24px_70px_rgba(84,57,39,0.14)] backdrop-blur">
              <div className="flex items-center justify-between gap-3 border-b border-[#f3e6dc] pb-4">
                <img src="/banklogo.jpeg" alt="BankID" className="h-9 sm:h-10 w-auto object-contain" />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f7f3] px-3 py-1 text-[11px] font-extrabold text-[#1f7a42]">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                  BankID
                </span>
              </div>

              <h2 className="mt-5 text-xl sm:text-2xl font-black text-[#221713]">BankID-verifisering</h2>
              <p className="mt-2 text-xs sm:text-sm leading-6 text-[#746257]">
                Fortsett til sikker verifisering. Du autentiserer deg trygt med din BankID på den sikre verifiseringssiden.
              </p>

              <div className="mt-5 rounded-2xl bg-[#f8f3ef] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#c96432] shadow-sm">
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
                {isStarting ? "Kobler til BankID..." : "Verifiser identitet med BankID"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}