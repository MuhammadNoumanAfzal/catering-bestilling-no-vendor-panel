import { mergeOfferUpdate, isConversationClosed } from './offerLiveState';
import { offerDetailPath, offerIdFromSlug } from './offerNavigation';
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, LoaderCircle, MessageSquare, RefreshCw, Tag } from 'lucide-react';
import { performOfferAction } from './offerActionRecovery';
import { offerRequest, newIdempotencyKey } from './offerApi';
import { isVendorApp, offersBasePath, useOfferAuth, storeAcceptedOffer } from './offerBridge';
import { requestedPriceQuote, suggestedQuoteExpiry } from './requestedPriceQuote';
import { formatMoney } from './offerFormat';
import { validOfferDuration, quoteExpiresAt } from './quoteDuration';
import { acceptedOfferCart, isOfferCurrent } from './offerModel';
import { useOfferText, offerStatus, offerError } from './offerText';
import { confirmVendorAction, showVendorSuccessToast } from '../../utils/vendorAlerts';
import OfferStats from './OfferStats';
import OfferRequestList from './OfferRequestList';
import OfferConversation from './OfferConversation';
import OfferQuoteForm from './OfferQuoteForm';
import OfferPriceCard from './OfferPriceCard';
import OfferDetailHeader from './OfferDetailHeader';
import Swal from 'sweetalert2';


