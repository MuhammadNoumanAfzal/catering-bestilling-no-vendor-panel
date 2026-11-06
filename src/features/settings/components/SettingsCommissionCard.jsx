import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LockKeyhole, Percent, RefreshCw } from "lucide-react";
import SettingsSectionCard from "./SettingsSectionCard";
import { getVendorCommission } from "../api/commissionApi";

export default function SettingsCommissionCard() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState({ loading: true, error: false, effectiveRate: null, globalRate: null, hasVendorOverride: false });
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    getVendorCommission().then((rates) => {
      if (active) setState({ loading: false, error: false, ...rates });
    }).catch(() => {
      if (active) setState({ loading: false, error: true, effectiveRate: null, globalRate: null });
    });
    return () => { active = false; };
  }, [refresh]);
  const formatRate = (rate) => rate === null
    ? t("settings.commission.unavailable")
    : `${new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(rate)}%`;
  return (
    <SettingsSectionCard title={t("settings.commission.title")} description={t("settings.commission.description")}>
      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#92725a]"><LockKeyhole size={13}/>{t("settings.commission.managedByAdmin")}</div>
      <dl className={`mt-4 grid min-w-0 gap-3 ${state.hasVendorOverride && !state.loading ? "sm:grid-cols-2" : ""}`} aria-live="polite">
        {[["global",state.globalRate], ...(state.hasVendorOverride && !state.loading && !state.error ? [["applied",state.effectiveRate]] : [])].map(([key,rate]) => <div key={key} className="min-w-0 rounded-xl border border-[#eddfd3] bg-[#fffaf6] p-4"><dt className="flex items-center gap-2 text-xs text-[#806d60]"><Percent size={14}/>{t(`settings.commission.${key}`)}</dt><dd className="mt-2 break-words text-[20px] font-bold text-[#533b2c]">{state.loading ? t("settings.commission.loading") : formatRate(rate)}</dd></div>)}
      </dl>
      <p className="mt-3 text-xs leading-6 text-[#8a796c]">{t("settings.commission.help")}</p>
      {state.error && <p role="alert" className="mt-2 text-xs text-[#ad4c32]">{t("settings.commission.error")}</p>}
      <button type="button" disabled={state.loading} onClick={() => { setState((current) => ({ ...current, loading: true })); setRefresh((value) => value + 1); }} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#e3d6cb] px-3 text-xs font-semibold text-[#705440] transition hover:bg-[#fff3ea] disabled:opacity-50"><RefreshCw size={13}/>{t("settings.commission.refresh")}</button>
    </SettingsSectionCard>
  );
}