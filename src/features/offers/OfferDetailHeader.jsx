import DetailPanel from '../order/components/order-details/DetailPanel';
import OfferStatusBadge from './OfferStatusBadge';
import { deliveryLabel } from './offerFormat';

export default function OfferDetailHeader({ request, closed, text }) {
  const fields = [
    [text('Customer', 'Kunde'), request.customerDisplayName],
    [text('Delivery date', 'Leveringsdato'), deliveryLabel(request.deliveryDate, text)],
    [text('Time', 'Tid'), String(request.deliveryTime || '').slice(0, 5)],
    [text('Guests', 'Gjester'), request.personCount],
    [text('Postcode', 'Postnummer'), request.postalCode],
  ];
  return (
    <div className="mb-3 text-[#1a1410]">
      <header className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="m-0 text-[34px] font-bold leading-tight tracking-[-0.04em] text-[#19130f] wrap-anywhere">{request.menuName}</h1>
        <OfferStatusBadge status={request.status} text={text} />
        <p className="m-0 text-[14px] wrap-anywhere">{text('Request', 'Foresp\u00f8rsel')} #{request.id}</p>
      </header>
      <DetailPanel title={text('Request details', 'Foresp\u00f8rselsdetaljer')}>
        <dl className="mt-3 grid grid-cols-5 gap-x-5 gap-y-3 max-[850px]:grid-cols-3 max-[500px]:grid-cols-2">
          {fields.map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-[14px]">{label}</dt><dd className="mt-0.5 text-[15px] font-semibold wrap-anywhere">{value}</dd></div>)}
        </dl>
        {closed && <p className="mt-3 border-t border-[#ebe2d9] pt-2 text-[14px]">{text('This request is closed. The conversation and prices are saved for your records.', 'Foresp\u00f8rselen er avsluttet. Samtalen og prisene er lagret som dokumentasjon.')}</p>}
      </DetailPanel>
    </div>
  );
}
