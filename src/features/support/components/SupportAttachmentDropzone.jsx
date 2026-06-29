import { ImagePlus, X } from "lucide-react";

export default function SupportAttachmentDropzone({ error, fileName, onChange, onRemove }) {
  return (
    <div>
      <label className="block cursor-pointer rounded-[12px] border border-dashed border-[#d8d0c8] bg-[#fffdfb] px-4 py-6 text-center transition hover:border-[#cf6e38] hover:bg-[#fff8f3]">
        <input
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="sr-only"
          onChange={onChange}
          type="file"
        />
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1ea] text-[#d96e39]">
          <ImagePlus size={18} />
        </div>
        <p className="mt-3 text-[13px] font-semibold text-[#352b24]">
          {fileName || "Upload screenshot"}
        </p>
        <p className="mt-1 text-[11px] text-[#9b8f84]">
          PNG, JPG, JPEG or WEBP under 2MB
        </p>
      </label>

      {fileName ? (
        <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#eadfd6] bg-[#fff8f3] px-3 py-2">
          <span className="truncate text-[12px] font-semibold text-[#6d6158]">{fileName}</span>
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e1d5ca] bg-white text-[#8b7768] transition hover:text-[#c85f2a]"
            onClick={onRemove}
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-[12px] font-semibold text-[#d94f3d]">{error}</p> : null}
    </div>
  );
}
