import { AlertCircle } from "lucide-react";
import { useState } from "react";

export default function SettingsDeleteStoreModal({ onCancel, onConfirm }) {
  const [confirmationText, setConfirmationText] = useState("");
  const isReadyToDelete = confirmationText.trim().toUpperCase() === "DELETE";

  function handleConfirm() {
    if (!isReadyToDelete) {
      return;
    }

    onConfirm();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
      <div
        aria-modal="true"
        className="w-full max-w-[470px] rounded-[12px] bg-white p-4 shadow-[0_28px_70px_rgba(0,0,0,0.32)]"
        role="dialog"
      >
        <h2 className="type-h2 m-0 text-[#ff2918]">Delete Store Permanently?</h2>
        <p className="mt-3 text-[11px] leading-[1.45] text-[#5b514a]">
          This action is permanent and cannot be undone. All menus, orders,
          customer data, and store settings will be permanently deleted from our
          servers.
        </p>

        <div className="mt-4 rounded-[6px] bg-[#f5f5f5] px-2.5 py-2">
          <div className="flex items-start gap-2 text-[#4c423d]">
            <AlertCircle className="mt-[1px] shrink-0" size={12} />
            <p className="text-[9px] leading-[1.35]">
              You can contact <span className="font-bold underline">customer support</span>{" "}
              if you need help recovering specific account data before proceeding.
            </p>
          </div>
        </div>

        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-medium text-[#443934]">
            Type <span className="font-bold text-[#ff2918]">DELETE</span> to confirm
          </span>
          <input
            className="h-[30px] rounded-[4px] bg-[#efefef] px-2 text-[10px] text-[#201712] outline-none transition placeholder:text-[#948980] focus:ring-2 focus:ring-[#ff2918]/15"
            onChange={(event) => setConfirmationText(event.target.value)}
            placeholder="Delete"
            type="text"
            value={confirmationText}
          />
        </label>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            className="cursor-pointer px-3 py-2 text-[10px] font-bold text-[#1f1814]"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="cursor-pointer rounded-[4px] bg-[#ff2918] px-3 py-2 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:bg-[#ffb8b0]"
            disabled={!isReadyToDelete}
            onClick={handleConfirm}
            type="button"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
