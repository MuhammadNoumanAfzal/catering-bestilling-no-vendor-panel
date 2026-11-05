export async function persistVendorOrderStatus(save, input) {
  const isAcceptance = ["CONFIRMED", "ACCEPTED", "ACCEPT"].includes(String(input.status).toUpperCase());
  const result = await save(isAcceptance ? { ...input, status: "ACCEPTED" } : input);
  if (!isAcceptance) return result;
  const savedStatus = String(result?.instance?.status || result?.order?.status || "").toUpperCase();
  const fulfillmentStatus = String(result?.order?.fulfillmentStatus || "").toUpperCase();
  if (["PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED", "DELIVERED"].some(status => status === savedStatus || status === fulfillmentStatus)) return result;
  try { return await save({ ...input, status: "PREPARING" }); }
  catch (cause) {
    const error = new Error("The order was accepted, but preparation could not be started. Refresh the order before trying again.", { cause });
    error.acceptanceSaved = true;
    throw error;
  }
}

export function vendorNextStage(status) {
  if (["Accepted", "Modified", "Preparing"].includes(status)) return "Ready";
  if (["Ready", "Out for delivery"].includes(status)) return "Delivered";
  return null;
}
