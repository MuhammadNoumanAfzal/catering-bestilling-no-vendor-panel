import { moneyToOre, redactContact } from './offerModel.js';
// A mutation acknowledgement and refreshing its details are separate outcomes.
export async function performOfferAction({ operation, before, send, load, onConfirmed, expected, side }) {
  try {
    const saved = await send();
    if (!saved?.id || String(saved.id) !== String(before.id)) throw new Error('Offer response unavailable');
  } catch (error) {
    // A declined state loaded after a lost response confirms the intended outcome.
    if (['decline','withdraw'].includes(operation) && before.status !== (operation==='decline'?'DECLINED':'WITHDRAWN')) {
      try {
        const latest = await load();
        if (String(latest?.id) === String(before.id) && latest.status === (operation==='decline'?'DECLINED':'WITHDRAWN') &&
            latest.revision != null && String(latest.revision) !== String(before.revision)) return latest;
      } catch { /* Keep the original action error. */ }
    }
    const code=error?.code||error?.graphqlErrors?.[0]?.extensions?.code;
    if (expected && (!code || ['INTERNAL_SERVER_ERROR','NETWORK_ERROR'].includes(code)) && ['quote','message'].includes(operation)) {
      try {
        const latest=await load();
        if(String(latest?.id)===String(before.id)&&String(latest.revision)!==String(before.revision)){
          if(operation==='quote'&&latest.status==='OFFERED'&&latest.quote?.revision&&String(latest.quote.revision)!==String(before.quote?.revision)&&moneyToOre(latest.quote.pricePerPerson)===moneyToOre(expected.pricePerPerson)&&Date.parse(latest.quote.expiresAt)===Date.parse(expected.expiresAt))return latest;
          const previousIds=new Set((before.messages||[]).map(message=>String(message.id)));
          if(operation==='message'&&side&&latest.messages?.some(message=>!previousIds.has(String(message.id))&&message.side===side&&message.text===redactContact(expected.message)))return latest;
        }
      } catch { /* Keep the original failure unless the exact saved change is visible. */ }
    }
    throw error;
  }

  onConfirmed?.();

  try {
    const latest = await load();
    if (!latest?.id || String(latest.id) !== String(before.id)) throw new Error('Offer response unavailable');
    if (['decline','withdraw'].includes(operation) && latest.status !== (operation==='decline'?'DECLINED':'WITHDRAWN')) throw new Error('Updated state not yet available');
    return latest;
  } catch (cause) {
    const error = new Error('The action was saved, but the latest details could not be loaded.', { cause });
    error.code = 'OFFER_DETAILS_REFRESH_FAILED';
    error.actionConfirmed = true;
    throw error;
  }
}
