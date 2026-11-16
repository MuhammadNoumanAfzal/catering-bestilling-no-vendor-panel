import { createContext, useContext } from "react";
export const AgreementContext = createContext(null);
export function useAgreement() {
  return useContext(AgreementContext);
}
