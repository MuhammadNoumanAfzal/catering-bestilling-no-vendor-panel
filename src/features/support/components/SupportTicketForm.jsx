import { useMemo, useState } from "react";
import SupportAttachmentDropzone from "./SupportAttachmentDropzone";
import SupportFieldSelect from "./SupportFieldSelect";
import { createSupportTicket } from "../api/supportApi";
import { uploadMenuImage } from "../../menu/api/menuUploadApi";
import {
  showSupportTicketSubmitted,
  showVendorErrorAlert,
} from "../../../utils/vendorAlerts";

const issueTypeOptions = [
  { value: "payout-delay", label: "Payout delayed" },
  { value: "earning-discrepancy", label: "Earning discrepancy" },
  { value: "order-management", label: "Order management issue" },
  { value: "unable-update-menu", label: "Unable to update menu" },
  { value: "delivery-config", label: "Delivery configuration issue" },
  { value: "store-visibility", label: "Store visibility issue" },
  { value: "account-verification", label: "Account verification issue" },
  { value: "customer-dispute", label: "Customer dispute" },
  { value: "technical-platform", label: "Technical platform bug" },
  { value: "notification", label: "Notification issue" },
  { value: "menu-upload", label: "Menu upload issue" },
  { value: "general-support", label: "General support request" },
];

const initialForm = {
  category: "vendor",
  issueType: "",
  relatedOrder: "",
  description: "",
};

