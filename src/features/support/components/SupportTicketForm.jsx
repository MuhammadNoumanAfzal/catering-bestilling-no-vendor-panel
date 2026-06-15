import { useMemo, useState } from "react";
import SupportAttachmentDropzone from "./SupportAttachmentDropzone";
import SupportFieldSelect from "./SupportFieldSelect";
import { showSupportTicketSubmitted } from "../../../utils/vendorAlerts";

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
  const [submitted, setSubmitted] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isReadyToSubmit) {
      return;
    }

    setSubmitted(true);
    setForm(initialForm);
    await showSupportTicketSubmitted();
  }

  return (
    <section className="rounded-[12px] border border-[#ddd5ce] bg-white px-5 py-4 shadow-[0_3px_10px_rgba(43,30,20,0.04)]">
      <div>
        <h2 className="type-h4 m-0 text-[#181310]">Submit a Support Ticket</h2>
        <p className="type-para mt-1 text-[#8d8074]">
          Share your issue and our team will get back to you.
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
              <SupportAttachmentDropzone />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
          <p className="text-[13px] font-semibold text-[#6f6258]">
            {submitted
              ? "Ticket submitted successfully. Our support team will review it soon."
              : "Our team usually responds within 24 hours."}
          </p>
          <button
            className="h-[42px] min-w-[122px] cursor-pointer rounded-[8px] bg-[#d96e39] px-5 text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isReadyToSubmit}
            type="submit"
          >
            Submit Ticket
          </button>
        </div>
      </form>
    </section>
  );
}
