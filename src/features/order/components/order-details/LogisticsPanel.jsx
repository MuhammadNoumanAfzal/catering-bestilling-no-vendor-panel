import { useTranslation } from "react-i18next";
import DetailPanel from "./DetailPanel";

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[14px] font-bold text-[#8a7a6d]">{label}</span>
      <strong className="text-[14px] font-extrabold text-[#17120e]">{value}</strong>
    </div>
  );
}

export default function LogisticsPanel({ logistics }) {
  const { t } = useTranslation();
  const mapQuery = encodeURIComponent(logistics.fullAddress || logistics.deliveryAddress);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <DetailPanel title={t("orders.detail.deliveryLocation", { defaultValue: "Delivery Location" })}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.7fr)]">
        <Field label={t("orders.deliveryAddress", { defaultValue: "Delivery Address" })} value={logistics.deliveryAddress} />
        <Field label={t("orders.detail.eventType", { defaultValue: "Event Type" })} value={logistics.eventType} />
      </div>

      <div className="mt-2.5">
        <a
          className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-md border border-[#c7d5f3] bg-white px-3 text-[11px] font-bold text-[#4b78d0] no-underline transition hover:bg-[#f4f7ff]"
          href={googleMapsUrl}
          rel="noreferrer"
          target="_blank"
        >
          {t("orders.detail.viewOnMaps", { defaultValue: "View on Google Maps" })}
        </a>
      </div>
    </DetailPanel>
  );
}
