import { X } from "lucide-react";
import { useState } from "react";

export default function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
  existingCategories,
  title = "Add New Category",
  fieldLabel = "Category Name",
  placeholder = "e.g. Cocktail Party, Brunch",
  emptyErrorMessage = "Value cannot be empty.",
  duplicateErrorMessage = "This value already exists.",
  submitLabel = "Add",
  submittingLabel = "Adding...",
}) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setError(emptyErrorMessage);
      return;
    }

    const exists = existingCategories.some(
      (cat) => cat.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError(duplicateErrorMessage);
      return;
    }

    try {
      setIsSubmitting(true);
      await onAdd(trimmed);
      setNewCategoryName("");
      setError("");
    } catch (submitError) {
      setError(submitError?.message || "Unable to create the category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] animate-fade-in">
      <div className="relative w-full max-w-[380px] rounded-[18px] border border-[#e8dfd5] bg-[#fffdfa] p-5 shadow-[0_20px_50px_rgba(58,40,25,0.18)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f2ece6]">
          <h2 className="text-[18px] font-extrabold text-[#211913] m-0">
            {title}
          </h2>
          <button
            onClick={() => {
              if (isSubmitting) {
                return;
              }
              setNewCategoryName("");
              setError("");
              onClose();
            }}
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e8dfd5] bg-[#fffdfa] text-[#746a62] hover:bg-[#faf8f6] hover:text-[#cf6e38] transition focus:outline-none active:scale-90 cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-[#211913] uppercase tracking-wide">
              {fieldLabel}
            </label>
            <input
              type="text"
              autoFocus
              className="h-[42px] w-full rounded-lg border border-[#d7cec4] bg-white px-3 text-[14px] text-[#1f1814] outline-none transition placeholder:text-[#aea39a] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
              placeholder={placeholder}
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (error) setError("");
              }}
              disabled={isSubmitting}
            />
            {error && (
              <span className="text-[12px] font-semibold text-red-500 mt-1 block">
                {error}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                if (isSubmitting) {
                  return;
                }
                setNewCategoryName("");
                setError("");
                onClose();
              }}
              type="button"
              disabled={isSubmitting}
              className="h-[36px] px-3.5 rounded-lg border border-[#d6cdc4] bg-white text-[13px] font-extrabold text-[#3a2e25] hover:bg-[#faf8f6] active:scale-95 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[36px] px-4.5 rounded-lg bg-[#cf6e38] text-[13px] font-extrabold text-white hover:bg-[#bf622f] active:scale-95 transition cursor-pointer"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
