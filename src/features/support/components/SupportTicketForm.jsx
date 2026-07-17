import SupportAttachmentDropzone from "./SupportAttachmentDropzone";
import SupportFieldSelect from "./SupportFieldSelect";
import useSupportTicketForm from "../hooks/useSupportTicketForm";
import { supportIssueTypeOptions } from "../data/supportData";

export default function SupportTicketForm() {
  const {
    attachmentError,
    attachmentName,
    descriptionCount,
    form,
    handleAttachmentChange,
    handleAttachmentRemove,
    handleFieldChange,
    handleSubmit,
    isReadyToSubmit,
    isSubmitting,
    submitted,
    submittedTicketId,
  } = useSupportTicketForm();

  return (
    <section className="rounded-[18px] border border-[#e7ddd4] bg-white px-5 py-5 shadow-[0_10px_24px_rgba(43,30,20,0.05)]">
      <div>
        <h2 className="type-h4 m-0 text-[#181310]">Submit a Support Ticket</h2>
        <p className="type-para mt-1 text-[#8d8074]">
          Share your issue and our team will get back to you with the right next steps.
        </p>
      </div>

      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3 max-[760px]:grid-cols-1">
            <SupportFieldSelect
              label="Subject Issue Type"
              onChange={handleFieldChange("issueType")}
              options={supportIssueTypeOptions}
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
                fileName={attachmentName}
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
    </section>
  );
}
