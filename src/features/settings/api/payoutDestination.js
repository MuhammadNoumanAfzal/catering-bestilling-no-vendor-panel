export function dinteroPayoutFields(profile) {
 const dinteroAccountId=String(profile?.dinteroAccountId || "").trim();
 if(profile?.payoutMethod === "DINTERO" && !dinteroAccountId) throw new Error("A Dintero payout destination ID is required.");
 return {dinteroAccountId};
}
