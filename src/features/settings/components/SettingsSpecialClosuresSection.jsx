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
          options={closureTypeOptions}
          placeholder={t("settings.addClosureType")}
          value={closureType}
        />

        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] font-bold text-[#2a211b]">{t("settings.startDate")}</span>
          <div className="relative min-w-0 w-full">
            <input
              className="type-subpara h-[38px] w-full min-w-0 rounded-[7px] border border-[#cec5bd] bg-white pl-3 pr-10 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer disabled:cursor-not-allowed disabled:bg-[#f5f0eb] disabled:text-[#8d7f73]"
              disabled={disabled}
              min={minDate}
              type="date"
              value={startDate}
              onChange={(event) => handleStartDateChange(event.target.value)}
            />
            <Calendar
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7064]"
              size={16}
            />
          </div>
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[13px] font-bold text-[#2a211b]">{t("settings.endDate")}</span>
          <div className="relative min-w-0 w-full">
            <input
              className="type-subpara h-[38px] w-full min-w-0 rounded-[7px] border border-[#cec5bd] bg-white pl-3 pr-10 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer disabled:cursor-not-allowed disabled:bg-[#f5f0eb] disabled:text-[#8d7f73]"
              disabled={disabled}
              min={startDate || minDate}
              type="date"
              value={endDate}
              onChange={(event) => handleEndDateChange(event.target.value)}
            />
            <Calendar
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7064]"
              size={16}
            />
          </div>
        </label>

        <SettingsTextField
          disabled={disabled}
          label={`${t("settings.reason")} (${t("settings.optional")})`}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Christmas holidays"
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
