import { useTranslation } from "react-i18next";

export default function ReviewsPageHeader() {
  const { t } = useTranslation();
  return (
    <header className="mb-5">
      <h1 className="type-h2 m-0 text-[#15110f]">{t("reviews.title", { defaultValue: "Reviews & Ratings" })}</h1>
      <p className="type-para mt-1">
        {t("reviews.subtitle", { defaultValue: "Manage and analyze your customer feedback loop." })}
      </p>
    </header>
  );
}
