import { useEffect, useState } from 'react';
import { CheckCheck, Clock3, Files, RefreshCw, Send } from 'lucide-react';
import { fetchOfferStats } from './offerApi';

export default function OfferStats({ text, filter, onFilter }) {
  const [counts, setCounts] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true, inFlight = false;
    const update = async () => {
      if (!active || inFlight || document.visibilityState !== 'visible') return;
      inFlight = true;
      try {
        const result = await fetchOfferStats();
        if (active) { setCounts(result); setFailed(false); }
      } catch { if (active) setFailed(true); }
      finally { inFlight = false; }
    };
    void update();
    const timer = setInterval(update, 5000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
  }, [attempt]);

  if (failed) return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ecd9c9] bg-[#fff8f1] px-4 py-3 text-[14px]! text-[#1a1410]" role="status">
      <span>{text('Request totals could not be loaded.', 'Kunne ikke laste antall foresp\u00f8rsler.')}</span>
      <button type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }} className="inline-flex items-center gap-2 rounded-md px-2 py-1 font-semibold text-[#ae5127] focus-visible:outline-2 focus-visible:outline-[#cf6e38]"><RefreshCw size={15} />{text('Retry', 'Pr\u00f8v igjen')}</button>
    </div>
  );

  const cards = [
    { key: 'total', status: '', label: text('All requests', 'Alle foresp\u00f8rsler'), icon: <Files size={18} aria-hidden="true" />, tint: 'bg-[#fff1e6] text-[#bc5d2b]', active: 'border-[#d97a48] ring-[#d97a48]' },
    { key: 'waiting', status: 'WAITING_FOR_VENDOR', label: text('Awaiting your reply', 'Venter p\u00e5 svar'), icon: <Clock3 size={18} aria-hidden="true" />, tint: 'bg-amber-50 text-amber-700', active: 'border-amber-400 ring-amber-400' },
    { key: 'offered', status: 'OFFERED', label: text('Offers sent', 'Tilbud sendt'), icon: <Send size={18} aria-hidden="true" />, tint: 'bg-blue-50 text-blue-700', active: 'border-blue-400 ring-blue-400' },
    { key: 'ordered', status: 'ORDERED', label: text('Ordered', 'Bestilt'), icon: <CheckCheck size={18} aria-hidden="true" />, tint: 'bg-green-50 text-green-700', active: 'border-green-400 ring-green-400' },
  ];

  return (
    <section aria-label={text('Offer request statistics', 'Statistikk for tilbudsforesp\u00f8rsler')} aria-busy={!counts} className="mb-6 grid grid-cols-2 gap-3 @[850px]:grid-cols-4">
      {cards.map(({ key, status, label, icon, tint, active }) => (
        <button type="button" key={key} onClick={() => onFilter(status)} aria-pressed={filter === status}
          className={`flex min-w-0 items-start justify-between gap-2 rounded-xl border bg-white p-4 text-left text-[#1a1410] transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cf6e38] ${filter === status ? `${active} ring-1` : 'border-[#e6dfd8]'}`}>
          <div className="min-w-0"><p className="text-[14px]! leading-5 wrap-anywhere">{label}</p><strong className="mt-2 block text-[28px]! font-semibold leading-none tabular-nums">{counts ? counts[key] : '\u2014'}</strong></div>
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tint}`}>{icon}</span>
        </button>
      ))}
    </section>
  );
}
