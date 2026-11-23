import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Users } from 'lucide-react';
import { isVendorApp, offersBasePath } from './offerBridge';
import { deliveryLabel, formatMoney } from './offerFormat';
import OfferStatusBadge from './OfferStatusBadge';

export default function OfferRequestList({ items, text }) {
  return (
    <div data-offer-list className="overflow-hidden rounded-b-xl border border-[#e6dfd8] bg-white text-[#1a1410]">
      <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_155px_135px_16px] items-center gap-5 border-b border-[#eae3dc] bg-[#fff4e9] px-5 py-3.5 text-[14px]! font-semibold @[900px]:grid">
        <span>{text('Menu / customer', 'Meny / kunde')}</span>
        <span>{text('Delivery', 'Levering')}</span>
        <span>{text('Status', 'Status')}</span>
        <span className="text-right">{text('Offer / person', 'Tilbud / person')}</span>
        <span />
      </div>
      {items.map(item => (
        <Link key={item.id} data-offer-row to={`${offersBasePath}/${encodeURIComponent(item.id)}`}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-4 border-b border-[#eee8e2] px-5 py-5 text-inherit no-underline transition-colors last:border-b-0 even:bg-[#fdfbf9] hover:bg-[#fff5ec] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#cf6e38] max-[420px]:px-3.5 @[900px]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_155px_135px_16px] @[900px]:gap-5">
          <div className="col-start-1 row-start-1 min-w-0 @[900px]:col-auto @[900px]:row-auto">
            <h2 className="m-0 text-[17px]! font-semibold! leading-snug! wrap-anywhere">{item.menuName}</h2>
            <p className="mt-1 text-[14px]!">{isVendorApp ? item.customerDisplayName : item.vendor?.name}</p>
          </div>
          <div className="col-start-1 row-start-2 flex min-w-0 flex-col gap-2 text-[14px]! leading-5 @[900px]:col-auto @[900px]:row-auto">
            <span className="flex flex-wrap items-center gap-1.5"><CalendarDays size={15} className="shrink-0 text-[#bc6538]" />{deliveryLabel(item.deliveryDate, text)}<span>{String(item.deliveryTime || '').slice(0, 5)}</span></span>
            <span className="flex flex-wrap items-center gap-1.5"><Users size={15} className="shrink-0" />{item.personCount} {text('guests', 'gjester')}<span aria-hidden="true">/</span>{item.postalCode}</span>
          </div>
          <div className="col-start-2 row-start-1 max-w-[155px] justify-self-end @[900px]:col-auto @[900px]:row-auto @[900px]:justify-self-start">
            <OfferStatusBadge status={item.status} text={text} />
          </div>
          <div className="col-start-2 row-start-2 flex flex-col items-end gap-1 text-right @[900px]:col-auto @[900px]:row-auto">
            <OfferRequestPrice request={item} text={text} />
          </div>
          <ArrowRight size={17} className="hidden text-[#b65b2f] @[900px]:block" />
        </Link>
      ))}
    </div>
  );
}

function OfferRequestPrice({ request, text }) {
  const prices = [
    { value: request.quote?.pricePerPerson, label: text('Quoted / person', 'Tilbud / person') },
    { value: request.targetPricePerPerson, label: text('Requested / person', '\u00d8nsket / person') },
    { value: request.normalPricePerPerson, label: text('Menu price / person', 'Menypris / person') },
  ];
  const price = prices.find(({ value }) => value != null && String(value).trim() !== '' && Number.isFinite(Number(value)) && Number(value) > 0);
  if (!price) return <span className="text-[13px]!">{text('Not provided', 'Ikke oppgitt')}</span>;
  return <>
    <strong className="text-[16px]! font-semibold text-[#a74e27]">{formatMoney(price.value, text)}</strong>
    <small className="text-[13px]!">{price.label}</small>
  </>;
}
