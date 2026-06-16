import { X } from "lucide-react";
import { useState } from "react";

export default function AddCategoryModal({ isOpen, onClose, onAdd, existingCategories }) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setError("Category name cannot be empty.");
      return;
    }

    // Check if duplicate case-insensitive
    const exists = existingCategories.some(
      (cat) => cat.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError("This category already exists.");
      return;
    }

    onAdd(trimmed);
    setNewCategoryName("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px] animate-fade-in">
      <div className="relative w-full max-w-[380px] rounded-[18px] border border-[#e8dfd5] bg-[#fffdfa] p-5 shadow-[0_20px_50px_rgba(58,40,25,0.18)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f2ece6]">
          <h2 className="text-[16px] font-extrabold text-[#211913] m-0">
            Add New Category
          </h2>
          <button
            onClick={() => {
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
            <label className="mb-1.5 block text-[12px] font-bold text-[#211913] uppercase tracking-wide">
              Category Name
            </label>
            <input
              type="text"
              autoFocus
              className="h-[42px] w-full rounded-lg border border-[#d7cec4] bg-white px-3 text-[14px] text-[#1f1814] outline-none transition placeholder:text-[#aea39a] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
              placeholder="e.g. Cocktail Party, Brunch"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (error) setError("");
              }}
            />
            {error && (
              <span className="text-[11px] font-semibold text-red-500 mt-1 block">
                {error}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setNewCategoryName("");
                setError("");
                onClose();
              }}
              type="button"
              className="h-[36px] px-3.5 rounded-lg border border-[#d6cdc4] bg-white text-[12px] font-extrabold text-[#3a2e25] hover:bg-[#faf8f6] active:scale-95 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[36px] px-4.5 rounded-lg bg-[#cf6e38] text-[12px] font-extrabold text-white hover:bg-[#bf622f] active:scale-95 transition cursor-pointer"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
