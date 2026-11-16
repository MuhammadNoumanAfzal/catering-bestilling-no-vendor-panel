import test from "node:test";
import assert from "node:assert/strict";
import {
  canSign,
  canGoLive,
  canReview,
  safeDocumentUrl,
} from "./agreementModel.js";
test("unknown or incomplete agreements cannot sign or activate", () => {
  for (const a of [
    null,
    {},
    { status: "ACTIVE" },
    { status: "NEW_UNKNOWN", canGoLive: true },
  ]) {
    assert.equal(canSign(a), false);
    assert.equal(canGoLive(a), false);
  }
});
test("signing requires server permission and document revision binding", () => {
  const a = {
    id: "a",
    revision: "r",
    documentSha256: "hash",
    status: "PENDING_SIGNATURE",
    canSign: true,
  };
  assert.equal(canSign(a), true);
  for (const k of ["id", "revision", "documentSha256", "canSign"])
    assert.equal(canSign({ ...a, [k]: null }), false);
  for (const status of [
    "ACTIVE",
    "REJECTED",
    "PENDING_APPROVAL",
    "SUPERSEDED",
    "REVOKED",
  ])
    assert.equal(canSign({ ...a, status }), false);
});
test("approval and every onboarding prerequisite remain required for activation", () => {
  assert.equal(canGoLive({ status: "ACTIVE", canGoLive: true }), true);
  for (const status of [
    "PENDING_SIGNATURE",
    "PENDING_APPROVAL",
    "REJECTED",
    "SUPERSEDED",
    "REVOKED",
  ])
    assert.equal(canGoLive({ status, canGoLive: true }), false);
});
test("unknown or failed evidence cannot be approved", () => {
  const checks = {
    companyFound: true,
    companyNameMatches: true,
    emailVerified: true,
    documentIntegrityValid: true,
  };
  assert.equal(canReview({ status: "PENDING_APPROVAL", checks }), true);
  for (const key of Object.keys(checks))
    for (const value of [null, false, undefined, "true"])
      assert.equal(
        canReview({
          status: "PENDING_APPROVAL",
          checks: { ...checks, [key]: value },
        }),
        false,
      );
  assert.equal(canReview({ status: "ACTIVE", checks }), false);
});
test("document links reject script schemes, plaintext and embedded credentials", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "http://example.com/a.pdf",
    "//example.com/a.pdf",
    "https://user:secret@example.com/a.pdf",
    "/a.pdf",
    null,
  ])
    assert.equal(safeDocumentUrl(value), null);
  assert.equal(
    safeDocumentUrl("https://example.com/a.pdf?signature=abc"),
    "https://example.com/a.pdf?signature=abc",
  );
});
