import { useTranslation } from "react-i18next";

export default function MenuManagementHeader({ onCreateAddOn, onCreateMenu, onCreateSingleProduct }) {
  const { t } = useTranslation();
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="m-0 text-[26px] font-bold leading-tight tracking-tight sm:text-[30px] text-[#15110f]">{t("menu.management", { defaultValue: "Menu Management" })}</h1>
        <p className="mt-1.5 text-sm text-[#746a62]">
          {t("menu.managementDescription", { defaultValue: "Manage your catering packages and seasonal offerings." })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 max-[720px]:w-full max-[720px]:flex-col max-[720px]:items-stretch">
        <button
          className="min-h-10 cursor-pointer rounded-lg border border-[#e1c9bd] bg-white px-4 py-2 text-sm font-bold text-[#d96e39]"
          onClick={onCreateSingleProduct}
          type="button"
        >
          {t("menu.createSingleProduct")}
        </button>
        <button
          className="h-[40px] cursor-pointer rounded-[8px] border border-[#e1c9bd] bg-white px-4 text-[14px] font-bold text-[#d96e39]"
          onClick={onCreateAddOn}
          type="button"
        >
          {t("menu.createAddOns", { defaultValue: "+ Create Add-ons" })}
        </button>
        <button
          className="h-[40px] cursor-pointer rounded-[8px] bg-[#d96e39] px-4 text-[14px] font-bold text-white"
          onClick={onCreateMenu}
          type="button"
        >
          {t("menu.createMenu", { defaultValue: "+ Create new menu" })}
        </button>
      </div>
    </header>
  );
}
