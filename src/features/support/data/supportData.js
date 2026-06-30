export const supportIssueTypeOptions = [
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
