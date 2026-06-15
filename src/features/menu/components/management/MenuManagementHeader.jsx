export default function MenuManagementHeader({ onCreateAddOn, onCreateMenu }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4 max-[720px]:flex-col">
      <div>
        <h1 className="type-h2 m-0 text-[#15110f]">Menu Management</h1>
        <p className="mt-1 text-[16px] font-medium text-[#746a62]">
          Manage your catering packages and seasonal offerings.
        </p>
      </div>

      <div className="flex items-center gap-2 max-[720px]:w-full max-[720px]:flex-col max-[720px]:items-stretch">
        <button
          className="h-[40px] cursor-pointer rounded-[8px] border border-[#e1c9bd] bg-white px-4 text-[14px] font-bold text-[#d96e39]"
          onClick={onCreateAddOn}
          type="button"
        >
          + Create Add-ons
        </button>
        <button
          className="h-[40px] cursor-pointer rounded-[8px] bg-[#d96e39] px-4 text-[14px] font-bold text-white"
          onClick={onCreateMenu}
          type="button"
        >
          + Create new menu
        </button>
      </div>
    </header>
  );
}
