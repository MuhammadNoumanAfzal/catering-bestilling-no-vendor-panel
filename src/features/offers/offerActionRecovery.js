// A mutation acknowledgement and refreshing its details are separate outcomes.
export async function performOfferAction({ operation, before, send, load }) {
  try {
    const saved = await send();
    if (!saved?.id || String(saved.id) !== String(before.id)) throw new Error('Offer response unavailable');
  } catch (error) {
    // A declined state loaded after a lost response confirms the intended outcome.
    if (operation === 'decline' && before.status !== 'DECLINED') {
      try {
        const latest = await load();
        if (String(latest?.id) === String(before.id) && latest.status === 'DECLINED' &&
            latest.revision != null && String(latest.revision) !== String(before.revision)) return latest;
      } catch { /* Keep the original action error. */ }
    }
    throw error;
  }

  try {
    const latest = await load();
    if (!latest?.id || String(latest.id) !== String(before.id)) throw new Error('Offer response unavailable');
    return latest;
  } catch (cause) {
    const error = new Error('The action was saved, but the latest details could not be loaded.', { cause });
    error.code = 'OFFER_DETAILS_REFRESH_FAILED';
    error.actionConfirmed = true;
    throw error;
  }
}
