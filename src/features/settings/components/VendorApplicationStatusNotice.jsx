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
          "Your vendor panel is still open so you can fix the required information. Review your business profile, address, hours, bank details, documents, images, delivery timing, and menu setup, then save everything before asking for another review.",
        checklist: [
          "Complete business profile details like business name, address, contact number, tax number, and description.",
          "Upload or correct your logo, banner, and any missing compliance documents.",
          "Review business hours here, then check Delivery timings and Menu items on their own pages.",
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
          "Your submitted information is being reviewed. You can still keep your profile polished by checking business details, images, payout details, delivery timing, and menu completeness.",
        checklist: [
          "Double-check address, contact details, business hours, and uploaded images.",
          "Make sure payout bank details and compliance documents are complete.",
          "Keep delivery schedule and menu items up to date.",
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
          "You can continue completing your business details while the application is pending. A complete profile with correct address, timing, bank details, documents, images, delivery schedule, and menu helps the admin approval process move faster.",
        checklist: [
          "Fill out business and account information, including address, phone number, tax number, and description.",
          "Upload a clear profile image or logo, banner image, and all required compliance documents.",
          "Review business hours here and make sure delivery timing is correct on the Delivery page.",
          "Check your Menu page and add complete menu items so the store is ready to go live.",
          "Save bank payout details so finance information is ready for review.",
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

function hasValue(value) {
  return Boolean(String(value ?? "").trim());
}

function hasBusinessProfileCompleted(settings) {
  return [
    settings?.businessName,
    settings?.businessEmail,
    settings?.phoneNumber,
    settings?.businessAddress,
    settings?.businessDescription,
  ].every(hasValue);
}

function hasBrandAssetsCompleted(settings) {
  return Boolean(settings?.profileImage?.fileUrl) && Boolean(settings?.bannerImage?.fileUrl);
}

function hasBusinessHoursCompleted(settings) {
  const hours = Array.isArray(settings?.hours) ? settings.hours : [];

  return hours.some(
    (item) =>
      item?.enabled &&
      hasValue(item?.open) &&
      hasValue(item?.close) &&
      item.open !== "Closed" &&
      item.close !== "Closed",
  );
}

function hasPayoutDetailsCompleted(settings) {
  const payoutProfile = settings?.payoutProfile || {};

  return [
    payoutProfile.accountHolderName,
    payoutProfile.bankName,
    payoutProfile.billingAddress,
    payoutProfile.city,
    payoutProfile.postalCode,
    payoutProfile.country,
  ].every(hasValue) && (hasValue(payoutProfile.accountNumber) || hasValue(payoutProfile.iban));
}

function getRejectedDocuments(documents = []) {
  return documents.filter((item) => item?.status === "REJECTED");
}

function hasRequiredDocumentsUploaded(documents = []) {
  const requiredDocuments = documents.filter((item) => item?.isRequired);

  return (
    requiredDocuments.length > 0 &&
    requiredDocuments.every((item) => Boolean(item?.fileUrl) && item?.status !== "REJECTED")
  );
}

function buildChecklistItems({ status, settings, complianceDocuments }) {
  const normalizedStatus = `${status ?? ""}`.trim().toUpperCase();
  const checklistItems = [];
  const rejectedDocuments = getRejectedDocuments(complianceDocuments);

  if (rejectedDocuments.length) {
    checklistItems.push(
      `Replace rejected document${rejectedDocuments.length > 1 ? "s" : ""}: ${rejectedDocuments.map((item) => item.title).join(", ")}.`,
    );
  }

  if (!hasBusinessProfileCompleted(settings)) {
    checklistItems.push(
      "Fill out your business details like business name, email, phone number, address, and description.",
    );
  }

  if (!hasBrandAssetsCompleted(settings)) {
    checklistItems.push("Upload both your logo/profile image and banner image.");
  }

  if (!hasRequiredDocumentsUploaded(complianceDocuments) && !rejectedDocuments.length) {
    checklistItems.push("Upload all required compliance documents so your application can move forward.");
  }

  if (!hasBusinessHoursCompleted(settings)) {
    checklistItems.push("Add your business opening hours so customers and admin can review your availability.");
  }

  if (!hasPayoutDetailsCompleted(settings)) {
    checklistItems.push("Save your payout bank details so finance information is ready for review.");
  }

  if (normalizedStatus === "CHANGES_REQUESTED") {
    checklistItems.push("After updating the requested items, send a review request so admin can check them again.");
  } else if (normalizedStatus === "PENDING_APPROVAL" || normalizedStatus === "REVIEWING") {
    checklistItems.push("Review your Delivery and Menu pages so timing and menu setup are ready before go-live.");
  }

  return checklistItems;
}

export default function VendorApplicationStatusNotice({
  status = "",
  reviewedAt = "",
  changeRequestMessage = "",
  requestedFields = [],
  missingRequirements = [],
  complianceDocuments = [],
  settings = null,
}) {
  const navigate = useNavigate();
  const config = getStatusConfig(status);
  const reviewedLabel = formatReviewDate(reviewedAt);
  const normalizedStatus = `${status}`.trim().toUpperCase();
  const shouldShowChangeRequestDetails = normalizedStatus === "CHANGES_REQUESTED";
  const detailFields = shouldShowChangeRequestDetails
    ? (requestedFields.length ? requestedFields : missingRequirements)
    : [];
  const dynamicChecklist = buildChecklistItems({
    status,
    settings,
    complianceDocuments,
  });
  const rejectedDocuments = getRejectedDocuments(complianceDocuments);
  const checklistItems = dynamicChecklist.length ? dynamicChecklist : config.checklist;

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

  function handleOpenDelivery() {
    navigate("/delivery");
  }

  function handleOpenMenu() {
    navigate("/menu");
  }

  return (
    <section className={`mb-4 overflow-hidden rounded-[24px] border shadow-[0_14px_34px_rgba(56,34,18,0.06)] ${config.tone}`}>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="px-5 py-5 sm:px-6 sm:py-6">
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
            <div className="mt-4 rounded-[18px] border border-white/80 bg-white/85 px-4 py-4">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
                Message From Admin
              </p>
              <p className="mt-2 text-[14px] leading-7 text-[#4f433c]">
                {changeRequestMessage}
              </p>
            </div>
          ) : null}
          {rejectedDocuments.length ? (
            <div className="mt-4 rounded-[18px] border border-[#f1c6c1] bg-[#fff8f7] px-4 py-4">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#a03f34]">
                Needs Attention First
              </p>
              <p className="mt-2 text-[14px] leading-7 text-[#684741]">
                One or more compliance documents were rejected. Replace them first so the rest of your review can move forward.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {rejectedDocuments.map((item) => (
                  <span
                    key={item.type}
                    className="rounded-full border border-[#f0d0cb] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#9f4337]"
                  >
                    {item.title}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
                Approval Checklist
              </p>
              <p className="text-[12px] font-semibold text-[#8c776b]">
                Complete these before go-live
              </p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {checklistItems.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[16px] border border-white/80 bg-white/80 px-4 py-4 shadow-[0_8px_22px_rgba(56,34,18,0.04)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5e4d8] text-[12px] font-extrabold text-[#c4602f]">
                      {index + 1}
                    </span>
                    <p className="text-[14px] leading-6 text-[#5f4f46]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="inline-flex h-[46px] items-center justify-center rounded-[14px] border border-[#ead8ca] bg-white px-4 text-[14px] font-bold text-[#5f4f46] transition hover:bg-[#faf6f2]"
              onClick={handleOpenDelivery}
              type="button"
            >
              Open Delivery
            </button>
            <button
              className="inline-flex h-[46px] items-center justify-center rounded-[14px] border border-[#ead8ca] bg-white px-4 text-[14px] font-bold text-[#5f4f46] transition hover:bg-[#faf6f2]"
              onClick={handleOpenMenu}
              type="button"
            >
              Open Menu
            </button>
            {shouldShowChangeRequestDetails ? (
              <button
                className="inline-flex h-[46px] items-center justify-center rounded-[14px] bg-[#d96e39] px-4 text-[14px] font-bold text-white transition hover:bg-[#c9602c]"
                onClick={handleOpenReviewSupport}
                type="button"
              >
                I fixed the changes
              </button>
            ) : null}
          </div>
          {shouldShowChangeRequestDetails ? (
            <p className="mt-3 text-[12px] leading-5 text-[#7a675d]">
              This opens a support ticket so admin can re-check your updated application.
            </p>
          ) : null}
        </div>

        <div className="border-t border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(255,255,255,0.9)_100%)] px-5 py-5 backdrop-blur xl:border-l xl:border-t-0">
          <div className="rounded-[18px] border border-white/80 bg-white/80 p-4 shadow-[0_8px_24px_rgba(56,34,18,0.04)]">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
              Next Steps
            </p>
            <div className="mt-3 space-y-2">
              {checklistItems.map((item) => (
                <div key={item} className="rounded-[12px] bg-[#fffaf7] px-3 py-2.5 text-[13px] leading-6 text-[#5f4f46]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {detailFields.length ? (
            <div className="mt-4 rounded-[18px] border border-white/80 bg-white/80 p-4 shadow-[0_8px_24px_rgba(56,34,18,0.04)]">
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

          <div className="mt-4 rounded-[18px] border border-white/80 bg-white/80 p-4 shadow-[0_8px_24px_rgba(56,34,18,0.04)]">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
              Focus Areas
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                "Business profile",
                "Logo and banner",
                "Business hours",
                "Bank details",
                "Documents",
                "Delivery timing",
                "Menu setup",
                "Account info",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[12px] border border-[#efe1d6] bg-[#fffaf7] px-3 py-2 text-[12px] font-semibold text-[#5f4f46]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
