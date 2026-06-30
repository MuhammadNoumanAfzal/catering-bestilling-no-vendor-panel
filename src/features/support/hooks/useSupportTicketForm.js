import { useMemo, useState } from "react";
import { uploadMenuImage } from "../../menu/api/menuUploadApi";
import { createSupportTicket } from "../api/supportApi";
import {
  initialSupportTicketForm,
  supportIssueTypeOptions,
} from "../data/supportData";
import {
  showSupportTicketSubmitted,
  showVendorErrorAlert,
} from "../../../utils/vendorAlerts";

const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const MAX_ATTACHMENT_SIZE_BYTES = 2 * 1024 * 1024;

export default function useSupportTicketForm() {
  const [form, setForm] = useState(initialSupportTicketForm);
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

    if (!ALLOWED_ATTACHMENT_TYPES.includes(nextFile.type)) {
      setAttachment(null);
      setAttachmentError("Please upload a PNG, JPG, JPEG, or WEBP screenshot.");
      return;
    }

    if (nextFile.size > MAX_ATTACHMENT_SIZE_BYTES) {
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

      const uploadedAttachment = attachment
        ? await uploadMenuImage(attachment)
        : null;
      const selectedIssueLabel =
        supportIssueTypeOptions.find((option) => option.value === form.issueType)?.label
        || form.issueType;

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
      setForm(initialSupportTicketForm);
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

  return {
    attachmentError,
    attachmentName: attachment?.name || "",
    descriptionCount,
    form,
    handleAttachmentChange,
    handleAttachmentRemove,
    handleCategoryChange,
    handleFieldChange,
    handleSubmit,
    isReadyToSubmit,
    isSubmitting,
    submitted,
    submittedTicketId,
  };
}
