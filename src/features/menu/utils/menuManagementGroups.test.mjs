import test from "node:test";
import assert from "node:assert/strict";
import { getMenuGroups } from "./menuManagementGroups.js";

const menus = [{ id: "menu", status: "Active" }, { id: "draft", status: "Draft" }];
const extras = [
  { id: "extra", status: "Active", rawAddon: { addOnType: "DEPENDENT" } },
  { id: "single", status: "Active", rawAddon: { addOnType: "INDEPENDENT" } },
  { id: "paused", status: "Paused", rawAddon: { addOnType: "INDEPENDENT" } },
];
test("All contains only menus, with add-ons and single products in separate tabs", () => {
  assert.deepEqual(getMenuGroups("All", menus, extras)[0].items, menus);
  assert.deepEqual(getMenuGroups("Add-ons", menus, extras)[0].items.map((x) => x.id), ["extra"]);
  assert.deepEqual(getMenuGroups("Single Products", menus, extras)[0].items.map((x) => x.id), ["single", "paused"]);
});
test("each status has three independently filtered sections, including empty sections", () => {
  for (const status of ["Active", "Draft", "Paused"]) {
    const groups = getMenuGroups(status, menus, extras);
    assert.deepEqual(groups.map((g) => g.type), ["menus", "addOns", "singleProducts"]);
    assert.ok(groups.every((g) => g.items.every((item) => item.status === status)));
  }
  assert.equal(getMenuGroups("Paused", menus, extras)[2].items[0].id, "paused");
});
