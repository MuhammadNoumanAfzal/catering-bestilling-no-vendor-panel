import test from "node:test";
import assert from "node:assert/strict";
import { getMenuGroups } from "./menuManagementGroups.js";

const menus = [{ id: "menu", status: "Active" }, { id: "draft", status: "Draft" }];
const extras = [
  { id: "extra", status: "Active", rawAddon: { addOnType: "DEPENDENT" } },
  { id: "single", status: "Active", rawAddon: { addOnType: "INDEPENDENT" } },
  { id: "paused", status: "Paused", rawAddon: { addOnType: "INDEPENDENT" } },
];
test("All includes menus, add-ons and single products while dedicated tabs remain scoped", () => {
  const all = getMenuGroups("All", menus, extras);
  assert.deepEqual(all.map(group=>group.type), ["menus", "addOns", "singleProducts"]);
  assert.deepEqual(all.flatMap(group=>group.items.map(item=>item.id)), ["menu", "draft", "extra", "single", "paused"]);
  assert.equal(new Set(all.flatMap(group=>group.items.map(item=>item.id))).size, 5);
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
