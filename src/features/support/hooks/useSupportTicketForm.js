import { useEffect, useMemo, useState } from "react";
import {
  isMenuImageUploadConfigured,
  uploadMenuImage,
} from "../../menu/api/menuUploadApi";
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

function buildInitialForm(prefill = null) {
  return {
    ...initialSupportTicketForm,
    issueType: `${prefill?.issueType ?? initialSupportTicketForm.issueType ?? ""}`.trim(),
    relatedOrder: `${prefill?.relatedOrder ?? initialSupportTicketForm.relatedOrder ?? ""}`.trim(),
    description: `${prefill?.description ?? initialSupportTicketForm.description ?? ""}`,
  };
}

export default function useSupportTicketForm(onSubmitted, initialForm = null) {
  const isAttachmentUploadAvailable = isMenuImageUploadConfigured();
  const [form, setForm] = useState(() => buildInitialForm(initialForm));
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

  useEffect(() => {
    if (!initialForm) {
      return;
    }

    setForm((current) => {
      const nextForm = buildInitialForm(initialForm);
      const hasExistingInput =
        current.issueType !== initialSupportTicketForm.issueType
        || current.relatedOrder !== initialSupportTicketForm.relatedOrder
        || current.description !== initialSupportTicketForm.description;

      return hasExistingInput ? current : nextForm;
    });
  }, [initialForm]);

  function handleFieldChange(field) {
    return (event) => {
      setSubmitted(false);
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  function handleAttachmentChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setSubmitted(false);
    setAttachmentError("");

    if (!isAttachmentUploadAvailable) {
      setAttachment(null);
      setAttachmentError(
        "Attachments are temporarily unavailable right now. You can still submit your ticket without a screenshot.",
      );
      return;
    }

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
        userRole: "vendor",
        subject: selectedIssueLabel,
        relatedOrderId: form.relatedOrder,
        description: form.description,
        attachmentUrl: uploadedAttachment?.fileUrl || null,
        attachmentFileId: uploadedAttachment?.fileId || null,
      });

      setSubmitted(true);
      setSubmittedTicketId(result.ticketId || "");
      setForm(buildInitialForm(null));
      setAttachment(null);
      setAttachmentError("");
      if (typeof onSubmitted === "function") {
        await onSubmitted(result);
      }
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
    attachmentUploadAvailable: isAttachmentUploadAvailable,
    attachmentName: attachment?.name || "",
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
  };
}
