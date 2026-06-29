import { useState } from "react";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import SettingsSectionCard from "./SettingsSectionCard";
import SettingsSelectField from "./SettingsSelectField";
import SettingsTextField from "./SettingsTextField";

function formatDate(dateStr) {
  if (!dateStr) {
    return "";
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function SettingsSpecialClosuresSection({
  closures = [],
  onAddOrUpdateClosure,
  onDeleteClosure,
  closureTypeOptions = [],
  disabled = false,
}) {
  const [closureType, setClosureType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [editingId, setEditingId] = useState(null);

  function handleAddOrUpdate() {
    if (!closureType || !startDate || !endDate) {
      return;
    }

    onAddOrUpdateClosure(closureType, startDate, endDate, reason, editingId);
    setClosureType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setEditingId(null);
  }

  function handleEditClick(item) {
    setClosureType(item.type);
    setStartDate(item.start);
    setEndDate(item.end);
    setReason(item.reason);
    setEditingId(item.id);

    const element = document.getElementById("special-closures-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <SettingsSectionCard
      description="Block delivery and pickup on specific dates or date ranges. Customers will not be able to schedule orders on closed dates."
      title="Special Closures & Exceptions"
    >
      <div className="grid grid-cols-4 gap-3 max-[960px]:grid-cols-2 max-[480px]:grid-cols-1">
        <SettingsSelectField
          disabled={disabled}
          label="Closure type"
          onChange={(event) => setClosureType(event.target.value)}
          options={closureTypeOptions}
          placeholder="Add closure type"
          value={closureType}
        />

        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-bold text-[#2a211b]">Start date</span>
          <div className="relative">
            <input
              className="type-subpara h-[38px] w-full rounded-[7px] border border-[#cec5bd] bg-white pl-3 pr-10 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer disabled:cursor-not-allowed disabled:bg-[#f5f0eb] disabled:text-[#8d7f73]"
              disabled={disabled}
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <Calendar
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7064]"
              size={16}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-bold text-[#2a211b]">End date</span>
          <div className="relative">
            <input
              className="type-subpara h-[38px] w-full rounded-[7px] border border-[#cec5bd] bg-white pl-3 pr-10 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer disabled:cursor-not-allowed disabled:bg-[#f5f0eb] disabled:text-[#8d7f73]"
              disabled={disabled}
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
            <Calendar
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d7064]"
              size={16}
            />
          </div>
        </label>

        <SettingsTextField
          disabled={disabled}
          label="Reason (optional)"
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Christmas holidays"
          value={reason}
        />
      </div>

      <div className="mt-3 flex justify-end">
        <button
          className={`rounded-lg bg-[#cf6e38] px-5 py-2 text-[13px] font-bold text-white transition ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-[#bf622f] active:scale-95"
          }`}
          disabled={disabled}
          onClick={handleAddOrUpdate}
          type="button"
        >
          {editingId ? "Update Closure" : "Add Closure"}
        </button>
      </div>

      <div className="mt-6 border-t border-[#f2ece6] pt-4">
        <h3 className="mb-3 text-[14px] font-bold text-[#201914]">Upcoming Closure Dates</h3>

        {closures.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#eee7df]">
                  <th className="pb-2 text-left text-[12px] font-bold text-[#8a7c70]">Reason</th>
                  <th className="pb-2 text-left text-[12px] font-bold text-[#8a7c70]">Date range</th>
                  <th className="pb-2 text-left text-[12px] font-bold text-[#8a7c70]">Status</th>
                  <th className="pb-2 text-right text-[12px] font-bold text-[#8a7c70]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {closures.map((item) => (
                  <tr key={item.id} className="border-b border-[#f2ece6] last:border-0">
                    <td className="py-3 text-[13px] font-bold text-[#201914]">{item.reason}</td>
                    <td className="py-3 text-[13px] font-bold text-[#201914]">
                      {formatDate(item.start)} - {formatDate(item.end)}
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
            No upcoming closures configured.
          </p>
        )}
      </div>
    </SettingsSectionCard>
  );
}
