import { useState } from "react";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import SettingsSectionCard from "./SettingsSectionCard";
import SettingsSelectField from "./SettingsSelectField";
import SettingsTextField from "./SettingsTextField";
import { isPastDateValue } from "../../../utils/dateValidation";
import { useTranslation } from "react-i18next";

function formatDate(dateStr, locale) {
  if (!dateStr) {
    return "";
  }

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}

const monthKeys = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const weekdayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const closureTypeKeyAliases = {
  emergency: "emergency",
  holiday: "holiday",
  maintenance: "maintenance",
  "private event": "private_event",
  private_event: "private_event",
  "private-event": "private_event",
  vacation: "vacation",
};

function getClosureTypeTranslationKey(option) {
  const candidates = [option?.slug, option?.value, option?.label];

  for (const candidate of candidates) {
    const normalized = String(candidate || "")
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .toLowerCase()
      .replace(/[\s-]+/g, "_");
    const spaced = normalized.replace(/_/g, " ");

    if (closureTypeKeyAliases[normalized]) {
      return closureTypeKeyAliases[normalized];
    }

    if (closureTypeKeyAliases[spaced]) {
      return closureTypeKeyAliases[spaced];
    }
  }

  return "";
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function ClosureDateField({ disabled, label, minDate, onChange, value }) {
  const { t, i18n } = useTranslation();
  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [monthDate, setMonthDate] = useState(() => selected || new Date());
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const display = selected ? new Intl.DateTimeFormat(i18n.language === "nb" ? "nb-NO" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(selected) : label;
  const minimum = minDate || "";

  return <div className="relative min-w-0 w-full"><button aria-label={label} className="type-subpara flex h-[38px] w-full items-center justify-between rounded-[7px] border border-[#cec5bd] bg-white px-3 text-left text-[#201712]" disabled={disabled} onClick={() => setOpen((current) => !current)} type="button"><span className={value ? "" : "text-[#b0a59b]"}>{display}</span><Calendar size={16} className="text-[#7d7064]" /></button>{open ? <div className="absolute bottom-[calc(100%+5px)] left-0 z-50 w-full min-w-[250px] rounded-[10px] border border-[#cec5bd] bg-white p-3 shadow-lg"><div className="mb-2 flex items-center justify-between"><button aria-label={t("dashboard.date.previousMonth", { defaultValue: "Previous month" })} onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} type="button">‹</button><strong className="text-[12px]">{t(`dashboard.date.months.${monthKeys[month]}`, { defaultValue: monthKeys[month] })} {year}</strong><button aria-label={t("dashboard.date.nextMonth", { defaultValue: "Next month" })} onClick={() => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} type="button">›</button></div><div className="grid grid-cols-7 gap-1 text-center">{weekdayKeys.map((key) => <span key={key} className="py-1 text-[9px] font-bold">{t(`dashboard.date.weekdays.${key}`, { defaultValue: key })}</span>)}{Array.from({ length: offset }).map((_, index) => <span key={index} />)}{Array.from({ length: days }, (_, index) => index + 1).map((day) => { const next = toIsoDate(new Date(year, month, day)); const invalid = minimum && next < minimum; return <button key={day} disabled={invalid} className={`h-7 rounded-full text-[10px] ${next === value ? "bg-[#cf6e38] text-white" : "hover:bg-[#fff1e8]"} disabled:opacity-30`} onClick={() => { onChange(next); setOpen(false); }} type="button">{day}</button>; })}</div><div className="mt-2 flex justify-between border-t pt-2"><button className="text-[10px] text-[#cf6e38]" onClick={() => { onChange(""); setOpen(false); }} type="button">{t("dashboard.date.clearDate", { defaultValue: "Clear date" })}</button><button className="text-[10px] text-[#cf6e38]" onClick={() => { const today = new Date(); onChange(toIsoDate(today)); setMonthDate(today); setOpen(false); }} type="button">{t("dashboard.date.today", { defaultValue: "Today" })}</button></div></div> : null}</div>;
}

export default function SettingsSpecialClosuresSection({
  closures = [],
  onAddOrUpdateClosure,
  onDeleteClosure,
  closureTypeOptions = [],
  disabled = false,
  minDate = "",
}) {
  const { t, i18n } = useTranslation();
  const [closureType, setClosureType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [dateError, setDateError] = useState("");
  const translatedClosureTypes = closureTypeOptions.map((option) => ({
    ...option,
    label: t(`settings.closureTypes.${getClosureTypeTranslationKey(option)}`, { defaultValue: option.label }),
  }));

  function handleStartDateChange(nextValue) {
    if (!nextValue) {
      setStartDate("");
      setDateError("");
      return;
    }

    if (isPastDateValue(nextValue)) {
      setDateError(t("settings.pastDates"));
      return;
    }

    setDateError("");
    setStartDate(nextValue);

    if (endDate && endDate < nextValue) {
      setEndDate("");
    }
  }

  function handleEndDateChange(nextValue) {
    if (!nextValue) {
      setEndDate("");
      setDateError("");
      return;
    }

    if (isPastDateValue(nextValue)) {
      setDateError(t("settings.pastDates"));
      return;
    }

    if (startDate && nextValue < startDate) {
      setDateError(t("settings.invalidDateRange"));
      return;
    }

    setDateError("");
    setEndDate(nextValue);
  }

  function handleAddOrUpdate() {
    if (!closureType || !startDate || !endDate) {
      return;
    }

    if (isPastDateValue(startDate) || isPastDateValue(endDate)) {
      setDateError(t("settings.pastDates"));
      return;
    }

    if (endDate < startDate) {
      setDateError(t("settings.invalidDateRange"));
      return;
    }

    onAddOrUpdateClosure(closureType, startDate, endDate, reason, editingId);
    setClosureType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setEditingId(null);
    setDateError("");
  }

  function handleEditClick(item) {
    setClosureType(item.type);
    setStartDate(item.start);
    setEndDate(item.end);
    setReason(item.reason);
    setEditingId(item.id);
    setDateError("");

    const element = document.getElementById("special-closures-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <SettingsSectionCard
      description={t("settings.closuresDescription")}
      title={t("settings.closures")}
    >
      <div className="grid min-w-0 grid-cols-4 gap-3 max-[960px]:grid-cols-2 max-[480px]:grid-cols-1">
        <SettingsSelectField
          disabled={disabled}
          label={t("settings.closureType")}
          onChange={(event) => setClosureType(event.target.value)}
          options={translatedClosureTypes}
          placeholder={t("settings.addClosureType")}
          value={closureType}
        />

        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] font-bold text-[#2a211b]">{t("settings.startDate")}</span>
          <ClosureDateField disabled={disabled} label={t("settings.startDate")} minDate={minDate} onChange={handleStartDateChange} value={startDate} />
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] font-bold text-[#2a211b]">{t("settings.endDate")}</span>
          <ClosureDateField disabled={disabled} label={t("settings.endDate")} minDate={startDate || minDate} onChange={handleEndDateChange} value={endDate} />
        </label>

        <SettingsTextField
          disabled={disabled}
          label={`${t("settings.reason")} (${t("settings.optional")})`}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t("settings.placeholders.closureReason", { defaultValue: "e.g. Christmas holidays" })}
          value={reason}
        />
      </div>

      {dateError ? (
        <p className="mt-2 text-[12px] font-semibold text-[#d96e39]">{dateError}</p>
      ) : null}

      <div className="mt-3 flex justify-end max-[480px]:justify-stretch">
        <button
          className={`rounded-lg bg-[#cf6e38] px-5 py-2 text-[13px] font-bold text-white transition max-[480px]:w-full ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[#bf622f] active:scale-95"
          }`}
          disabled={disabled}
          onClick={handleAddOrUpdate}
          type="button"
        >
          {editingId ? t("settings.updateClosure") : t("settings.addClosure")}
        </button>
      </div>

      <div className="mt-6 border-t border-[#f2ece6] pt-4">
        <h3 className="mb-3 text-[14px] font-bold text-[#201914]">{t("settings.upcomingClosures")}</h3>

        {closures.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#eee7df]">
                  <th className="pb-2 text-left text-[12px] font-bold text-[#8a7c70]">{t("settings.reason")}</th>
                  <th className="pb-2 text-left text-[12px] font-bold text-[#8a7c70]">{t("settings.dateRange")}</th>
                  <th className="pb-2 text-left text-[12px] font-bold text-[#8a7c70]">{t("settings.status")}</th>
                  <th className="pb-2 text-right text-[12px] font-bold text-[#8a7c70]">{t("settings.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {closures.map((item) => (
                  <tr key={item.id} className="border-b border-[#f2ece6] last:border-0">
                    <td className="py-3 text-[13px] font-bold text-[#201914]">{item.reason}</td>
                    <td className="py-3 text-[13px] font-bold text-[#201914]">
                      {formatDate(item.start, i18n.language)} – {formatDate(item.end, i18n.language)}
                    </td>
                    <td className="py-3 text-[13px]">
                      <span
                        className={`inline-flex min-h-[22px] items-center justify-center rounded-full px-3 text-[11px] font-extrabold tracking-wide ${
                          item.status === "Active" ? "bg-[#00b050] text-white" : "bg-[#fff9e6] text-[#d97706]"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleEditClick(item)}
                          className={`text-[#7a6d63] transition active:scale-90 ${
                            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[#cf6e38]"
                          }`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onDeleteClosure(item.id)}
                          className={`text-[#de5f5f] transition active:scale-90 ${
                            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:text-[#b23b3b]"
                          }`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-4 text-center text-[12px] font-semibold text-[#8a7c70]">
            {t("settings.noClosures")}
          </p>
        )}
      </div>
    </SettingsSectionCard>
  );
}
