import { useNavigate } from "react-router-dom";

function formatReviewDate(value) {
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
  }).format(parsed);
}

function getStatusConfig(status) {
  switch (`${status ?? ""}`.trim().toUpperCase()) {
    case "CHANGES_REQUESTED":
      return {
        tone: "border-[#f2c7b9] bg-[#fff7f3]",
        titleColor: "text-[#8a311f]",
        bodyColor: "text-[#6e554b]",
        badge: "bg-[#fff1ea] text-[#c95e2c]",
        title: "Admin requested updates to your application",
        description:
          "Your vendor panel is still open so you can fix the required information. Review your business profile, images, hours, and account data, then save everything before asking for another review.",
        checklist: [
          "Update the profile fields that are incomplete or incorrect.",
          "Review logo, banner, business details, and schedule settings.",
          "Save your corrections so admin can review the latest version.",
        ],
      };
    case "REVIEWING":
      return {
        tone: "border-[#eadccf] bg-[#fffaf6]",
        titleColor: "text-[#7b4a1a]",
        bodyColor: "text-[#6e554b]",
        badge: "bg-[#fff3df] text-[#8a5318]",
        title: "Your application is under admin review",
        description:
          "Your submitted information is being reviewed. You can still keep your business information polished in case admin asks for changes.",
        checklist: [
          "Double-check business details and uploaded images.",
          "Keep contact information and hours up to date.",
        ],
      };
    case "PENDING_APPROVAL":
      return {
        tone: "border-[#eadccf] bg-[#fffaf6]",
        titleColor: "text-[#7b4a1a]",
        bodyColor: "text-[#6e554b]",
        badge: "bg-[#fff3df] text-[#8a5318]",
        title: "Your application is waiting for approval",
        description:
          "You can continue completing your business details while the application is pending. A more complete profile helps the admin approval process move faster.",
        checklist: [
          "Complete missing business and account information.",
          "Upload a clear logo and cover image if needed.",
          "Review hours, closures, and notification settings.",
        ],
      };
    case "REJECTED":
      return {
        tone: "border-[#efc4c1] bg-[#fff4f4]",
        titleColor: "text-[#972f2f]",
        bodyColor: "text-[#6c4f4f]",
        badge: "bg-[#ffe7e7] text-[#b33a3a]",
        title: "Your application was rejected",
        description:
          "You can still review your saved business information here, but the exact next step depends on admin/backend rules for resubmission.",
        checklist: [
          "Review all saved business information carefully.",
          "Contact admin or support if you need re-submission guidance.",
        ],
      };
    default:
      return null;
  }
}

export default function VendorApplicationStatusNotice({
  status = "",
  reviewedAt = "",
  changeRequestMessage = "",
  requestedFields = [],
  missingRequirements = [],
}) {
  const navigate = useNavigate();
  const config = getStatusConfig(status);
  const reviewedLabel = formatReviewDate(reviewedAt);
  const normalizedStatus = `${status}`.trim().toUpperCase();
  const shouldShowChangeRequestDetails = normalizedStatus === "CHANGES_REQUESTED";
  const detailFields = shouldShowChangeRequestDetails
    ? (requestedFields.length ? requestedFields : missingRequirements)
    : [];

  if (!config) {
    return null;
  }

  const requestReviewMessage =
    changeRequestMessage
    || "I have completed the requested changes. Please review my vendor application again.";

  function handleOpenReviewSupport() {
    const requestedItemSummary = detailFields
      .map((item) => item?.label || item?.code)
      .filter(Boolean)
      .join(", ");

    const descriptionLines = [
      "I have completed the requested application changes and would like admin to review my vendor profile again.",
      "",
      "Admin request:",
      requestReviewMessage,
    ];

    if (requestedItemSummary) {
      descriptionLines.push("", `Updated items: ${requestedItemSummary}`);
    }

    navigate("/support", {
      state: {
        initialSupportForm: {
          issueType: "account-verification",
          description: descriptionLines.join("\n"),
        },
      },
    });
  }

  return (
    <section className={`mb-4 rounded-[20px] border px-5 py-5 shadow-[0_8px_24px_rgba(56,34,18,0.05)] ${config.tone}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[760px]">
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${config.badge}`}>
            {status || "Application Update"}
          </span>
          <h2 className={`mt-3 text-[26px] font-extrabold tracking-[-0.03em] ${config.titleColor}`}>
            {config.title}
          </h2>
          <p className={`mt-2 text-[14px] leading-7 ${config.bodyColor}`}>
            {config.description}
          </p>
          {reviewedLabel ? (
            <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#8e776a]">
              Last reviewed on {reviewedLabel}
            </p>
          ) : null}
          {shouldShowChangeRequestDetails && changeRequestMessage ? (
            <div className="mt-4 rounded-[16px] border border-white/80 bg-white/80 px-4 py-4">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
                Message From Admin
              </p>
              <p className="mt-2 text-[14px] leading-7 text-[#4f433c]">
                {changeRequestMessage}
              </p>
            </div>
          ) : null}
        </div>

        <div className="min-w-[240px] rounded-[16px] border border-white/80 bg-white/70 p-4 backdrop-blur">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
            Next Steps
          </p>
          <div className="mt-3 space-y-2">
            {config.checklist.map((item) => (
              <div key={item} className="rounded-[12px] bg-white px-3 py-2 text-[13px] leading-6 text-[#5f4f46]">
                {item}
              </div>
            ))}
          </div>
          {shouldShowChangeRequestDetails ? (
            <div className="mt-4 flex flex-col gap-2">
              <button
                className="inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#d96e39] px-4 text-[14px] font-bold text-white transition hover:bg-[#c9602c]"
                onClick={handleOpenReviewSupport}
                type="button"
              >
                I fixed the changes
              </button>
              <p className="text-[12px] leading-5 text-[#7a675d]">
                This opens a support ticket so admin can re-check your updated application.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {detailFields.length ? (
        <div className="mt-4 rounded-[16px] border border-white/80 bg-white/75 p-4">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
            Requested Items
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {detailFields.map((item) => (
              <span
                key={`${item.code}-${item.label}`}
                className="rounded-full border border-[#ead8ca] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5f4f46]"
              >
                {item.label || item.code}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
