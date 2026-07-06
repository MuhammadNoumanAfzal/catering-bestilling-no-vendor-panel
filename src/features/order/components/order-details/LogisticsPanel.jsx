import DetailPanel from "./DetailPanel";

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[16px] font-bold text-[#8a7a6d]">{label}</span>
      <strong className="text-[14px] font-extrabold text-[#17120e]">{value}</strong>
    </div>
  );
}

export default function LogisticsPanel({ logistics, tableware }) {
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

      {tableware && (
        <div className="mt-3 flex flex-col gap-2">
          <span className="text-[16px] font-bold text-[#8a7a6d]">Tableware Selection</span>
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-[4px] px-2 py-0.5 text-[12px] font-extrabold ${tableware.napkins ? "bg-green-50 text-green-700 border border-green-200" : "bg-[#f2ece6] text-[#7a6d63]"}`}>
              Napkins: {tableware.napkins ? "Yes" : "No"}
            </span>
            <span className={`rounded-[4px] px-2 py-0.5 text-[12px] font-extrabold ${tableware.utensils ? "bg-green-50 text-green-700 border border-green-200" : "bg-[#f2ece6] text-[#7a6d63]"}`}>
              Utensils: {tableware.utensils ? "Yes" : "No"}
            </span>
            <span className={`rounded-[4px] px-2 py-0.5 text-[12px] font-extrabold ${tableware.platesBowls ? "bg-green-50 text-green-700 border border-green-200" : "bg-[#f2ece6] text-[#7a6d63]"}`}>
              Plates/Bowls: {tableware.platesBowls ? "Yes" : "No"}
            </span>
          </div>
          {tableware.instructions && (
            <div className="mt-1 text-[13px] bg-[#fffbf0] border border-[#fef08a] rounded-[6px] p-2 text-[#854d0e] font-semibold">
              <strong className="block text-[11px] uppercase tracking-wider text-[#a16207]/75">Instructions:</strong>
              {tableware.instructions}
            </div>
          )}
        </div>
      )}
    </DetailPanel>
  );
}
