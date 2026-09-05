import { ImagePlus, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SupportAttachmentDropzone({
  disabled = false,
  error,
  fileName,
  onChange,
  onRemove,
}) {
  const { t } = useTranslation();
  return (
    <div>
      <label
        className={[
          "block rounded-[12px] border border-dashed px-4 py-6 text-center transition",
          disabled
            ? "cursor-not-allowed border-[#e4d8cf] bg-[#f7f3f0] text-[#a69486]"
            : "cursor-pointer border-[#d8d0c8] bg-[#fffdfb] hover:border-[#cf6e38] hover:bg-[#fff8f3]",
        ].join(" ")}
      >
        <input
          accept="image/png,image/jpeg,image/jpg,image/webp"
          disabled={disabled}
          className="sr-only"
          onChange={onChange}
          type="file"
        />
        <div
          className={[
            "mx-auto flex h-10 w-10 items-center justify-center rounded-full",
            disabled ? "bg-[#ede7e2] text-[#aa9d92]" : "bg-[#fff1ea] text-[#d96e39]",
          ].join(" ")}
        >
          <ImagePlus size={18} />
        </div>
        <p className="mt-3 text-[13px] font-semibold text-[#352b24]">
          {disabled ? t("support.attachmentUnavailable", { defaultValue: "Attachment unavailable" }) : fileName || t("support.uploadScreenshot", { defaultValue: "Upload screenshot" })}
        </p>
        <p className="mt-1 text-[11px] text-[#9b8f84]">
          {disabled
            ? "Ticket submission still works without a screenshot."
            : t("support.attachmentHint", { defaultValue: "PNG, JPG, JPEG or WEBP under 2MB" })}
        </p>
      </label>

      {fileName && !disabled ? (
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
