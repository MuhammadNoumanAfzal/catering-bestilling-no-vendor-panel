import { useState } from 'react';
import { LoaderCircle, Send } from 'lucide-react';
import DetailPanel from '../order/components/order-details/DetailPanel';
import { hasContactDetails, validQuote } from './offerModel';
import { OFFER_VALIDITY_DAYS, MAX_OFFER_VALIDITY_DAYS, validOfferDuration, quoteExpiresAt } from './quoteDuration';
import { dateTime } from './offerFormat';

export default function OfferQuoteForm({ request, text, busy, activeAction, price, setPrice, validityDays, setValidityDays, quoteMessage, setQuoteMessage, now, onQuote }) {
  const [customDuration, setCustomDuration] = useState(() => !OFFER_VALIDITY_DAYS.includes(Number(validityDays)));
  const durationValid = validOfferDuration(validityDays);
  const priceValid = validQuote(price, request.normalPricePerPerson);
  function submit(event) {
    event.preventDefault();
    if (!priceValid || !durationValid || busy) return;
    onQuote({pricePerPerson:price.replace(',','.'),expiresAt:quoteExpiresAt(validityDays),message:quoteMessage.trim()||null});
  }
  return <DetailPanel title={text(request.quote?'Change offer':'Send an offer',request.quote?'Endre tilbud':'Send et tilbud')} className="mt-3 text-[#1a1410]">
    <form onSubmit={submit}>
      <p className="mt-2 text-[15px]!">{text('The offer is valid from when you send it. Choose how many days the customer has to accept and pay.','Tilbudet gjelder fra det sendes. Velg hvor mange dager kunden har til å godta og betale.')}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid content-start gap-2 text-[15px]!">{text('Price per person (NOK)','Pris per person (NOK)')}
          <input required disabled={busy} inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} placeholder={String(request.normalPricePerPerson)} className="w-full min-w-0 rounded-lg border border-[#ded7d0] p-3 focus-visible:outline-2 focus-visible:outline-[#cf6e38]"/>
          {price&&!priceValid&&<small className="text-red-800">{text('Above 0 and below the original menu price.','Over 0 og under opprinnelig menypris.')}</small>}
        </label>
        <label className="grid content-start gap-2 text-[15px]!">{text('Offer valid for','Tilbudet gjelder i')}
          <select disabled={busy} value={customDuration?'custom':validityDays} onChange={e=>{const custom=e.target.value==='custom';setCustomDuration(custom);if(!custom)setValidityDays(e.target.value);}} className="w-full rounded-lg border border-[#ded7d0] bg-white p-3 focus-visible:outline-2 focus-visible:outline-[#cf6e38]">
            {OFFER_VALIDITY_DAYS.map(days=><option key={days} value={days}>{days} {text('days','dager')}</option>)}
            <option value="custom">{text('Custom days','Egendefinert antall dager')}</option>
          </select>
          {customDuration && <span className="grid gap-2"><span className="text-[14px]!">{text('Number of days (1-30)','Antall dager (1-30)')}</span><input required type="number" min="1" max={MAX_OFFER_VALIDITY_DAYS} step="1" inputMode="numeric" disabled={busy} value={validityDays} onChange={e=>setValidityDays(e.target.value)} className="w-full min-w-0 rounded-lg border border-[#ded7d0] bg-white p-3 focus-visible:outline-2 focus-visible:outline-[#cf6e38]"/></span>}
          {!durationValid && <small role="status" className="text-red-800">{text('Enter a whole number from 1 to 30 days.','Skriv et heltall fra 1 til 30 dager.')}</small>}
          {durationValid && <small className="text-[13px]!">{text('If sent now, valid until:','Hvis sendt nå, gyldig til:')} {dateTime(quoteExpiresAt(validityDays,now),text)}</small>}
        </label>
        <label className="grid gap-2 text-[15px]! sm:col-span-2">{text('Message with offer (optional)','Melding med tilbudet (valgfritt)')}
          <textarea disabled={busy} maxLength={2000} value={quoteMessage} onChange={e=>setQuoteMessage(e.target.value)} className="min-h-24 w-full resize-y rounded-lg border border-[#ded7d0] p-3 focus-visible:outline-2 focus-visible:outline-[#cf6e38]"/>
          {hasContactDetails(quoteMessage)&&<small className="text-amber-900">{text('Contact details and links will be hidden.','Kontaktopplysninger og lenker skjules.')}</small>}
        </label>
      </div>
      <div className="mt-4 flex justify-end"><button disabled={busy||!priceValid||!durationValid} className="inline-flex items-center gap-2 rounded-lg bg-[#c65320] px-5 py-3 text-[15px]! font-semibold text-white hover:bg-[#a84218] disabled:cursor-not-allowed disabled:bg-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]">{activeAction==='quote'?<LoaderCircle size={17} className="animate-spin"/>:<Send size={17}/>} {text('Send offer','Send tilbud')}</button></div>
    </form>
  </DetailPanel>;
}
