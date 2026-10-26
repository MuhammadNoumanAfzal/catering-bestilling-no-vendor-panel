import test from "node:test";
import assert from "node:assert/strict";
import { sortOrderRows } from "./orderSorting.js";
const rows = [
  { id: "1", raw: { createdOn: "2026-10-20T10:00:00Z", eventDate: "2026-11-01", eventTime: "10:00:00", statuses: [{ status: "DELIVERED", createdOn: "2026-11-01T14:00:00Z" }], pendingModificationRequest: { createdOn: "2026-10-25T10:00:00Z" } } },
  { id: "2", raw: { createdOn: "2026-10-22T10:00:00Z", eventDate: "2026-10-29", eventTime: "10:00:00", statuses: [{ status: "DELIVERED", createdOn: "2026-10-29T14:00:00Z" }], pendingModificationRequest: { createdOn: "2026-10-24T10:00:00Z" } } },
];
const ids = (tab) => sortOrderRows(rows, tab).map((row) => row.id);
test("All/New show newest received orders; work queues show earliest delivery", () => {
  for (const tab of ["All", "New"]) assert.deepEqual(ids(tab), ["2", "1"]);
  for (const tab of ["Accepted", "Pending", "Upcoming"]) assert.deepEqual(ids(tab), ["2", "1"]);
  assert.equal(rows[0].id, "1");
});
test("Modified and Delivered use their relevant timestamps", () => {
  assert.deepEqual(ids("Modified"), ["1", "2"]);
  assert.deepEqual(ids("Delivered"), ["1", "2"]);
});
test("Canceled uses cancellation history, missing timestamps sort last", () => {
  const items = [{ id: "3", raw: {} }, { id: "1", raw: { statuses: [{ status: "REJECTED", createdOn: "2026-10-24" }] } }];
  assert.deepEqual(sortOrderRows(items, "Canceled").map((x) => x.id), ["1", "3"]);
});
