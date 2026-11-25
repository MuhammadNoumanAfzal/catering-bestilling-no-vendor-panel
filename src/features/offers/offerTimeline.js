export function offerTimeline(request) {
  const messages=(request.messages||[]).map(item=>({...item,kind:'message',key:'message:'+item.id}));
  const events=(request.events||[]).filter(item=>item?.id&&item.type&&item.createdAt).map(item=>({...item,kind:'event',key:'event:'+item.id}));
  return [...new Map([...messages,...events].map(item=>[item.key,item])).values()].sort((a,b)=>(Date.parse(a.createdAt)||0)-(Date.parse(b.createdAt)||0)||a.key.localeCompare(b.key));
}
export function offerEventLabel(type, text) {
 const labels={OFFER_SENT:['Offer sent','Tilbud sendt'],OFFER_CHANGED:['Offer changed','Tilbud endret'],OFFER_WITHDRAWN:['Offer withdrawn','Tilbud trukket tilbake'],OFFER_DECLINED:['Request declined','Foresp\u00f8rsel avsl\u00e5tt'],OFFER_ACCEPTED:['Offer accepted','Tilbud godtatt'],OFFER_REQUESTED:['Offer requested','Tilbud forespurt']};
 return text(...(labels[type]||['Offer updated','Tilbud oppdatert']));
}
