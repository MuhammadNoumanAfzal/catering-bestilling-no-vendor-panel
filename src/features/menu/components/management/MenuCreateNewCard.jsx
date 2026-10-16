import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MenuCreateNewCard({ onClick, isAddOn = false }) {
  const { t } = useTranslation();
  return (
    <button
      className="flex min-h-[312px] cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed border-[#cfc5bc] bg-white px-4 text-center shadow-[0_2px_10px_rgba(43,30,20,0.03)]"
      onClick={onClick}
      type="button"
    >
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#efefef] text-[#aaa29a]">
        <Plus size={22} />
      </span>
      <strong className="text-[16px] font-extrabold text-[#4c423b]">{t(isAddOn ? "menu.addOnProductTitle" : "menu.addOffering")}</strong>
      <p className="mt-2 max-w-[180px] text-[14px] font-medium leading-[1.45] text-[#9b9086]">
        {t(isAddOn ? "menu.addOnProductDescription" : "menu.addOfferingDescription")}
      </p>
    </button>
  );
}
