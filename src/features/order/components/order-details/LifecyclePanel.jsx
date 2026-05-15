import DetailPanel from "./DetailPanel";

export default function LifecyclePanel({ actions, onActionClick }) {
  return (
    <DetailPanel title="Order Lifecycle">
      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`min-h-[30px] rounded border text-[11px] font-bold ${
              action.primary
                ? "border-[#cf6e38] bg-[#cf6e38] text-white"
                : "border-[#d8cec4] bg-white text-[#2b231e]"
            }`}
            onClick={() => onActionClick?.(action)}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </DetailPanel>
  );
}
