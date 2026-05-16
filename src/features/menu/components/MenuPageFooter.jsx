export default function MenuPageFooter() {
  return (
    <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[#ece4dc] pt-4 text-[9px] font-semibold text-[#1d1612] max-[720px]:flex-col max-[720px]:items-start">
      <span className="text-[#1d1612]">©2026 Cateringbestilling All rights reserved</span>
      <div className="flex flex-wrap items-center gap-4 text-[#211914]">
        <button className="cursor-pointer" type="button">
          Privacy Policy
        </button>
        <button className="cursor-pointer" type="button">
          Terms of Service
        </button>
        <button className="cursor-pointer" type="button">
          Help Center
        </button>
      </div>
    </footer>
  );
}
