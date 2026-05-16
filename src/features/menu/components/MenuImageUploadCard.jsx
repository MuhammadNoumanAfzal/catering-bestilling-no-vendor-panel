import { CloudUpload } from "lucide-react";

export default function MenuImageUploadCard() {
  return (
    <div className="flex flex-col gap-1">
      <span className="type-subpara text-[#19130f]">Product Image</span>
      <button
        className="flex h-[124px] w-full min-w-[230px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#c8c0b9] bg-[#fbf9f7] px-5 text-center max-[720px]:min-w-0"
        type="button"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#f0d4c6] bg-white text-[#db7848]">
          <CloudUpload size={13} />
        </span>
        <span className="type-subpara mt-3 text-[#2e251f]">Click or drag to upload</span>
        <span className="mt-1 text-[10px] font-medium text-[#aba097]">PNG, JPG or WEBP (Max. 25MB)</span>
      </button>
    </div>
  );
}
