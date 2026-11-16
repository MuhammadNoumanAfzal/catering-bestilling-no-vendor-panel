import { useAgreementLanguage } from "./agreementTranslations.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { AgreementContext } from "./agreementContext";
import { agreementRequest, agreementsEnabled } from "./agreementApi";
export default function AgreementProvider() {
  useAgreementLanguage();
  const [state, setState] = useState({
    agreement: null,
    loading: agreementsEnabled,
    error: "",
  });
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!agreementsEnabled) return;
    const request = ++generation.current;
    setState((s) => ({ ...s, loading: !s.agreement, error: "" }));
    try {
      const agreement = await agreementRequest("vendor");
      if (request === generation.current)
        setState({ agreement, loading: false, error: "" });
    } catch (e) {
      if (request === generation.current)
        setState({ agreement: null, loading: false, error: e.message });
    }
  }, []);
  const cancel = useCallback(() => {
    generation.current += 1;
  }, []);
  useEffect(() => {
    const start = window.setTimeout(refresh, 0);
    const onFocus = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", onFocus);
    const interval = window.setInterval(onFocus, 60000);
    return () => {
      cancel();
      window.clearTimeout(start);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, cancel]);
  return (
    <AgreementContext.Provider
      value={{ ...state, refresh, enabled: agreementsEnabled }}
    >
      <Outlet />
    </AgreementContext.Provider>
  );
}
