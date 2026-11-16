import { test } from "node:test";
import assert from "node:assert/strict";
import { agreementErrorMessage } from "./agreementErrors.js";
test("agreement errors provide recovery guidance for server codes", () => {
  assert.match(agreementErrorMessage({code:"OTP_INVALID"}), /Incorrect verification code/);
  assert.match(agreementErrorMessage({code:"AGREEMENT_CONFLICT"}), /Refresh/);
  assert.match(agreementErrorMessage({code:"DOCUMENT_NOT_READY"}), /prepared/);
  assert.match(agreementErrorMessage({code:"AGREEMENT_REQUIRED"}), /approved/);
});
test("unknown errors retain the server message", () => {
  assert.equal(agreementErrorMessage({message:"Service temporarily unavailable"}), "Service temporarily unavailable");
});

test("backend user-facing messages take precedence over fallback wording", () => {
  assert.equal(agreementErrorMessage({code:"COMPANY_NOT_VERIFIED", message:"Selskapet er ikke verifisert."}), "Selskapet er ikke verifisert.");
});
