import { quoteTiming } from './offerTiming.js';
import { offerCheckoutAction } from './offerCheckoutAction';
import { Link } from 'react-router-dom';
import { Check, Clock3, LoaderCircle, X } from 'lucide-react';
import { validQuote } from './offerModel';
import { isVendorApp } from './offerBridge';
import DetailPanel from '../order/components/order-details/DetailPanel';
import { formatMoney, dateTime } from './offerFormat';

export default function OfferPriceCard({ request, text, current, permissions, busy, activeAction, error, onAccept, onDecline, onUseRequestedPrice, onWithdraw }) {
  const checkoutAction = isVendorApp ? null : offerCheckoutAction(request, current, permissions);
  const timing = quoteTiming(request.quote);
  const quoted = Boolean(request.quote);
  const inactive=['DECLINED','EXPIRED','CLOSED','WITHDRAWN'].includes(request.status);
  const hasTarget = request.targetPricePerPerson != null && Number(request.targetPricePerPerson) > 0;
  const amount = quoted ? request.quote.pricePerPerson : hasTarget ? request.targetPricePerPerson : request.normalPricePerPerson;
  const label = quoted && inactive ? text('Previous offer','Tidligere tilbud') : quoted ? text('Vendor offer', 'Leverand\u00f8rens tilbud') : hasTarget ? text('Customer request', 'Kundens \u00f8nske') : text('Menu price', 'Menypris');

  return (
    <DetailPanel title={text('Price summary', 'Prisoversikt')} className="text-[#1a1410]">
      <div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-2 border-b border-[#ebe2d9] pb-3">
          <p className="text-[16px]">{label}</p>
          <strong className="text-[16px] font-semibold">{formatMoney(amount,text)}</strong>
          <p className="w-full text-right text-[13px]">{text('per person', 'per person')}</p>
        </div>
        <dl className="mt-3 grid gap-3 text-[16px]">
          <div className="flex flex-wrap justify-between gap-2"><dt>{text('Menu price', 'Menypris')}</dt><dd className="font-semibold">{formatMoney(request.normalPricePerPerson,text)}</dd></div>
          {quoted && hasTarget && <div className="flex flex-wrap justify-between gap-2"><dt>{text('Customer request', 'Kundens \u00f8nske')}</dt><dd className="font-semibold">{formatMoney(request.targetPricePerPerson,text)}</dd></div>}
          {quoted && <><div className="flex flex-wrap justify-between gap-2 border-t border-[#eee5dc] pt-3"><dt>{text('Food total', 'Mat totalt')}</dt><dd className="font-semibold">{formatMoney(Number(amount)*request.personCount,text)}</dd></div><div className="flex flex-wrap justify-between gap-2"><dt>{text('Customer saves', 'Kunden sparer')}</dt><dd className="font-semibold">{formatMoney((Number(request.normalPricePerPerson)-Number(amount))*request.personCount,text)}</dd></div></>}
        </dl>
        {quoted && <p className="mt-3 flex items-start gap-2 border-t border-[#ebe2d9] pt-3 text-[14px] leading-6"><Clock3 size={15} className="mt-1 shrink-0"/><span>{text('Valid until', 'Gyldig til')}<br/>{dateTime(request.quote.expiresAt,text)}</span></p>}
        {!current && ['OFFERED','ACCEPTED'].includes(request.status) && <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-[14px]! text-amber-900">{timing==='scheduled' ? <>{text('Available from', 'Tilgjengelig fra')} {dateTime(request.quote?.startsAt,text)}</> : timing==='expired' ? text('This offer has expired.', 'Tilbudet er utl\u00f8pt.') : text('This offer is not active. Refresh for the latest status.', 'Tilbudet er ikke aktivt. Oppdater for siste status.')}</p>}
        {request.status==='WAITING_FOR_VENDOR' && <p className="mt-3 flex items-start gap-2 border-t border-[#ebe2d9] pt-3 text-[14px] leading-6"><Clock3 size={15} className="mt-1 shrink-0"/><span>{text('Reply by', 'Svar innen')}<br/>{dateTime(request.responseDueAt,text)}</span></p>}
        {checkoutAction && <button type="button" data-offer-checkout disabled={busy||Boolean(error)} onClick={onAccept} className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#c65320] px-[13px] py-[9px] text-[14px]! font-semibold text-white hover:bg-[#a84218] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#cf6e38]">
          {activeAction==='accept'?<LoaderCircle size={16} className="animate-spin motion-reduce:animate-none"/>:<Check size={16}/>}
          {checkoutAction==='continue'?text('Continue to checkout','Fortsett til kassen'):text('Accept and go to checkout','Godta og g\u00e5 til kassen')}
        </button>}
        {isVendorApp && ['WAITING_FOR_VENDOR','WITHDRAWN'].includes(request.status) && permissions.canQuote && validQuote(request.targetPricePerPerson,request.normalPricePerPerson) && <div className="mt-3">
          <button type="button" disabled={busy} onClick={onUseRequestedPrice} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#c65320] px-3 py-2.5 text-[14px]! font-semibold text-white hover:bg-[#a84218] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38]"><Check size={16}/>{text('Accept requested price','Godta \u00f8nsket pris')}</button>
          <p className="mt-1.5 text-[13px]! leading-5">{text("Send an offer at the customer's requested price.",'Send et tilbud til kundens \u00f8nskede pris.')}</p>
        </div>}
        {request.status==='OFFERED'&&<div className="mt-3">
          <button type="button" onClick={onWithdraw} disabled={busy||!request._capabilities?.withdraw||!permissions.canWithdraw} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-700 px-3 py-2.5 text-[14px]! font-semibold text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-stone-500">{activeAction==='withdraw'?<LoaderCircle size={15} className="animate-spin"/>:null}{text('Withdraw offer','Trekk tilbudet tilbake')}</button>
          {!request._capabilities?.withdraw&&<p className="mt-1 text-[13px]!">{text('Withdrawal is currently unavailable. You can still reject the request.','Tilbaketrekking er foreløpig utilgjengelig. Du kan fortsatt avslå forespørselen.')}</p>}
        </div>}
   {permissions.canDecline&&request.status!=='ACCEPTED'&&request.status!=='ORDERED'?<button className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-[13px] py-[9px] text-[14px]! font-semibold leading-[1.35] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#cf6e38] border-red-700 bg-red-700 text-white enabled:hover:bg-red-800 mt-2.5 w-full`} disabled={busy} onClick={onDecline}>{activeAction==='decline'?<LoaderCircle size={15} className="shrink-0 animate-spin motion-reduce:animate-none"/>:<X size={15}/>}{text('Reject request','Avsl\u00e5 foresp\u00f8rsel')}</button>:null}
   {request.orderId?<Link className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-[13px] py-[9px] text-[14px]! font-semibold leading-[1.35] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#cf6e38] border-transparent bg-[#c65320] text-white hover:bg-[#a84218] mt-2.5 w-full`} to={isVendorApp?`/orders/${encodeURIComponent(request.orderId)}`:`/orders/${encodeURIComponent(request.orderId)}`}>{text('View order','Se bestilling')}</Link>:null}
   {!isVendorApp&&['CLOSED','EXPIRED','DECLINED'].includes(request.status)?<Link className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-[13px] py-[9px] text-[14px]! font-semibold leading-[1.35] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#cf6e38] border-[#dce0e3] bg-white text-[#1a1410] shadow-[0_1px_2px_#18212a05] enabled:hover:bg-[#f7f8f9] mt-2.5 w-full`} to="/">{text('Explore other menus','Se andre menyer')}</Link>:null}

        <details className="mt-4 border-t border-[#eee5dc] pt-3 text-[13px]! leading-6">
          <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-[#cf6e38]">{text('Delivery and payment', 'Levering og betaling')}</summary>
          <p className="mt-2">{text('Delivery charges are calculated at checkout. The customer pays the agreed price before the normal order flow starts.', 'Leveringskostnader beregnes i kassen. Kunden betaler avtalt pris f\u00f8r vanlig bestillingsflyt starter.')}</p>
        </details>
      </div>
    </DetailPanel>
  );
}
