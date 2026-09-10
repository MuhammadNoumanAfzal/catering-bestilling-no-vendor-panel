export const supportIssueTypeOptions = [
  { value: "payout-delay", label: "Payout delayed", labelKey: "support.issueTypes.payoutDelay" },
  { value: "earning-discrepancy", label: "Earning discrepancy", labelKey: "support.issueTypes.earningDiscrepancy" },
  { value: "order-management", label: "Order management issue", labelKey: "support.issueTypes.orderManagement" },
  { value: "unable-update-menu", label: "Unable to update menu", labelKey: "support.issueTypes.unableUpdateMenu" },
  { value: "delivery-config", label: "Delivery configuration issue", labelKey: "support.issueTypes.deliveryConfig" },
  { value: "store-visibility", label: "Store visibility issue", labelKey: "support.issueTypes.storeVisibility" },
  { value: "account-verification", label: "Account verification issue", labelKey: "support.issueTypes.accountVerification" },
  { value: "customer-dispute", label: "Customer dispute", labelKey: "support.issueTypes.customerDispute" },
  { value: "technical-platform", label: "Technical platform bug", labelKey: "support.issueTypes.technicalPlatform" },
  { value: "notification", label: "Notification issue", labelKey: "support.issueTypes.notification" },
  { value: "menu-upload", label: "Menu upload issue", labelKey: "support.issueTypes.menuUpload" },
  { value: "general-support", label: "General support request", labelKey: "support.issueTypes.generalSupport" },
];

export const initialSupportTicketForm = {
  category: "vendor",
  issueType: "",
  relatedOrder: "",
  description: "",
};

export const supportGuidePoints = [
  "Choose the issue type that best matches your problem.",
  "Add an order ID when your request is linked to a specific booking.",
  "Attach a screenshot for menu, payout, or technical issues when possible.",
  "For urgent account access problems, mention the affected email address in the description.",
];
