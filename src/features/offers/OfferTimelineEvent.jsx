import { dateTime, formatMoney } from './offerFormat';
import { offerEventLabel } from './offerTimeline';
import { redactContact } from './offerModel';
export default function OfferTimelineEvent({event,text}) {
 return <article data-offer-event={event.type} className="w-full rounded-lg border border-[#e8c4ac] bg-[#fff5eb] p-3 text-[#1a1410]">
  <p className="text-[15px]! font-semibold">{offerEventLabel(event.type,text)}</p>
  <p className="mt-1 text-[13px]!">{dateTime(event.createdAt,text)}</p>
  {event.pricePerPerson!=null&&<p className="mt-2 text-[16px]! font-bold">{formatMoney(event.pricePerPerson,text)} {text('/ person','/ person')}</p>}
  {event.text&&<p className="mt-1 text-[15px]! whitespace-pre-wrap wrap-anywhere">{redactContact(event.text)}</p>}
 </article>;
}
