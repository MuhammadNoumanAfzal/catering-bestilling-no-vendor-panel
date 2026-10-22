import assert from "node:assert/strict";
import { test } from "node:test";
import nb from "../../../i18n/nb.js";
import en from "../../../i18n/en.js";
import { localizeAddOnError } from "./addOnErrors.js";

const translate = (resource) => (key) => key.split(".").reduce((value, part) => value?.[part], resource) || key;
const no = translate(nb);
const english = translate(en);

test("standalone local validation and rollout errors are Norwegian", () => {
  assert.equal(localizeAddOnError("addOnErrors.minimumGuests", no, "nb"), nb.addOnErrors.minimumGuests);
  assert.equal(localizeAddOnError(new Error("Independent add-ons require the backend update before they can be saved."), no, "nb"), nb.addOnErrors.disabled);
});
test("backend field errors and codes are localized for inline and popup use", () => {
  assert.equal(localizeAddOnError({ code: "MINIMUM_GUESTS", message: "At least 10 guests required" }, no, "nb"), nb.addOnErrors.guestMinimum);
  assert.equal(localizeAddOnError({ errors: [{ field: "priceWithTax", message: "Invalid decimal" }] }, no, "nb"), nb.addOnErrors.price);
  assert.equal(localizeAddOnError({ field: "allergens", message: "Invalid IDs" }, no, "nb"), nb.addOnErrors.allergens);
});
test("unknown backend errors never leak English technical messages in Norwegian mode", () => {
  assert.equal(localizeAddOnError(new Error("Database serializer failed"), no, "nb"), nb.addOnErrors.save);
  assert.equal(localizeAddOnError(new Error("Unexpected payload"), no, "nb", "load"), nb.addOnErrors.load);
  assert.equal(localizeAddOnError(new Error("Failed to fetch"), no, "nb"), nb.addOnErrors.network);
});
test("English mode still uses English messages", () => {
  assert.equal(localizeAddOnError("addOnErrors.minimumGuests", english, "en"), en.addOnErrors.minimumGuests);
});
