import { offerTimeline } from './offerTimeline';
import OfferTimelineEvent from './OfferTimelineEvent';
import { isConversationClosed } from './offerLiveState';
import { useEffect, useRef } from 'react';
import OfferChatQuote from './OfferChatQuote';
import { LoaderCircle, Send } from 'lucide-react';
import { hasContactDetails, redactContact } from './offerModel';
import { isVendorApp } from './offerBridge';
import DetailPanel from '../order/components/order-details/DetailPanel';
import { dateTime } from './offerFormat';

export default function OfferConversation({ request, text, busy, activeAction, message, setMessage, onSend }) {
  const logRef = useRef(null);
  const timeline=offerTimeline(request);
  const lastMessage = timeline.at(-1)?.key;
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [request.id, request.quote?.revision, request.status, lastMessage]);
  const closed = isConversationClosed(request);
  return (
    <DetailPanel title={text('Conversation', 'Samtale')} className="text-[#1a1410]">
      <div ref={logRef} role="log" aria-label={text('Conversation messages', 'Meldinger i samtalen')} className="mt-3 flex max-h-[440px] min-h-[140px] flex-col gap-4 overflow-y-auto overscroll-contain px-1 py-2">
        {!timeline.length && !request.quote && <p className="m-auto max-w-72 text-center text-[15px]!">{text('No messages yet.', 'Ingen meldinger enn\u00e5.')}</p>}
        {timeline.map(item => {
          if(item.kind==='event')return <OfferTimelineEvent key={item.key} event={item} text={text}/>;
          const mine = item.side === (isVendorApp ? 'VENDOR' : 'CUSTOMER');
          return (
            <article key={item.key} data-message-side={mine ? "outgoing" : "incoming"} className={`flex max-w-[82%] min-w-0 flex-col max-[500px]:max-w-[94%] ${mine ? "self-end items-end" : "self-start items-start"}`}>
              <small className={`mb-1.5 block text-[13px]! leading-5 ${mine ? "text-right" : "text-left"}`}>{item.side === 'VENDOR' ? request.vendor?.name : text('Customer', 'Kunde')} {'\u00b7'} {dateTime(item.createdAt, text)}</small>
              <p className={`max-w-full rounded-xl border px-3.5 py-2.5 text-[16px] leading-7 whitespace-pre-wrap wrap-anywhere ${mine ? "rounded-tr-sm border-[#efcdb5] bg-[#fff0e4]" : "rounded-tl-sm border-[#e6dfd8] bg-[#f6f4f1]"}`}>{redactContact(item.text)}</p>
              {item.moderated && <small className="mt-1 block text-[13px]!">{text('Contact details hidden', 'Kontaktopplysninger skjult')}</small>}
            </article>
          );
        })}
        <OfferChatQuote request={request} text={text}/>
      </div>
      {closed && <p role="status" className="mt-3 border-t border-[#ebe2d9] pt-3 text-[14px]! text-[#665b52]">{text('This conversation is closed. Previous messages are kept for your records.', 'Samtalen er lukket. Tidligere meldinger beholdes som dokumentasjon.')}</p>}
      {!closed && request.permissions?.canMessage && (
        <form className="mt-3 border-t border-[#ebe2d9] pt-3" onSubmit={event => { event.preventDefault(); if (!closed && !busy && request.permissions?.canMessage && message.trim()) onSend(message.trim()); }}>
          <label htmlFor="offer-message" className="text-[15px]!">{text('Message', 'Melding')}</label>
          <textarea id="offer-message" required disabled={busy} maxLength={2000} value={message} onChange={event => setMessage(event.target.value)} className="mt-2 mb-3 min-h-24 w-full resize-y rounded-lg border border-[#ded7d0] bg-white p-3 text-[15px]! text-[#1a1410] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]" />
          {hasContactDetails(message) && <p className="mb-3 rounded-lg bg-amber-50 p-3 text-[14px]! text-amber-900">{text('Contact details and links will be hidden.', 'Kontaktopplysninger og lenker skjules.')}<span className="mt-1 block wrap-anywhere">{redactContact(message)}</span></p>}
          <div className="flex items-center justify-between gap-3 max-[500px]:items-end">
            <small className="max-w-[65%] text-[13px]!">{text('Keep communication and payment on GoCatering.', 'Hold kommunikasjon og betaling p\u00e5 GoCatering.')}</small>
            <button disabled={busy || !message.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#c65320] px-4 py-2.5 text-[14px]! font-semibold text-white hover:bg-[#a84218] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]">
              {activeAction === 'message' ? <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" /> : <Send size={16} />}{text('Send', 'Send')}
            </button>
          </div>
        </form>
      )}
    </DetailPanel>
  );
}
