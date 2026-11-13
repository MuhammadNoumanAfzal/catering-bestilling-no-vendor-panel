import {descriptionText} from "../../../../components/shared/descriptionFormatting.js";
import {formatMoney} from "../../../../utils/formatMoney.js";
import {Copy,ImageIcon,Pencil,Trash2,ArrowUpRight} from "lucide-react";
import {useTranslation} from "react-i18next";
function formatMenuCardPrice(item, t) {
  if (!item.rawMenu || !item.basePrice) {
    return item.price;
  }

  const amount = Number(item.basePrice);
  const formattedAmount = formatMoney(amount);
  const suffix = item.pricingType === "per-person"
    ? t("menu.pricingShortLabels.perPerson", { defaultValue: "pr person" })
    : item.pricingType
      ? t(`menu.pricingLabels.${item.pricingType}`, { defaultValue: item.pricingType })
      : "";

  return suffix ? `${formattedAmount} ${suffix}` : formattedAmount;
}


export default function MenuOfferingCard({actionsDisabled=false,item,onDelete,onEdit,onView,onDuplicate,onToggleStatus}) {
 const {t}=useTranslation();
 const isActive=item.status==="Active";
 const statusLabel=item.status==="Paused"?t("menu.paused"):item.status==="Active"?t("menu.active"):item.status==="Draft"?t("menu.draft"):item.status;
 const description=descriptionText(item.description==="No description provided."?t("menu.noDescriptionProvided"):item.description==="Optional add-on"?t("menu.optionalAddon"):item.description);
 const open=()=>item.isAddOn?onEdit(item):onView(item);
 return <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e7ddd5] bg-white shadow-sm transition-shadow hover:shadow-md">
  <button type="button" onClick={open} className="relative block h-40 w-full shrink-0 overflow-hidden bg-[#f4efea] text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#c96432]" aria-label={item.title}>
   {item.image?<img alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" src={item.image}/>:<div className="flex h-full items-center justify-center text-[#b3a69a]"><ImageIcon size={32}/></div>}
   <span className={"absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm "+(isActive?"bg-[#eff9f0] text-[#2c7040]":item.status==="Draft"?"bg-[#eff2fc] text-[#5d68a2]":"bg-[#fff4da] text-[#946c19]")}><span className={"h-1.5 w-1.5 rounded-full "+(isActive?"bg-[#39854b]":item.status==="Draft"?"bg-[#7d8ac0]":"bg-[#c59432]")}/>{statusLabel}</span>
   <span className="absolute right-3 top-3 max-w-[55%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#68574a]">{item.badge==="Menu"?t("menu.menuLabel"):item.badge==="Add-on"?t("menu.addonLabel"):item.badge}</span>
  </button>
  <div className="flex flex-1 flex-col p-4">
   <button type="button" onClick={open} className="flex items-start justify-between gap-2 text-left text-[#282019] hover:text-[#b45c30] focus-visible:outline-2 focus-visible:outline-[#c96432]"><h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6">{item.title}</h3><ArrowUpRight size={16} aria-hidden="true" className="mt-1 shrink-0 text-[#ac9a8a]"/></button>
   <p className="mt-2 line-clamp-3 h-[60px] text-[13px] leading-5 text-[#837365]">{description}</p>
   <div className="mt-auto pt-4">
    <strong className="block text-[19px] font-bold leading-7 tracking-tight text-[#2e231b]">{formatMenuCardPrice(item,t)}</strong>
    <span className="mt-0.5 block text-xs leading-5 text-[#9b8b7d]">{item.rawMenu?(item.minimumGuests?t("menu.minimumGuestLabel",{count:Number(item.minimumGuests)}):t("menu.flexibleGuests")):item.meta==="Available add-on"?t("menu.availableAddon"):item.meta}</span>
   </div>
   <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0e8e1] pt-3">
    <div className="flex items-center gap-1">
     {[[Pencil,"edit",onEdit],[Copy,"duplicate",onDuplicate],[Trash2,"delete",onDelete]].map(([Icon,key,handler])=><button key={key} type="button" disabled={actionsDisabled} title={t("menu."+key)} aria-label={t("menu."+key)+": "+item.title} onClick={()=>handler(item)} className={"inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#927d6c] transition focus-visible:outline-2 focus-visible:outline-[#c96432] disabled:opacity-40 "+(key==="delete"?"hover:bg-red-50 hover:text-red-600":"hover:bg-[#faf1e9] hover:text-[#b45c30]")}><Icon size={16}/></button>)}
    </div>
    <button type="button" role="switch" aria-checked={isActive} aria-label={t("menu.active")+": "+item.title} disabled={actionsDisabled} onClick={()=>onToggleStatus(item)} className="inline-flex items-center gap-2 rounded-lg py-1.5 pl-2 text-xs font-medium text-[#847363] focus-visible:outline-2 focus-visible:outline-[#c96432] disabled:opacity-40">
     <span>{statusLabel}</span><span className={"flex h-[22px] w-10 items-center rounded-full p-[3px] transition-colors "+(isActive?"bg-[#529565]":"bg-[#c9b9a9]")}><span className={"h-4 w-4 rounded-full bg-white shadow-sm transition-transform "+(isActive?"translate-x-[18px]":"translate-x-0")}/></span>
    </button>
   </div>
  </div>
 </article>;
}
