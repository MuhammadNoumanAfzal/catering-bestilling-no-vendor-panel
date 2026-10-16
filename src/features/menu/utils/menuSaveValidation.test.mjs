import assert from "node:assert/strict";
import { test } from "node:test";
import { hasRequiredMenuItems } from "./menuSaveValidation.js";
test("draft menus can be saved before adding products", () => {
  assert.equal(hasRequiredMenuItems([], "draft"), true);
  assert.equal(hasRequiredMenuItems([{ title: "" }], "draft"), true);
  assert.equal(hasRequiredMenuItems(undefined, "DRAFT"), true);
});
test("published menus still require at least one named product", () => {
  assert.equal(hasRequiredMenuItems([], "active"), false);
  assert.equal(hasRequiredMenuItems([{ title: "  " }], "active"), false);
  assert.equal(hasRequiredMenuItems([{ title: "Focaccia" }], "active"), true);
});
