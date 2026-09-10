import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import { CloudUpload } from "lucide-react";

export default function MenuImageUploadCard() {
  useTranslation();
  return (
    <div className="flex flex-col gap-1">
      <span className="type-subpara text-[#19130f]"> {i18n.t("vendorMessages.productImage")} </span>
      <button
        className="flex h-[124px] w-full min-w-[230px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#c8c0b9] bg-[#fbf9f7] px-5 text-center max-[720px]:min-w-0"
        type="button"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#f0d4c6] bg-white text-[#db7848]">
          <CloudUpload size={13} />
        </span>
        <span className="type-subpara mt-3 text-[#2e251f]"> {i18n.t("vendorMessages.dragUpload")} </span>
        <span className="mt-1 text-[10px] font-medium text-[#aba097]"> {i18n.t("vendorMessages.format25")} </span>
      </button>
    </div>
  );
}
