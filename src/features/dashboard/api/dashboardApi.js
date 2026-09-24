import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import {
  GET_VENDOR_DASHBOARD_QUERY,
  START_SIGNICAT_VERIFICATION_MUTATION,
} from "./dashboardQueries";

export function getVendorDashboard(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_DASHBOARD_QUERY, variables);
}

export async function startSignicatVerification(input = { flow: "vendor_onboarding" }) {
  const data = await executeProtectedGraphqlRequest(START_SIGNICAT_VERIFICATION_MUTATION, { input });
  const result = data?.startSignicatVerification;

  if (!result?.success || !result?.redirectUrl) {
    throw new Error(result?.message || "Unable to start BankID verification.");
  }

  return result;
}