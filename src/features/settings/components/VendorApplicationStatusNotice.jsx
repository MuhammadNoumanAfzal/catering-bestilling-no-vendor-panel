import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function formatReviewDate(value, locale = "en-GB") {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getStatusConfig(status, t) {
  switch (`${status ?? ""}`.trim().toUpperCase()) {
    case "CHANGES_REQUESTED":
      return {
        tone: "border-[#f2c7b9] bg-[#fff7f3]",
        titleColor: "text-[#8a311f]",
        bodyColor: "text-[#6e554b]",
        badge: "bg-[#fff1ea] text-[#c95e2c]",
        title: t("settings.applicationStatus.changesRequested.title"),
        description: t("settings.applicationStatus.changesRequested.description"),
        checklist: [
          t("settings.applicationStatus.changesRequested.checklist.profile"),
          t("settings.applicationStatus.changesRequested.checklist.brandAssets"),
          t("settings.applicationStatus.changesRequested.checklist.deliveryAndMenu"),
          t("settings.applicationStatus.changesRequested.checklist.save"),
        ],
      };
    case "REVIEWING":
      return {
        tone: "border-[#eadccf] bg-[#fffaf6]",
        titleColor: "text-[#7b4a1a]",
        bodyColor: "text-[#6e554b]",
        badge: "bg-[#fff3df] text-[#8a5318]",
        title: t("settings.applicationStatus.reviewing.title"),
        description: t("settings.applicationStatus.reviewing.description"),
        checklist: [
          t("settings.applicationStatus.reviewing.checklist.profile"),
          t("settings.applicationStatus.reviewing.checklist.payout"),
          t("settings.applicationStatus.reviewing.checklist.deliveryAndMenu"),
        ],
      };
    case "PENDING_APPROVAL":
      return {
        tone: "border-[#eadccf] bg-[#fffaf6]",
        titleColor: "text-[#7b4a1a]",
        bodyColor: "text-[#6e554b]",
        badge: "bg-[#fff3df] text-[#8a5318]",
        title: t("settings.applicationStatus.pending.title"),
        description: t("settings.applicationStatus.pending.description"),
        checklist: [
          t("settings.applicationStatus.pending.checklist.profile"),
          t("settings.applicationStatus.pending.checklist.brandAssets"),
          t("settings.applicationStatus.pending.checklist.delivery"),
          t("settings.applicationStatus.pending.checklist.menu"),
          t("settings.applicationStatus.pending.checklist.payout"),
        ],
      };
    case "REJECTED":
      return {
        tone: "border-[#efc4c1] bg-[#fff4f4]",
        titleColor: "text-[#972f2f]",
        bodyColor: "text-[#6c4f4f]",
        badge: "bg-[#ffe7e7] text-[#b33a3a]",
        title: t("settings.applicationStatus.rejected.title"),
        description: t("settings.applicationStatus.rejected.description"),
        checklist: [
          t("settings.applicationStatus.rejected.checklist.review"),
          t("settings.applicationStatus.rejected.checklist.support"),
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

function hasPayoutDetailsCompleted(settings) {
  const payoutProfile = settings?.payoutProfile || {};

  return [
    payoutProfile.accountHolderName,
    payoutProfile.bankName,
    payoutProfile.accountNumber,
  ].every(hasValue);
}

function buildChecklistItems({ settings, t }) {
  const checklistItems = [];

  if (!hasBusinessProfileCompleted(settings)) {
    checklistItems.push(
      t("settings.applicationStatus.dynamicChecklist.profile"),
    );
  }

  if (!hasBrandAssetsCompleted(settings)) {
    checklistItems.push(t("settings.applicationStatus.dynamicChecklist.brandAssets"));
  }

  if (!hasPayoutDetailsCompleted(settings)) {
    checklistItems.push(t("settings.applicationStatus.dynamicChecklist.payout"));
  }

  return checklistItems;
}

export default function VendorApplicationStatusNotice({
  status = "",
  reviewedAt = "",
  changeRequestMessage = "",
  requestedFields = [],
  missingRequirements = [],
  settings = null,
}) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const config = getStatusConfig(status, t);
  const reviewedLabel = formatReviewDate(reviewedAt, i18n.language);
  const normalizedStatus = `${status}`.trim().toUpperCase();
  const shouldShowChangeRequestDetails = normalizedStatus === "CHANGES_REQUESTED";
  const detailFields = shouldShowChangeRequestDetails
    ? (requestedFields.length ? requestedFields : missingRequirements)
    : [];
  const dynamicChecklist = buildChecklistItems({
    settings,
    t,
  });
  const requestBasedChecklist = detailFields
    .map((item) => item?.label || item?.code || "")
    .filter(Boolean);
  const checklistItems = dynamicChecklist.length
    ? dynamicChecklist
    : requestBasedChecklist.length
      ? requestBasedChecklist
      : [];

  if (!config) {
    return null;
  }

  const requestReviewMessage =
    changeRequestMessage
    || t("settings.applicationStatus.defaultReviewRequest");

  function handleOpenReviewSupport() {
    const requestedItemSummary = detailFields
      .map((item) => item?.label || item?.code)
      .filter(Boolean)
      .join(", ");

    const descriptionLines = [
      t("settings.applicationStatus.supportIntro"),
      "",
      t("settings.applicationStatus.adminRequest"),
      requestReviewMessage,
    ];

    if (requestedItemSummary) {
      descriptionLines.push("", t("settings.applicationStatus.updatedItems", { items: requestedItemSummary }));
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
            {t(`settings.applicationStatus.badges.${normalizedStatus}`, { defaultValue: t("settings.applicationStatus.applicationUpdate") })}
          </span>
          <h2 className={`mt-3 text-[24px] font-bold tracking-[-0.03em] ${config.titleColor}`}>
            {config.title}
          </h2>
          <p className={`mt-2 text-[14px] leading-7 ${config.bodyColor}`}>
            {config.description}
          </p>
          {reviewedLabel ? (
            <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#8e776a]">
              {t("settings.applicationStatus.lastReviewed", { date: reviewedLabel })}
            </p>
          ) : null}
          {shouldShowChangeRequestDetails && changeRequestMessage ? (
            <div className="mt-4 rounded-[18px] border border-white/80 bg-white/85 px-4 py-4">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
                {t("settings.applicationStatus.messageFromAdmin")}
              </p>
              <p className="mt-2 text-[14px] leading-7 text-[#4f433c]">
                {changeRequestMessage}
              </p>
            </div>
          ) : null}

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
                {t("settings.applicationStatus.approvalChecklist")}
              </p>
              <p className="text-[12px] font-semibold text-[#8c776b]">
                {checklistItems.length ? t("settings.applicationStatus.completeBeforeGoLive") : t("settings.applicationStatus.currentStatus")}
              </p>
            </div>
            {checklistItems.length ? (
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
            ) : (
              <div className="mt-3 rounded-[16px] border border-white/80 bg-white/80 px-4 py-4 shadow-[0_8px_22px_rgba(56,34,18,0.04)]">
                <p className="text-[14px] leading-6 text-[#5f4f46]">
                  {t("settings.applicationStatus.completeMessage")}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="inline-flex h-[46px] items-center justify-center rounded-[14px] border border-[#ead8ca] bg-white px-4 text-[14px] font-bold text-[#5f4f46] transition hover:bg-[#faf6f2]"
              onClick={handleOpenDelivery}
              type="button"
            >
              {t("settings.applicationStatus.openDelivery")}
            </button>
            <button
              className="inline-flex h-[46px] items-center justify-center rounded-[14px] border border-[#ead8ca] bg-white px-4 text-[14px] font-bold text-[#5f4f46] transition hover:bg-[#faf6f2]"
              onClick={handleOpenMenu}
              type="button"
            >
              {t("settings.applicationStatus.openMenu")}
            </button>
            {shouldShowChangeRequestDetails ? (
              <button
                className="inline-flex h-[46px] items-center justify-center rounded-[14px] bg-[#d96e39] px-4 text-[14px] font-bold text-white transition hover:bg-[#c9602c]"
                onClick={handleOpenReviewSupport}
                type="button"
              >
                {t("settings.applicationStatus.fixedChanges")}
              </button>
            ) : null}
          </div>
          {shouldShowChangeRequestDetails ? (
            <p className="mt-3 text-[12px] leading-5 text-[#7a675d]">
              {t("settings.applicationStatus.supportHint")}
            </p>
          ) : null}
        </div>

        <div className="border-t border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(255,255,255,0.9)_100%)] px-5 py-5 backdrop-blur xl:border-l xl:border-t-0">
          <div className="rounded-[18px] border border-white/80 bg-white/80 p-4 shadow-[0_8px_24px_rgba(56,34,18,0.04)]">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
              {t("settings.applicationStatus.nextSteps")}
            </p>
            {checklistItems.length ? (
              <div className="mt-3 space-y-2">
                {checklistItems.map((item) => (
                  <div key={item} className="rounded-[12px] bg-[#fffaf7] px-3 py-2.5 text-[13px] leading-6 text-[#5f4f46]">
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-[12px] bg-[#fffaf7] px-3 py-3 text-[13px] leading-6 text-[#5f4f46]">
                {t("settings.applicationStatus.noMissingItems")}
              </div>
            )}
          </div>

          {detailFields.length ? (
            <div className="mt-4 rounded-[18px] border border-white/80 bg-white/80 p-4 shadow-[0_8px_24px_rgba(56,34,18,0.04)]">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8c776b]">
                {t("settings.applicationStatus.requestedItems")}
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
              {t("settings.applicationStatus.focusAreas")}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {["businessProfile", "logoAndBanner", "bankDetails", "deliveryTiming", "menuSetup", "accountInfo"].map((item) => (
                <div
                  key={item}
                  className="rounded-[12px] border border-[#efe1d6] bg-[#fffaf7] px-3 py-2 text-[12px] font-semibold text-[#5f4f46]"
                >
                  {t(`settings.applicationStatus.focus.${item}`)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


