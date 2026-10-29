import { executeProtectedGraphqlRequest, getCurrentAccessToken } from "../../../app/api/protectedGraphqlClient";
import { executeGraphqlRequest } from "../../auth/api/authClient";
import { createVendorCommissionReader } from "./commissionClient.js";

export const getVendorCommission = createVendorCommissionReader({
  readVendor: executeProtectedGraphqlRequest,
  // Use this vendor's token only. Expected admin-only permission denials must
  // not invalidate a valid vendor session through the protected client wrapper.
  readGlobal: (query, variables) => executeGraphqlRequest(query, variables, {
    accessToken: getCurrentAccessToken(),
  }),
});