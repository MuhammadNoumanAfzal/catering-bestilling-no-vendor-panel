export default function DeliveryValidationAside({
  pickupOnly = false,
  isValidating = false,
  validation = null,
  fieldErrors = {},
}) {
  const issues = validation?.issues || [];
  const fieldErrorMessages = Object.values(fieldErrors).filter(Boolean);
  const isValid = validation?.isValid ?? true;
  const hasProblems = issues.length > 0 || fieldErrorMessages.length > 0 || !isValid;

  return (
    <aside className="h-fit rounded-[12px] bg-[#ffb596] px-4 py-4">
      <h2 className="type-h5 m-0 text-[#2a1811]">Delivery Status</h2>
      <p className="type-para mt-2 leading-[1.45] text-[#593326]">
        {isValidating
          ? "Checking your delivery settings..."
          : pickupOnly
            ? "Pickup only is turned on, so delivery fees, timing, and order limits are not being used right now."
            : !hasProblems
              ? "Your delivery settings look good and are ready to save."
              : "Please fix the items below before saving your delivery settings."}
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
