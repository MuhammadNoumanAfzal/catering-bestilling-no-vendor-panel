export function mergeOfferUpdate(previous, next) {
  // Declining is final for this request. A delayed earlier response must not reopen it.
  if (previous?.status === 'DECLINED' && String(previous.id) === String(next?.id) && next?.status !== 'DECLINED') return previous;
  if(String(previous?.id)===String(next?.id)){
    if(previous?.status==='WITHDRAWN'&&next?.status==='OFFERED'&&String(previous.quote?.revision)===String(next.quote?.revision))return previous;
    if(previous?.status==='ACCEPTED'&&['OFFERED','WAITING_FOR_VENDOR'].includes(next?.status))return previous;
  }
  return next;
}

export function isConversationClosed(request) {
  return ['DECLINED', 'EXPIRED', 'CLOSED', 'ORDERED'].includes(request?.status);
}