export default function OffersPage(){ const {user}=useOfferAuth(); const {requestId:routeKey}=useParams(); const requestId=offerIdFromSlug(routeKey); return <OfferWorkspace key={`${user?.id || "signed-out"}:${requestId || "list"}`}/>; }
function OfferWorkspace() {
 const text=useOfferText(), {user,isLoggedIn,isAuthenticated}=useOfferAuth(), {requestId:requestSlug}=useParams(), location=useLocation(), navigate=useNavigate();
 const requestId=offerIdFromSlug(requestSlug);
 const signedIn=isLoggedIn ?? isAuthenticated;
 const [page,setPage]=useState(1),[filter,setFilter]=useState(''),[data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[actionSaved,setActionSaved]=useState(false),[refresh,setRefresh]=useState(0),[busy,setBusy]=useState(false),[activeAction,setActiveAction]=useState(''),[message,setMessage]=useState(''),[price,setPrice]=useState(''),[quoteMessage,setQuoteMessage]=useState(''),[validityDays,setValidityDays]=useState('5'),[now,setNow]=useState(()=>Date.now());

 const pending=useRef(false), actionKeys=useRef(new Map()), generation=useRef(0), alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{
  if(!signedIn)return;let active=true;
  queueMicrotask(()=>{if(active){setLoading(true);setError('');setActionSaved(false);setData(null);}});
  offerRequest(requestId?'detail':'list',requestId?{id:requestId}:{page,status:filter||null}).then(value=>{if(active)setData(previous=>mergeOfferUpdate(previous,value));}).catch(err=>{if(active)setError(offerError(err,text));}).finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 // Locale changes render existing data without resetting the draft.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[requestId,page,filter,refresh,signedIn,user?.id]);
 useEffect(()=>{
  if(!signedIn)return;
  let active=true,inFlight=false;
  const update=async()=>{
   if(!active||document.visibilityState!=='visible'||pending.current||inFlight)return;
   inFlight=true;const token=generation.current;
   try{
    const value=await offerRequest(requestId?'detail':'list',requestId?{id:requestId}:{page,status:filter||null});
    if(active&&alive.current&&token===generation.current)setData(previous=>mergeOfferUpdate(previous,value));
   }catch{/* Retain the saved view during a temporary background refresh failure. */}
   finally{inFlight=false;}
  };
  const timer=setInterval(update,requestId?2000:5000);
  window.addEventListener('focus',update);window.addEventListener('online',update);document.addEventListener('visibilitychange',update);
  return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',update);window.removeEventListener('online',update);document.removeEventListener('visibilitychange',update);};
 },[signedIn,requestId,user?.id,page,filter]);
 useEffect(()=>{
  if(!signedIn||!requestId||!data?.id||String(data.id)!==String(requestId))return;
  const path=offerDetailPath(offersBasePath,data);
  if(location.pathname!==path)navigate({pathname:path,search:location.search,hash:location.hash},{replace:true,state:location.state});
 },[signedIn,requestId,data,location.pathname,location.search,location.hash,location.state,navigate]);
 if(!signedIn)return <Navigate to={isVendorApp?'/auth/login':'/signin'} state={{from:location}} replace/>;
 const request=requestId?data:null;
 async function act(operation,extra={}) {
  if(pending.current||!request||error||isConversationClosed(request))return;pending.current=true;generation.current+=1;setBusy(true);setActiveAction(operation);setError('');setActionSaved(false);
  const payload={requestId:request.id,expectedRevision:request.revision,...extra};
  const signature=JSON.stringify([operation,payload]);
  if(!actionKeys.current.has(signature))actionKeys.current.set(signature,newIdempotencyKey());
  try {
   const send=()=>offerRequest(operation,{input:{...payload,idempotencyKey:actionKeys.current.get(signature)}});
   const result=['message','quote','decline','withdraw'].includes(operation)
    ?await performOfferAction({operation,before:request,expected:extra,side:isVendorApp?'VENDOR':'CUSTOMER',send,onConfirmed:()=>{if(['decline','withdraw'].includes(operation)&&alive.current){setMessage('');setData(previous=>previous?.id===request.id?{...previous,status:operation==='decline'?'DECLINED':'WITHDRAWN',permissions:operation==='decline'?{canMessage:false,canQuote:false,canAccept:false,canDecline:false}:{...previous.permissions,canAccept:false,canWithdraw:false}}:previous);}},load:()=>offerRequest('detail',{id:request.id})})
    :await send();
   if(!alive.current)return;
   setData(previous=>mergeOfferUpdate(previous,result));
   if(operation==='message')setMessage('');
   if(operation==='quote'){setPrice('');setValidityDays('5');setQuoteMessage('');}
   if(operation==='quote')void Swal.fire({icon:'success',titleText:text('Offer sent','Tilbud sendt'),text:formatMoney(result.quote?.pricePerPerson??extra.pricePerPerson,text)+text(' per person. The offer price and status have been updated.',' per person. Tilbudspris og status er oppdatert.'),confirmButtonText:text('Done','Ferdig'),confirmButtonColor:'#cf6e38',background:'#fffaf6',color:'#201b17'});
   else if(isVendorApp)void showVendorSuccessToast(operation==='withdraw'?text('Offer withdrawn','Tilbud trukket tilbake'):operation==='decline'?text('Request declined','Foresp\u00f8rsel avsl\u00e5tt'):text('Message sent','Melding sendt'));
   if(operation==='accept') {
    if(result.orderId){navigate((result.status==='ORDERED'?'/orders/':'/payment/')+encodeURIComponent(result.orderId));return;}
    const cart=acceptedOfferCart(result);
    if(!await storeAcceptedOffer(cart,user.id,text))return;
    navigate('/checkout/private');
   }
   } catch(err) {
   if(!alive.current)return;
   if(err.actionConfirmed){
    setActionSaved(true);
    if(operation==='message')setMessage('');
    if(operation==='quote'){setPrice('');setValidityDays('5');setQuoteMessage('');}
    setError(offerError(err,text));
    void showVendorSuccessToast(text('Saved. Refresh to load the latest details.','Lagret. Oppdater for \u00e5 laste de nyeste detaljene.'));
    return;
   }
   const feedback=offerError(err,text);setError(feedback);
   void Swal.fire({toast:true,position:'top-end',icon:'error',titleText:feedback,showConfirmButton:false,showCloseButton:true,timer:6000,timerProgressBar:true,background:'#fffaf6',color:'#49382e'});
   try{const latest=await offerRequest('detail',{id:request.id});if(alive.current)setData(previous=>mergeOfferUpdate(previous,latest));}catch{/* Keep the error and draft visible. */}
  }
  finally{pending.current=false;if(alive.current){setBusy(false);setActiveAction('');}}
 }
 async function acceptRequestedPrice(){
  if(pending.current||busy||error||!request)return;
  const quote=requestedPriceQuote(request,suggestedQuoteExpiry());
  if(!quote)return;
  const requestRevision=request.revision;
  const decision=await Swal.fire({
   titleText:text('Accept requested price?', 'Godta \u00f8nsket pris?'),
   text:text('Send the customer an offer at '+formatMoney(quote.pricePerPerson,text)+' per person. The customer must confirm it before checkout. Valid from when sent. Choose validity from 1 to 30 days. Times are shown in Norway time.', 'Send kunden et tilbud p\u00e5 '+formatMoney(quote.pricePerPerson,text)+' per person. Kunden m\u00e5 bekrefte f\u00f8r betaling. Gyldig fra sending. Velg gyldighet fra 1 til 30 dager. Tidspunkter vises i norsk tid.'),
   input:'number',inputLabel:text('Offer valid for (days, 1-30)','Tilbudet gjelder i (dager, 1-30)'),inputAttributes:{min:'1',max:'30',step:'1',inputmode:'numeric'},inputValue:'5',
   showCancelButton:true,confirmButtonText:text('Accept and send offer', 'Godta og send tilbud'),cancelButtonText:text('Cancel','Avbryt'),
   confirmButtonColor:'#cf6e38',background:'#fffaf6',color:'#201b17',reverseButtons:true,
   preConfirm:value=>{
    if(!validOfferDuration(value)){Swal.showValidationMessage(text('Enter a whole number from 1 to 30 days.','Skriv et heltall fra 1 til 30 dager.'));return false;}
    const input=requestedPriceQuote(request,quoteExpiresAt(value));
    if(!input){Swal.showValidationMessage(text('This request can no longer receive an offer.','Denne forespurselen kan ikke lenger motta et tilbud.'));return false;}
    return input;
   }
  });
  if(decision.isConfirmed&&alive.current&&!pending.current&&String(request.revision)===String(requestRevision))void act('quote',decision.value);
 }
 async function withdrawRequest(){
  if(pending.current||error||!request?._capabilities?.withdraw||!request.permissions?.canWithdraw||request.status!=='OFFERED')return;
  const decision=await confirmVendorAction({title:text('Withdraw this offer?','Trekke tilbake tilbudet?'),text:text('The customer will no longer be able to accept this price. The request stays open so you can send a new offer.','Kunden kan ikke lenger godta denne prisen. Forespørselen holdes åpen slik at du kan sende et nytt tilbud.'),confirmButtonText:text('Withdraw offer','Trekk tilbudet tilbake'),cancelButtonText:text('Keep offer','Behold tilbud'),icon:'warning'});
  if(decision.isConfirmed&&alive.current)void act('withdraw',{quoteRevision:request.quote.revision});
 }
 async function declineRequest(){
  if(pending.current)return;
  const decision=await confirmVendorAction({title:text('Reject this request?','Avsl\u00e5 foresp\u00f8rselen?'),text:text('The customer will see that this request has been declined.','Kunden vil se at foresp\u00f8rselen er avsl\u00e5tt.'),confirmButtonText:text('Reject request','Avsl\u00e5 foresp\u00f8rsel'),cancelButtonText:text('Keep request','Behold foresp\u00f8rsel'),icon:'warning'});
  if(decision.isConfirmed&&alive.current)void act('decline');
 }
 const current=isOfferCurrent(request,now),permissions=request&&['DECLINED','EXPIRED','CLOSED','ORDERED'].includes(request.status)?{}:request?.permissions||{};
 const closed=Boolean(request&&['DECLINED','EXPIRED','CLOSED','ORDERED'].includes(request.status));
 return <div className={`@container mx-auto max-w-[1180px] px-5 pb-7 text-[#1a1410] max-[650px]:px-3 ${requestId?"pt-1":"pt-6 max-[650px]:pt-5"} [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-3 [&_a:focus-visible]:outline-[#cf6e38]`}>
  {requestId?<div className="mb-3 flex items-center justify-between gap-3"><Link data-offer-back to={offersBasePath} className="inline-flex items-center gap-2 rounded-lg py-2 text-[14px]! text-[#a64d23] no-underline"><ArrowLeft size={16}/>{text('All requests','Alle foresp\u00f8rsler')}</Link><button type="button" disabled={loading||busy} onClick={()=>setRefresh(value=>value+1)} className="inline-flex items-center gap-2 rounded-lg border border-[#e3d9cf] bg-white px-3 py-2 text-[14px]! disabled:opacity-50"><RefreshCw size={15} className={loading?'animate-spin motion-reduce:animate-none':''}/>{text('Refresh','Oppdater')}</button></div>:(<header className="mb-6 flex items-start justify-between gap-4"><div><h1 className="type-h2 m-0 text-[#1a1410]">{request ? (isVendorApp?request.customerDisplayName:request.vendor?.name) : text(isVendorApp?'Offer requests':'My offers',isVendorApp?'Tilbudsforespørsler':'Mine tilbud')}</h1><p className="type-para mt-1 text-[#1a1410]">{request?request.menuName:text(isVendorApp?'Review requests, discuss the details and send a personal offer.':'Keep your requests, conversations and agreed prices in one place.',isVendorApp?'Se forespørsler, avklar detaljene og send et personlig tilbud.':'Samle forespørsler, samtaler og avtalte priser på ett sted.')}</p></div><button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-[13px] py-[9px] text-[14px]! font-semibold leading-[1.35] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#cf6e38] border-[#dce0e3] bg-white text-[#1a1410] shadow-[0_1px_2px_#18212a05] enabled:hover:bg-[#f7f8f9]" onClick={()=>setRefresh(value=>value+1)} disabled={loading||busy}><RefreshCw size={15} className={loading?"shrink-0 animate-spin motion-reduce:animate-none":""}/>{text('Refresh','Oppdater')}</button></header>)}

  {!requestId?<OfferStats key={refresh} text={text} filter={filter} onFilter={status=>{setFilter(status);setPage(1);}}/>:null}
  {location.state?.requestSent && !requestId?<div className="my-3 flex items-start gap-2 rounded-[9px] bg-[#e8f6ec] px-3.5 py-3 text-[14px]! leading-[1.6] text-[#347447]"><Check size={18}/>{text('Your request has been sent. You will receive an email when the vendor replies.','Forespørselen er sendt. Du får en e-post når leverandøren svarer.')}</div>:null}
  {requestId?null:<div className="flex items-center justify-between gap-4 rounded-t-[9px] border border-b-0 border-[#e6dfd8] bg-[#fffaf6] px-[18px] py-4 text-[15px]! font-[650] text-[#1a1410] max-[650px]:gap-3 max-[650px]:p-3 max-[380px]:flex-wrap [&_select]:w-[190px] [&_select]:max-w-full [&_select]:rounded-md [&_select]:border [&_select]:border-[#dce0e3] [&_select]:bg-white [&_select]:px-2.5 [&_select]:py-2 [&_select]:text-[14px]! [&_select]:text-[#1a1410] max-[650px]:[&_select]:w-[155px] max-[380px]:[&_select]:w-full [&_select:focus-visible]:outline-2 [&_select:focus-visible]:outline-offset-2 [&_select:focus-visible]:outline-[#cf6e38]"><span>{text('Your requests','Dine forespørsler')} {data?`(${data.totalCount})`:''}</span><select aria-label={text('Filter by status','Filtrer etter status')} value={filter} onChange={e=>{setFilter(e.target.value);setPage(1);}}><option value="">{text('All statuses','Alle statuser')}</option>{['WAITING_FOR_VENDOR','OFFERED','ACCEPTED','DECLINED','EXPIRED','CLOSED','ORDERED'].concat(data?._capabilities?.withdraw?['WITHDRAWN']:[]).map(status=><option value={status} key={status}>{offerStatus(status,text)}</option>)}</select></div>}
  {error?<div className={`my-3 flex items-start gap-2 rounded-[7px] border px-3.5 py-3 text-[14px]! leading-[1.6] ${actionSaved?"border-amber-300 bg-amber-50 text-amber-950":"border-[#f3d5cd] bg-[#fff2ef] text-[#a43a26]"}`} role={actionSaved?"status":"alert"}>{error}</div>:null}
  {loading?<div className="flex flex-col items-center gap-3 rounded-b-[9px] border border-[#e0e3e5] bg-white px-5 py-12 text-center text-[#1a1410] [&_h2]:text-[20px]! [&_h2]:font-semibold! [&_h2]:text-[#554232] [&_p]:text-[15px]!" role="status"><LoaderCircle className="shrink-0 animate-spin motion-reduce:animate-none" size={22}/>{text('Loading requests…','Laster forespørsler…')}</div>:!data?<div className="flex flex-col items-center gap-3 rounded-b-[9px] border border-[#e0e3e5] bg-white px-5 py-12 text-center text-[#1a1410] [&_h2]:text-[20px]! [&_h2]:font-semibold! [&_h2]:text-[#554232] [&_p]:text-[15px]!"><MessageSquare size={30}/><h2>{text('Unable to load offer requests','Kunne ikke laste tilbudsforesp\u00f8rsler')}</h2><p>{text('Please try again later. No request has been sent.','Prøv igjen senere. Ingen forespørsel er sendt.')}</p><button type="button" className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-[13px] py-[9px] text-[14px]! font-semibold leading-[1.35] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#cf6e38] border-[#dce0e3] bg-white text-[#1a1410] shadow-[0_1px_2px_#18212a05] enabled:hover:bg-[#f7f8f9]" onClick={()=>setRefresh(value=>value+1)}><RefreshCw size={16}/>{text('Retry','Pr\u00f8v igjen')}</button></div>:!requestId?<>
   {!data.items?.length?<div className="flex flex-col items-center gap-3 rounded-b-[9px] border border-[#e0e3e5] bg-white px-5 py-12 text-center text-[#1a1410] [&_h2]:text-[20px]! [&_h2]:font-semibold! [&_h2]:text-[#554232] [&_p]:text-[15px]!"><Tag size={30}/><h2>{text('No requests yet','Ingen forespørsler ennå')}</h2><p>{text(isVendorApp?'Incoming menu requests will appear here.':'Choose a menu, date, time and guest count to request an offer.',isVendorApp?'Innkommende menyforespørsler vises her.':'Velg meny, dato, tid og antall gjester for å be om et tilbud.')}</p></div>:<OfferRequestList items={data.items} text={text}/>}
   <footer className="mt-4 flex items-center justify-between gap-4 [&>p]:max-w-[520px] [&>p]:text-[13px]! [&>p]:leading-[1.6] [&>p]:text-[#1a1410] [&>div]:flex [&>div]:items-center [&>div]:gap-3 [&>div]:text-[14px]! max-[800px]:flex-col max-[800px]:items-start max-[650px]:[&>div]:w-full max-[650px]:[&>div]:justify-between"><p>{text('Vendors have 72 hours to respond. Offers have their own payment deadline.','Leverandøren har 72 timer til å svare. Tilbud har en egen betalingsfrist.')}</p><div><button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-[13px] py-[9px] text-[14px]! font-semibold leading-[1.35] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#cf6e38] border-[#dce0e3] bg-white text-[#1a1410] shadow-[0_1px_2px_#18212a05] enabled:hover:bg-[#f7f8f9]" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>{text('Previous','Forrige')}</button><span>{page} / {Math.max(1,data.pageCount||1)}</span><button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-[13px] py-[9px] text-[14px]! font-semibold leading-[1.35] no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#cf6e38] border-[#dce0e3] bg-white text-[#1a1410] shadow-[0_1px_2px_#18212a05] enabled:hover:bg-[#f7f8f9]" disabled={page>=data.pageCount} onClick={()=>setPage(p=>p+1)}>{text('Next','Neste')}</button></div></footer>
  </>:<>
   <OfferDetailHeader request={request} closed={closed} text={text}/><div className="grid grid-cols-1 items-start gap-4 @[850px]:grid-cols-[minmax(0,1fr)_310px]"><div className="min-w-0 order-2 @[850px]:order-1"><OfferConversation request={request} text={text} busy={busy||Boolean(error)} activeAction={activeAction} message={message} setMessage={setMessage} onSend={message=>act('message',{message})}/></div><div className="min-w-0 order-1 @[850px]:order-2"><OfferPriceCard request={request} text={text} current={current} closed={closed} permissions={permissions} busy={busy||Boolean(error)} activeAction={activeAction} error={error} onAccept={()=>act('accept',{quoteRevision:request.quote.revision})} onDecline={declineRequest} onWithdraw={withdrawRequest} onUseRequestedPrice={acceptRequestedPrice}/></div></div>
   {isVendorApp&&permissions.canQuote?<OfferQuoteForm request={request} text={text} busy={busy||Boolean(error)} activeAction={activeAction} price={price} setPrice={setPrice} validityDays={validityDays} setValidityDays={setValidityDays} quoteMessage={quoteMessage} setQuoteMessage={setQuoteMessage} now={now} onQuote={input=>act('quote',input)}/>:null}
   {isVendorApp?<p className="mt-[15px] text-[13px]! leading-[1.8] text-[#1a1410]">{text('12% commission applies to the amount paid. Refunds use the paid offer price. Guest changes after ordering require your approval.','12 % provisjon beregnes av betalt beløp. Refusjoner bruker betalt tilbudspris. Endret gjesteantall etter bestilling krever din godkjenning.')}</p>:null}
  </>}
 </div>;
}
