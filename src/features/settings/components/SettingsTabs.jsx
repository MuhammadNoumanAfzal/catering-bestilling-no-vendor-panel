const tabs = [
  { id: "business", label: "Business Profile" },
  { id: "security", label: "Account & Security" },
];

export default function SettingsTabs({ activeTab, onChange }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={`cursor-pointer rounded-[8px] px-3 py-2 text-[13px] font-bold transition ${
              isActive
                ? "bg-[#de6f39] text-white shadow-[0_8px_20px_rgba(222,111,57,0.22)]"
                : "text-[#2b221d]"
            }`}
            onClick={() => onChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
