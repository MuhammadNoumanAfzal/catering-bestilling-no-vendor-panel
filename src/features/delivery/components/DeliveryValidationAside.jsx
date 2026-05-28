export default function DeliveryValidationAside({ pickupOnly = false }) {
  return (
    <aside className="h-fit rounded-[12px] bg-[#ffb596] px-4 py-4">
      <h2 className="type-h5 m-0 text-[#2a1811]">Live Validation</h2>
      <p className="type-para mt-2 leading-[1.45] text-[#593326]">
        {pickupOnly
          ? "Pickup only is enabled, so delivery zones, pricing, schedule, and capacity settings are disabled."
          : "Customers within your listed postal codes and chosen time ranges will be able to order. Ensure all zones are accurate to your current fleet."}
      </p>
    </aside>
  );
}
