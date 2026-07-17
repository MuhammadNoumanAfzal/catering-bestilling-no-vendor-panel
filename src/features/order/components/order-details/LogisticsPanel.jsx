import DetailPanel from "./DetailPanel";

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[16px] font-bold text-[#8a7a6d]">{label}</span>
      <strong className="text-[14px] font-extrabold text-[#17120e]">{value}</strong>
    </div>
  );
}

export default function LogisticsPanel({ logistics }) {
  const mapQuery = encodeURIComponent(logistics.fullAddress || logistics.deliveryAddress);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <DetailPanel title="Logistic & Delivery">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Field label="Delivery Address" value={logistics.deliveryAddress} />
        <Field label="Event Date" value={logistics.eventDate} />
        <Field label="Delivery Window" value={logistics.deliveryWindow} />
      </div>

      <div className="mt-3 rounded-[10px] bg-[#f8fafc] p-3">
        <p className="m-0 text-[12px] font-bold leading-[1.5] text-[#201914]">
          {logistics.deliveryAddress}
        </p>
        <p className="mt-1 text-[12px] font-bold leading-[1.5] text-[#201914]">
          {logistics.fullAddress}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 border-b border-[#efe6de] pb-3">
        <div className="flex flex-col gap-1">
          <a
            className="inline-flex min-h-8 items-center justify-center rounded-md border border-[#c7d5f3] bg-white px-3 text-[11px] font-bold text-[#4b78d0] no-underline"
            href={googleMapsUrl}
            rel="noreferrer"
            target="_blank"
          >
            View on Google Maps
          </a>
        </div>
        <Field label="Event Type" value={logistics.eventType} />
        <Field label="Service" value={logistics.serviceType} />
      </div>
    </DetailPanel>
  );
}