export default function SupportTicketForm() {
  const [form, setForm] = useState(initialForm);
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState("");

  const descriptionCount = form.description.length;
  const isReadyToSubmit = useMemo(
    () => form.issueType && form.description.trim().length > 0,
    [form.description, form.issueType],
  );

  function handleFieldChange(field) {
    return (event) => {
      setSubmitted(false);
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  function handleCategoryChange(category) {
    setSubmitted(false);
    setForm((current) => ({
      ...current,
      category,
    }));
  }

  function handleAttachmentChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setSubmitted(false);
    setAttachmentError("");

    if (!nextFile) {
      setAttachment(null);
      return;
    }

    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(nextFile.type)) {
      setAttachment(null);
      setAttachmentError("Please upload a PNG, JPG, JPEG, or WEBP screenshot.");
      return;
    }

    if (nextFile.size > 2 * 1024 * 1024) {
      setAttachment(null);
      setAttachmentError("Please upload a screenshot under 2MB.");
      return;
    }

    setAttachment(nextFile);
  }

  function handleAttachmentRemove() {
    setAttachment(null);
    setAttachmentError("");
    setSubmitted(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isReadyToSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedAttachment = null;

      if (attachment) {
        uploadedAttachment = await uploadMenuImage(attachment);
      }

      const selectedIssueLabel =
        issueTypeOptions.find((option) => option.value === form.issueType)?.label || form.issueType;

      const result = await createSupportTicket({
        userRole: form.category,
        subject: selectedIssueLabel,
        relatedOrderId: form.relatedOrder,
        description: form.description,
        attachmentUrl: uploadedAttachment?.fileUrl || null,
        attachmentFileId: uploadedAttachment?.fileId || null,
      });

      setSubmitted(true);
      setSubmittedTicketId(result.ticketId || "");
      setForm(initialForm);
      setAttachment(null);
      setAttachmentError("");
      await showSupportTicketSubmitted();
    } catch (error) {
      await showVendorErrorAlert(
        error.message || "Unable to submit your support ticket right now.",
        "Support ticket failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_320px]">
      <div className="rounded-[18px] border border-[#e7ddd4] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(43,30,20,0.05)]">
        <div>
          <h2 className="type-h4 m-0 text-[#181310]">Submit a Support Ticket</h2>
          <p className="type-para mt-1 text-[#8d8074]">
            Share your issue and our team will get back to you with the right next steps.
          </p>
        </div>

        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div>
              <p className="text-[14px] font-bold text-[#2a211b]">I am a</p>
              <div className="mt-2 flex items-center gap-4">
                {[
                  { id: "customer", label: "Customer" },
                  { id: "vendor", label: "Vendor" },
                ].map((option) => {
                  const isChecked = form.category === option.id;

                  return (
                    <button
                      key={option.id}
                      className="inline-flex cursor-pointer items-center gap-2 text-[14px] font-semibold text-[#3c322b]"
                      onClick={() => handleCategoryChange(option.id)}
                      type="button"
                    >
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                          isChecked ? "border-[#d96e39]" : "border-[#bdb2a9]"
                        }`}
                      >
                        {isChecked ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d96e39]" />
                        ) : null}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
              <SupportFieldSelect
                label="Subject Issue Type"
                onChange={handleFieldChange("issueType")}
                options={issueTypeOptions}
                placeholder="Select issue type"
                value={form.issueType}
              />
              <label className="flex flex-col gap-1">
                <span className="text-[14px] font-bold text-[#2a211b]">
                  Related Order (Optional)
                </span>
                <input
                  className="h-[42px] w-full rounded-[8px] border border-[#d8d0c8] bg-white px-3 text-[14px] text-[#241913] outline-none transition placeholder:text-[#a69486] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
                  onChange={handleFieldChange("relatedOrder")}
                  placeholder="Enter Order ID (e.g. #1456)"
                  type="text"
                  value={form.relatedOrder}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[14px] font-bold text-[#2a211b]">Description</span>
              <textarea
                className="min-h-[118px] w-full resize-none rounded-[8px] border border-[#d8d0c8] bg-white px-3 py-3 text-[14px] text-[#241913] outline-none transition placeholder:text-[#a69486] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)]"
                maxLength={1200}
                onChange={handleFieldChange("description")}
                placeholder="Please describe your issue in detail..."
                value={form.description}
              />
              <span className="self-end text-[10px] text-[#a69486]">
                {descriptionCount}/1200
              </span>
            </label>

            <div>
              <p className="text-[14px] font-bold text-[#2a211b]">
                Attachment (Optional)
              </p>
              <div className="mt-2">
                <SupportAttachmentDropzone
                  error={attachmentError}
                  fileName={attachment?.name || ""}
                  onChange={handleAttachmentChange}
                  onRemove={handleAttachmentRemove}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
              <p className="text-[13px] font-semibold text-[#6f6258]">
                {submitted
                  ? submittedTicketId
                    ? `Ticket submitted successfully. Reference: ${submittedTicketId}.`
                    : "Ticket submitted successfully. Our support team will review it soon."
                  : "Our team usually responds within 24 hours."}
              </p>
              <button
                className="h-[42px] min-w-[140px] cursor-pointer rounded-[10px] bg-[#d96e39] px-5 text-[14px] font-bold text-white transition hover:bg-[#c9602c] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!isReadyToSubmit || isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <aside className="rounded-[18px] border border-[#eadfd6] bg-[#fffaf6] px-5 py-5 shadow-[0_10px_24px_rgba(43,30,20,0.04)]">
        <p className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#a06d4e]">
          Support Guide
        </p>
        <h3 className="mt-2 text-[20px] font-extrabold text-[#1f1915]">
          Help us resolve your issue faster
        </h3>
        <div className="mt-4 space-y-3 text-[13px] leading-[1.6] text-[#6e6259]">
          <p className="m-0">Choose the issue type that best matches your problem.</p>
          <p className="m-0">Add an order ID when your request is linked to a specific booking.</p>
          <p className="m-0">Attach a screenshot for menu, payout, or technical issues when possible.</p>
          <p className="m-0">For urgent account access problems, mention the affected email address in the description.</p>
        </div>

        <div className="mt-5 rounded-[14px] border border-[#eadfd6] bg-white px-4 py-4">
          <p className="m-0 text-[13px] font-bold text-[#2a211b]">Current API status</p>
          <p className="mt-2 text-[12px] leading-[1.6] text-[#7d7064]">
            Ticket submission is now API-based. If you want the issue-type dropdown to be fully API-driven too, backend should expose a support bootstrap query for issue type choices.
          </p>
        </div>
      </aside>
    </section>
  );
}
