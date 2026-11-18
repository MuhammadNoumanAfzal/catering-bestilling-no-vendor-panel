import { executeProtectedGraphqlRequest } from '../../app/api/protectedGraphqlClient';
export const isVendorApp = true;
export const offersBasePath = '/offers';
export { useAuth as useOfferAuth } from '../auth/hooks/useAuth';
export function requestOfferGraphql(query,variables) { return executeProtectedGraphqlRequest(query,variables); }
export async function storeAcceptedOffer() { throw new Error('Customer action only'); }
