import test from "node:test";
import assert from "node:assert/strict";
import { safeInternalPath } from "./safeInternalPath.js";
const origin = "https://vendor.example";
test("preserves internal routes and same-origin absolute links", () => {
  assert.equal(safeInternalPath("/orders/123?tab=items#total", origin), "/orders/123?tab=items#total");
  assert.equal(safeInternalPath(origin + "/orders", origin), "/orders");
});
test("rejects script schemes, external origins, credentials and ambiguous paths", () => {
  for (const value of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "//evil.example", "https://evil.example/", "https://vendor.example.evil.example/", "https://user:pass@vendor.example/", "/%2f%2fevil.example", "/%5cevil.example", "/%00", "/%zz", "", null, {}]) {
    assert.equal(safeInternalPath(value, origin), null, String(value));
  }
});
