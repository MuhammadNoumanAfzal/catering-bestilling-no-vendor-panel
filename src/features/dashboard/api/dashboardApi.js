import { executeProtectedGraphqlRequest } from "../../../app/api/protectedGraphqlClient";
import { GET_VENDOR_DASHBOARD_QUERY } from "./dashboardQueries";

export function getVendorDashboard(variables = {}) {
  return executeProtectedGraphqlRequest(GET_VENDOR_DASHBOARD_QUERY, variables);
}
