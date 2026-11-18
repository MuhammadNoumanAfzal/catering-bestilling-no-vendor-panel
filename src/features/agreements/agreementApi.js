import { ag } from "./agreementTranslations.js";
import { agreementErrorMessage } from "./agreementErrors.js";
import { executeProtectedGraphqlRequest } from "../../app/api/protectedGraphqlClient";
import { safeDocumentUrl } from "./agreementModel";
// Operations validated against the deployed schema; authenticated acceptance testing is still required.
export const agreementsEnabled =
  import.meta.env.VITE_VENDOR_AGREEMENTS_ENABLED === "true";
export const agreementFields = `id revision status version title companyName organisationNumber signerEmail sentAt signedAt approvedAt rejectionReason documentSha256 canSign canGoLive bodySections { heading paragraphs } signer { fullName role email } checks { signingOtpStatus signingOtpVerifiedAt originalDocumentIntegrityStatus signedDocumentIntegrityStatus companyFound companyNameMatches emailVerified documentIntegrityValid checkedAt checkedOrganisationNumber registryCompanyName verificationSource verificationMessage } events { id label createdAt }`;
export const documents = {
  vendor: `query VendorAgreement { vendorAgreement { ${agreementFields} } }`,
  list: `query AdminVendorAgreements($search: String, $status: VendorAgreementStatus, $page: Int!) { adminVendorAgreements(search: $search, status: $status, page: $page, pageSize: 20) { totalCount pageCount counts { pendingSignature pendingApproval active rejected } items { ${agreementFields} } } }`,
  detail: `query AdminVendorAgreement($id: ID!) { adminVendorAgreement(id: $id) { ${agreementFields} } }`,
  code: `mutation RequestVendorAgreementCode($input: RequestVendorAgreementCodeInput!) { requestVendorAgreementCode(input: $input) { challengeId maskedEmail expiresAt resendAvailableAt } }`,
  sign: `mutation SignVendorAgreement($input: SignVendorAgreementInput!) { signVendorAgreement(input: $input) { agreement { ${agreementFields} } } }`,
  access: `mutation VendorAgreementDocumentAccess($input: VendorAgreementDocumentAccessInput!) { vendorAgreementDocumentAccess(input: $input) { url expiresAt sha256 } }`,
  review: `mutation ReviewVendorAgreement($input: ReviewVendorAgreementInput!) { reviewVendorAgreement(input: $input) { agreement { ${agreementFields} } } }`,
  reminder: `mutation SendVendorAgreementReminder($input: SendVendorAgreementReminderInput!) { sendVendorAgreementReminder(input: $input) { queuedCount } }`,
  template: `mutation PublishVendorAgreementTemplate($input: PublishVendorAgreementTemplateInput!) { publishVendorAgreementTemplate(input: $input) { id version } }`,
  reissue: `mutation ReissueVendorAgreement($input: ReissueVendorAgreementInput!) { reissueVendorAgreement(input: $input) { agreement { ${agreementFields} } } }`,
  live: `mutation ActivateVendorStore($input: ActivateVendorStoreInput!) { activateVendorStore(input: $input) { agreement { ${agreementFields} } } }`,
};
export async function agreementRequest(operation, variables = {}) {
  if (!agreementsEnabled)
    throw new Error(
      "Vendor Agreement service is not connected yet. Please contact GoCatering.",
    );
  let data;
  try {
    data = await executeProtectedGraphqlRequest(documents[operation], variables);
  } catch (error) {
    error.code ||= error.graphqlErrors?.[0]?.extensions?.code;
    const fallback = agreementErrorMessage({code:error.code});
    error.message = ag(fallback === "Unable to complete the agreement request. Please try again." ? agreementErrorMessage(error) : fallback);
    throw error;
  }
  const root = {
    vendor: "vendorAgreement",
    list: "adminVendorAgreements",
    detail: "adminVendorAgreement",
    code: "requestVendorAgreementCode",
    sign: "signVendorAgreement",
    access: "vendorAgreementDocumentAccess",
    review: "reviewVendorAgreement",
    reminder: "sendVendorAgreementReminder",
    template: "publishVendorAgreementTemplate",
    live: "activateVendorStore",
    reissue: "reissueVendorAgreement",
  }[operation];
  if (data?.[root] == null)
    throw new Error(
      "The agreement service returned an incomplete response. Please refresh.",
    );
  return data[root];
}
export async function downloadAgreement(id, kind) {
  const result = await agreementRequest("access", {
    input: { agreementId: id, kind },
  });
  const url = safeDocumentUrl(result.url);
  if (!url) throw new Error("A secure document link is not available.");
  window.location.assign(url);
}
