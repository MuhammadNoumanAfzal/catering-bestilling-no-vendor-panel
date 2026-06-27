export default function DeliveryValidationAside({
  pickupOnly = false,
  isValidating = false,
  validation = null,
  fieldErrors = {},
}) {
  const issues = validation?.issues || [];
  const fieldErrorMessages = Object.values(fieldErrors).filter(Boolean);
  const isValid = validation?.isValid ?? true;

  return (
    <aside className="h-fit rounded-[12px] bg-[#ffb596] px-4 py-4">
      <h2 className="type-h5 m-0 text-[#2a1811]">Live Validation</h2>
      <p className="type-para mt-2 leading-[1.45] text-[#593326]">
        {isValidating
          ? "Checking your current configuration against backend validation rules..."
          : pickupOnly
            ? "Pickup only is enabled, so delivery pricing, schedule, and capacity rules are currently disabled."
            : isValid
              ? "Your delivery configuration currently passes backend validation."
              : "Fix the validation issues below before saving."}
      </p>
      {issues.length || fieldErrorMessages.length ? (
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-[13px] font-medium leading-[1.45] text-[#593326]">
          {issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
          {fieldErrorMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
