export function agreementErrorMessage(error) {
  const messages = {
    COMPANY_NOT_VERIFIED: "Company verification failed. Check the organisation number and registered company details before approval.",
    COMPANY_DETAILS_REQUIRED: "A valid organisation number is required before signing. Update company details in vendor settings, then refresh the agreement.",
    RATE_LIMITED: "Please wait before requesting another code or retrying this action.",
    OTP_INVALID: "Incorrect verification code. Check your email and try again.",
    OTP_EXPIRED: "Your verification code has expired. Request a new code.",
    AGREEMENT_CONFLICT: "This agreement has changed. Refresh its status before continuing.",
    AUTHORITY_REQUIRED: "Confirm that you agree to the contract and are authorised to sign.",
    DOCUMENT_NOT_READY: "Your PDF is still being prepared. Please try again shortly.",
    AGREEMENT_REQUIRED: "Your agreement must be approved before your store can go live.",
  };
  return error?.message || messages[error?.code] || "Unable to complete the agreement request. Please try again.";
}
