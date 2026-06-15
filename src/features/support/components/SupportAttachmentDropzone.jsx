import { Upload } from "lucide-react";

export default function SupportAttachmentDropzone({ fileName }) {
  return (
    <div className="rounded-[8px] border border-dashed border-[#d8d0c8] bg-[#fffdfb] px-4 py-6 text-center">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1ea] text-[#d96e39]">
        <Upload size={14} />
      </div>
      <p className="mt-2 text-[12px] font-semibold text-[#6d6158]">
        {fileName || "Upload Screenshot"}
      </p>
      <p className="mt-1 text-[11px] text-[#9b8f84]">
        PNG, JPG, JPEG under 2MB
      </p>
    </div>
  );
}
