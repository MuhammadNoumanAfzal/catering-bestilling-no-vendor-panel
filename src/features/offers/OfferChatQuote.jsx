import { quoteTiming } from './offerTiming.js';
import { Tag } from 'lucide-react';
import { formatMoney, dateTime } from './offerFormat';
import OfferStatusBadge from './OfferStatusBadge';

export default function OfferChatQuote({ request, text }) {
  if (!request.quote) return null;
  const scheduled=quoteTiming(request.quote)==='scheduled';
  const inactive=['DECLINED','EXPIRED','CLOSED','WITHDRAWN'].includes(request.status);
  return (
    <article data-chat-offer className="w-full rounded-xl border border-[#efcdb5] bg-[#fff7ef] p-4 text-[#1a1410]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[16px]! font-semibold"><Tag size={17}/>{inactive?text('Previous offer','Tidligere tilbud'):text('Current offer', 'Gjeldende tilbud')}</h3>
        <OfferStatusBadge status={request.status} text={text}/>
      </div>
      <p className="mt-2 text-[15px]! font-semibold wrap-anywhere">{request.menuName}</p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[14px]!">{request.vendor?.name}</p>
        <p className="text-[18px]! font-bold whitespace-nowrap">{formatMoney(request.quote.pricePerPerson, text)} <span className="text-[13px]! font-normal">{text('/ person', '/ person')}</span></p>
      </div>
      <p className="mt-2 text-[13px]!">{text('Guests', 'Gjester')}: {request.personCount}</p>
      {scheduled && <p className="mt-1 text-[13px]!">{text('Available from', 'Tilgjengelig fra')}: {dateTime(request.quote.startsAt,text)}</p>}
      <p className="mt-1 text-[13px]!">{text('Valid until', 'Gyldig til')}: {dateTime(request.quote.expiresAt, text)}</p>
      <p className="mt-2 border-t border-[#efdfd1] pt-2 text-[13px]!">{inactive?text('This price is kept for your records and cannot be accepted.','Prisen beholdes som dokumentasjon og kan ikke godtas.'):text('Latest saved offer. Its price and status update automatically.', 'Siste lagrede tilbud. Pris og status oppdateres automatisk.')}</p>
    </article>
  );
}
