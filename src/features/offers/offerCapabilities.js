let pending;
const required = (fields, names) => names.every(name => fields?.some(field => field.name === name));
export function getOfferCapabilities(send) {
  if (!pending) pending = send(`query OfferCapabilities {
    __schema { mutationType { fields { name } } }
    request: __type(name:"MenuOfferRequestType") { fields { name } }
    permissions: __type(name:"OfferPermissions") { fields { name } }
    quote: __type(name:"MenuOfferQuoteType") { fields { name } }
    event: __type(name:"OfferEventType") { fields { name } }
    withdrawal: __type(name:"WithdrawMenuOfferInput") { inputFields { name } }
    statuses: __type(name:"OfferRequestStatus") { enumValues { name } }
  }`, {}).then(data => ({
    quoteTiming: required(data?.quote?.fields,['startsAt','isActive','isScheduled']),
    events: required(data?.request?.fields,['events']) && required(data?.event?.fields,['id','type','side','text','createdAt','pricePerPerson','status','quoteRevision']),
    withdraw: required(data?.__schema?.mutationType?.fields,['withdrawMenuOffer']) && required(data?.permissions?.fields,['canWithdraw']) && required(data?.withdrawal?.inputFields,['requestId','expectedRevision','quoteRevision','idempotencyKey']) && required(data?.statuses?.enumValues,['WITHDRAWN']),
  })).catch(() => ({events:false,withdraw:false,quoteTiming:false}));
  return pending;
}
