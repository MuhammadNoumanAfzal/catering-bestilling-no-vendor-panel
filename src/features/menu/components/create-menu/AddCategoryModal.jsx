import { Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

export default function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
  onEdit,
  onDelete,
  options,
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

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [isSubmittingInline, setIsSubmittingInline] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const finalCategoriesList = options
    ? options.map((opt) => opt.label)
    : existingCategories || [];

  const handleCloseModal = () => {
    setNewCategoryName("");
    setError("");
    setEditingId(null);
    setEditName("");
    setDeleteConfirmId(null);
    setIsDeleting(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setError(emptyErrorMessage);
      return;
    }

    const exists = finalCategoriesList.some(
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

  const handleStartEdit = (option) => {
    setEditingId(option.value);
    setEditName(option.label);
    setDeleteConfirmId(null);
    if (error) setError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    if (error) setError("");
  };

  const handleSaveEdit = async (id) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setError(emptyErrorMessage);
      return;
    }

    const items = options || [];
    const exists = items.some(
      (opt) => opt.value !== id && opt.label.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setError(duplicateErrorMessage);
      return;
    }

    try {
      setIsSubmittingInline(true);
      if (onEdit) {
        await onEdit(id, trimmed);
      }
      setEditingId(null);
      setEditName("");
      setError("");
    } catch (submitError) {
      setError(submitError?.message || "Unable to update the category.");
    } finally {
      setIsSubmittingInline(false);
    }
  };

  const handleStartDelete = (id) => {
    setDeleteConfirmId(id);
    setEditingId(null);
    if (error) setError("");
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
    if (error) setError("");
  };

  const handleConfirmDelete = async (id) => {
    try {
      setIsDeleting(true);
      if (onDelete) {
        await onDelete(id);
      }
      setDeleteConfirmId(null);
      setError("");
    } catch (submitError) {
      setError(submitError?.message || "Unable to delete the item.");
    } finally {
      setIsDeleting(false);
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
              if (isSubmitting || isSubmittingInline || isDeleting) {
                return;
              }
              handleCloseModal();
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
              disabled={isSubmitting || isSubmittingInline || isDeleting}
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
                if (isSubmitting || isSubmittingInline || isDeleting) {
                  return;
                }
                handleCloseModal();
              }}
              type="button"
              disabled={isSubmitting || isSubmittingInline || isDeleting}
              className="h-[36px] px-3.5 rounded-lg border border-[#d6cdc4] bg-white text-[13px] font-extrabold text-[#3a2e25] hover:bg-[#faf8f6] active:scale-95 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSubmittingInline || isDeleting}
              className="h-[36px] px-4.5 rounded-lg bg-[#cf6e38] text-[13px] font-extrabold text-white hover:bg-[#bf622f] active:scale-95 transition cursor-pointer"
            >
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>

        {/* Existing Items List (Edit only, no delete) */}
        {options && options.length > 0 && (
          <div className="mt-5 border-t border-[#f2ece6] pt-4">
            <label className="mb-2 block text-[12px] font-bold text-[#746a62] uppercase tracking-wider">
              Existing {title.replace("Add New", "").replace("Category", "Categories").trim()}
            </label>
            <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
              {options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#f2ece6] bg-white p-2 hover:border-[#cf6e38]/20 transition"
                >
                  {editingId === option.value ? (
                    <div className="flex w-full items-center gap-1.5">
                      <input
                        type="text"
                        className="h-[30px] flex-1 rounded border border-[#d7cec4] bg-white px-2 text-[13px] text-[#1f1814] outline-none focus:border-[#cf6e38]"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                        disabled={isSubmittingInline}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(option.value)}
                        className="rounded bg-[#cf6e38] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#b85b2b] transition cursor-pointer"
                        disabled={isSubmittingInline}
                      >
                        {isSubmittingInline ? "Saving" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded border border-[#e8dfd5] bg-[#fffdfa] px-2 py-1 text-[11px] font-semibold text-[#746a62] hover:bg-[#faf8f6] transition cursor-pointer"
                        disabled={isSubmittingInline}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : deleteConfirmId === option.value ? (
                    <div className="flex w-full items-center justify-between gap-1.5 bg-red-50/50 p-1.5 rounded-lg border border-red-100 animate-pulse">
                      <span className="text-[11.5px] font-bold text-red-600">Delete?</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(option.value)}
                          className="rounded bg-red-600 px-2 py-0.5 text-[10.5px] font-bold text-white hover:bg-red-700 transition cursor-pointer"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "..." : "Yes"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          className="rounded border border-red-200 bg-white px-2 py-0.5 text-[10.5px] font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                          disabled={isDeleting}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-[13.5px] font-medium text-[#211913] truncate">
                        {option.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(option)}
                          disabled={isSubmitting || isSubmittingInline || isDeleting}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e8dfd5] text-[#746a62] hover:bg-[#faf8f6] hover:text-[#cf6e38] transition cursor-pointer disabled:opacity-50"
                        >
                          <Pencil size={11} />
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => handleStartDelete(option.value)}
                            disabled={isSubmitting || isSubmittingInline || isDeleting}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e8dfd5] text-[#746a62] hover:bg-red-50 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
