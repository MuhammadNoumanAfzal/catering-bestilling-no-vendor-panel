import { useEffect, useState } from 'react';
import { offerRequest } from './offerApi';
import { useOfferText } from './offerText';
import { Link } from 'react-router-dom';
import './Offers.css';
export default function OfferDashboardCard() {
 const text=useOfferText();const [data,setData]=useState(null);
 useEffect(()=>{let active=true;const load=()=>offerRequest('list',{status:'WAITING_FOR_VENDOR',page:1}).then(result=>{if(active)setData(result);}).catch(()=>{if(active)setData(null);});load();const timer=setInterval(load,30000);return()=>{active=false;clearInterval(timer);};},[]);
 return <section className="rounded-2xl border border-[#eed4be] bg-[#fff7ed] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">{text('New offer requests','Nye tilbudsforespørsler')} {data?<span className="offer-status">{data.totalCount}</span>:null}</h2><p className="mt-1 text-xs text-[#97785e]">{text('Reply within 72 hours. Send a price, a message or decline.','Svar innen 72 timer. Send en pris, en melding eller avslå.')}</p></div><Link className="offer-button primary" to="/offers">{text('View requests','Se forespørsler')}</Link></div>{data?.items?.length?<div className="mt-4 grid gap-2">{data.items.slice(0,3).map(item=><Link key={item.id} to={`/offers/${encodeURIComponent(item.id)}`} className="flex justify-between gap-3 rounded-lg bg-white px-3 py-3 text-xs"><strong>{item.menuName}</strong><span>{item.deliveryDate} · {item.personCount} {text('guests','gjester')}</span></Link>)}</div>:null}</section>;
}
