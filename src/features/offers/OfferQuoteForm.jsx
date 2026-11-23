import { LoaderCircle, Send } from 'lucide-react';
import DetailPanel from '../order/components/order-details/DetailPanel';
import { hasContactDetails, validQuote } from './offerModel';

export default function OfferQuoteForm({ request, text, busy, activeAction, price, setPrice, expiry, setExpiry, quoteMessage, setQuoteMessage, now, onQuote, expiryRef }) {
  const priceValid = validQuote(price, request.normalPricePerPerson);
  const expiryValid = Date.parse(expiry) > now;

  function submit(event) {
    event.preventDefault();
    if (!priceValid || !expiryValid || busy) return;
    onQuote({ pricePerPerson: price.replace(',', '.'), expiresAt: new Date(expiry).toISOString(), message: quoteMessage.trim() || null });
  }

  return (
    <DetailPanel title={text(request.quote ? 'Send a revised offer' : 'Send an offer', request.quote ? 'Send et revidert tilbud' : 'Send et tilbud')} className="mt-3 text-[#1a1410]">
      <form onSubmit={submit}>

      <p className="mt-1 text-[15px]!">{text('The agreed price stays valid even if your menu price changes.', 'Den avtalte prisen gjelder selv om menyprisen endres.')}</p>
      <div className="mt-5 grid grid-cols-2 gap-5 max-[600px]:grid-cols-1">
        <label className="grid content-start gap-2 text-[15px]!">
          {text('Price per person (NOK)', 'Pris per person (NOK)')}
          <input required disabled={busy} inputMode="decimal" value={price} onChange={event => setPrice(event.target.value)} placeholder={String(request.normalPricePerPerson)} className="min-w-0 w-full rounded-lg border border-[#ded7d0] bg-white p-3 text-[15px]! text-[#1a1410] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]" />
          {price && !priceValid && <small className="text-[13px]! text-red-800">{text('Above 0 and below the original menu price.', 'Over 0 og under opprinnelig menypris.')}</small>}
        </label>
        <label className="grid content-start gap-2 text-[15px]!">
          {text('Valid until (your local time)', 'Gyldig til (din lokale tid)')}
          <input ref={expiryRef} required disabled={busy} type="datetime-local" value={expiry} onChange={event => setExpiry(event.target.value)} className="min-w-0 w-full rounded-lg border border-[#ded7d0] bg-white p-3 text-[15px]! text-[#1a1410] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]" />
          {expiry && !expiryValid && <small className="text-[13px]! text-red-800">{text('Choose a future date and time.', 'Velg en fremtidig dato og tid.')}</small>}
        </label>
        <label className="col-span-full grid gap-2 text-[15px]!">
          {text('Message with offer (optional)', 'Melding med tilbudet (valgfritt)')}
          <textarea disabled={busy} maxLength={2000} value={quoteMessage} onChange={event => setQuoteMessage(event.target.value)} className="min-h-24 w-full resize-y rounded-lg border border-[#ded7d0] bg-white p-3 text-[15px]! text-[#1a1410] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]" />
          {hasContactDetails(quoteMessage) && <small className="text-[13px]! text-amber-900">{text('Contact details and links will be hidden.', 'Kontaktopplysninger og lenker skjules.')}</small>}
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <button disabled={busy || !priceValid || !expiryValid} className="inline-flex items-center gap-2 rounded-lg bg-[#ce6534] px-5 py-3 text-[15px]! font-semibold text-white hover:bg-[#b85225] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]">
          {activeAction === 'quote' ? <LoaderCircle size={17} className="animate-spin motion-reduce:animate-none" /> : <Send size={17} />}{text('Send offer', 'Send tilbud')}
        </button>
      </div>
      </form>
    </DetailPanel>
  );
}
