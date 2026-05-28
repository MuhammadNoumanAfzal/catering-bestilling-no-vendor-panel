export default function SettingsFooter() {
  return (
    <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[#ece4dc] pt-4 text-[11px] font-semibold text-[#1d1612] max-[720px]:flex-col max-[720px]:items-start">
      <span className="type-subpara text-[#1d1612]">
        ©2026 Cateringbestilling All rights reserved
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <button className="type-subpara cursor-pointer text-[#1d1612]" type="button">
          Privacy Policy
        </button>
        <button className="type-subpara cursor-pointer text-[#1d1612]" type="button">
          Terms of Service
        </button>
        <button className="type-subpara cursor-pointer text-[#1d1612]" type="button">
          Help Center
        </button>
      </div>
    </footer>
  );
}
