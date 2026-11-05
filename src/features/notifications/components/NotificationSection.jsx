import { useTranslation } from "react-i18next";
import { translateNotificationText } from "../notificationTranslations";
import NotificationItem from "./NotificationItem";

export default function NotificationSection({ label, items, onOpen, onArchive, archivingId, startIndex = 0 }) {
  const { t } = useTranslation();
  return (
    <section className="rounded-[20px] border border-[#ebe1d8] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_100%)] p-4 shadow-[0_10px_24px_rgba(44,29,19,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold text-[#1d1713]">{translateNotificationText(label)}</h2>
        <span className="rounded-full bg-[#f7f1eb] px-2.5 py-1 text-[11px] font-semibold text-[#8a7b6e]">
          {items.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((notification, index) => (
          <div key={notification.id}>
          <NotificationItem
            notification={notification}
            onOpen={onOpen}
            sequenceNumber={startIndex + index + 1}
          />
          <div className="mt-1 flex justify-end"><button type="button" disabled={Boolean(archivingId)} onClick={() => onArchive(notification)} className="rounded-full border border-[#eadfd6] px-3 py-1 text-xs text-[#75675c] disabled:opacity-50">{t(notification.isArchived ? "notifications.restoreAction" : "notifications.archiveAction")}</button></div>
          </div>
        ))}
      </div>
    </section>
  );
}
