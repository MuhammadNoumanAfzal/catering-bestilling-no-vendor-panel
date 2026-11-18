import { useEffect, useState } from 'react';
import { requestOfferGraphql, useOfferAuth } from './offerBridge';
import { useOfferText } from './offerText';
const pending=new Map();
export const ORDER_OFFERS_QUERY=`query OrderOfferSummaries($orderIds:[ID!]!) { orderOfferSummaries(orderIds:$orderIds) { orderId requestId quoteRevision pricePerPerson personCount amountPaid currency } }`;
function loadOrderOffer(orderId,owner){
 return new Promise(resolve=>{
  let batch=pending.get(owner);
  if(!batch){batch=[];pending.set(owner,batch);queueMicrotask(async()=>{pending.delete(owner);const ids=[...new Set(batch.map(item=>item.id))];try{const data=await requestOfferGraphql(ORDER_OFFERS_QUERY,{orderIds:ids});for(const item of batch)item.resolve(data?.orderOfferSummaries?.find(row=>String(row.orderId)===item.id)||null);}catch{for(const item of batch)item.resolve(null);}});}
  batch.push({id:String(orderId),resolve});
 });
}
export default function OrderOfferBadge({orderId}){
 const text=useOfferText(),{user}=useOfferAuth(),[data,setData]=useState(null);
 useEffect(()=>{if(!orderId||!user?.id)return;let active=true;loadOrderOffer(orderId,String(user.id)).then(value=>{if(active)setData(value?{owner:String(user.id),orderId:String(orderId),...value}:null);});return()=>{active=false;};},[orderId,user?.id]);
 if(!data||data.owner!==String(user?.id)||String(data.orderId)!==String(orderId))return null;
 return <span className="inline-flex rounded-full bg-[#fff0e1] px-2 py-1 text-[10px] font-semibold text-[#b35c2a]" title={`${data.pricePerPerson} NOK ${text('per person','per person')}`}>{text('Offer','Tilbud')}</span>;
}
