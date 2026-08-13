import { FileBadge2, Send, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import SettingsSectionCard from "./SettingsSectionCard";

function formatUploadedAt(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function getStatusTone(item) {
  if (item.notifiedAdminAt) {
    return "border-[#d9eadf] bg-[#eef8f1] text-[#287946]";
  }

  if (item.asset?.fileUrl) {
    return "border-[#efd8bf] bg-[#fff6eb] text-[#a15a1d]";
  }

  return "border-[#e4d8cf] bg-[#f7f3ef] text-[#7b6b60]";
}

function getStatusLabel(item) {
  if (item.notifiedAdminAt) {
    return "Sent for review";
  }

  if (item.asset?.fileUrl) {
    return "Uploaded";
  }

  return "Missing";
}

export default function SettingsComplianceDocumentsSection({
  disabled = false,
  documents = [],
  onUpload,
  onRemove,
  onSendForReview,
  sendDisabled = false,
}) {
  return (
    <SettingsSectionCard
      description="Upload the legal and operational proofs needed before your vendor account can be approved."
      title="Compliance Documents"
      headerRight={
        <span className="rounded-full bg-[#fff3ea] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#bf6739]">
          Approval docs
        </span>
      }
    >
      <div className="rounded-[14px] border border-[#f0dfd3] bg-[#fffaf6] px-4 py-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-[#cf6e38]" size={18} />
          <div>
            <p className="text-[13px] font-bold text-[#211914]">
              Upload image-based copies of your required business documents
            </p>
            <p className="mt-1 text-[12px] leading-6 text-[#7d6f65]">
              This panel currently supports <span className="font-semibold">PNG, JPG, and WEBP</span>.
              After uploading, use <span className="font-semibold">Send to Admin Review</span> so your
              files can be followed up through the existing support workflow.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {documents.map((item) => (
          <article
            key={item.type}
            className="rounded-[16px] border border-[#e6d9cf] bg-[#fffefd] p-4 shadow-[0_3px_10px_rgba(43,30,20,0.04)]"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#fff2e8] text-[#cf6e38]">
                    <FileBadge2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-bold text-[#1f1712]">{item.title}</h3>
                    <p className="text-[12px] leading-5 text-[#86776d]">{item.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getStatusTone(item)}`}>
                    {getStatusLabel(item)}
                  </span>
                  <span className="rounded-full border border-[#ece0d6] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#76685f]">
                    {item.acceptedFormatsLabel}
                  </span>
                  {item.isRequired ? (
                    <span className="rounded-full border border-[#f0d2c0] bg-[#fff6ef] px-2.5 py-1 text-[11px] font-semibold text-[#b35e2a]">
                      Required
                    </span>
                  ) : null}
                </div>

                {item.asset?.fileUrl ? (
                  <div className="mt-3 rounded-[14px] border border-[#eadfd6] bg-white px-3 py-3 text-[12px] leading-6 text-[#62554d]">
                    <p className="font-bold text-[#251c17]">{item.asset.name || "Uploaded file"}</p>
                    {formatUploadedAt(item.asset.uploadedAt) ? (
                      <p className="mt-0.5 text-[#8b7c72]">
                        Uploaded on {formatUploadedAt(item.asset.uploadedAt)}
                      </p>
                    ) : null}
                    <a
                      className="mt-2 inline-flex text-[#cf6e38] underline underline-offset-2"
                      href={item.asset.fileUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open uploaded proof
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 rounded-[14px] border border-dashed border-[#e8dad0] bg-[#fcfaf8] px-3 py-3 text-[12px] leading-6 text-[#7b6f66]">
                    No document uploaded yet for this requirement.
                  </div>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-[12px] bg-[#d96e39] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_14px_24px_rgba(217,110,57,0.22)] transition hover:bg-[#c9602c]">
                  <UploadCloud size={15} />
                  {item.asset?.fileUrl ? "Replace" : "Upload"}
                  <input
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    disabled={disabled}
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      if (file) {
                        onUpload?.(item.type, file);
                      }
                      event.target.value = "";
                    }}
                    type="file"
                  />
                </label>
                <button
                  className="inline-flex items-center gap-2 rounded-[12px] border border-[#e7d6cb] bg-white px-4 py-2.5 text-[13px] font-bold text-[#6f6259] transition hover:bg-[#faf6f2] disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled || !item.asset?.fileUrl}
                  onClick={() => onRemove?.(item.type)}
                  type="button"
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-[16px] border border-[#eadccf] bg-white px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[14px] font-bold text-[#1f1712]">Ready to notify admin?</p>
            <p className="mt-1 text-[12px] leading-6 text-[#7c6d63]">
              This sends your uploaded document links through the current support workflow until a
              dedicated backend compliance document API is connected.
            </p>
          </div>
          <button
            className="inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#201813] px-5 text-[13px] font-bold text-white transition hover:bg-[#362922] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled || sendDisabled}
            onClick={onSendForReview}
            type="button"
          >
            <Send size={15} />
            Send to Admin Review
          </button>
        </div>
      </div>
    </SettingsSectionCard>
  );
}
