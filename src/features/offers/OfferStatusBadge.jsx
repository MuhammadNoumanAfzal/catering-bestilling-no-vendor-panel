import { offerStatus } from './offerText';

export default function OfferStatusBadge({ status, text, children }) {
  const colors = {
    WAITING_FOR_VENDOR: 'bg-amber-700 text-white ring-amber-700',
    OFFERED: 'bg-blue-700 text-white ring-blue-700',
    ACCEPTED: 'bg-emerald-700 text-white ring-emerald-700',
    ORDERED: 'bg-emerald-700 text-white ring-emerald-700',
    DECLINED: 'bg-red-700 text-white ring-red-700',
    WITHDRAWN: 'bg-violet-700 text-white ring-violet-700',
    EXPIRED: 'bg-stone-600 text-white ring-stone-600',
    CLOSED: 'bg-slate-700 text-white ring-slate-700',
  };
  return (
    <span className={`inline-flex max-w-full items-center rounded-md px-2.5 py-1 text-[13px]! font-medium leading-5 ring-1 ring-inset ${colors[status] || 'bg-stone-600 text-white ring-stone-600'}`}>
      {children ?? offerStatus(status, text)}
    </span>
  );
}
