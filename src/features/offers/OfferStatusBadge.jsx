import { offerStatus } from './offerText';

export default function OfferStatusBadge({ status, text, children }) {
  const colors = {
    WAITING_FOR_VENDOR: 'bg-amber-50 text-amber-900 ring-amber-200',
    OFFERED: 'bg-blue-50 text-blue-900 ring-blue-200',
    ACCEPTED: 'bg-green-50 text-green-900 ring-green-200',
    ORDERED: 'bg-green-50 text-green-900 ring-green-200',
    DECLINED: 'bg-orange-50 text-orange-900 ring-orange-200',
    EXPIRED: 'bg-stone-100 text-stone-900 ring-stone-200',
    CLOSED: 'bg-slate-100 text-slate-900 ring-slate-200',
  };
  return (
    <span className={`inline-flex max-w-full items-center rounded-md px-2.5 py-1 text-[13px]! font-medium leading-5 ring-1 ring-inset ${colors[status] || 'bg-stone-100 text-stone-900 ring-stone-200'}`}>
      {children ?? offerStatus(status, text)}
    </span>
  );
}
