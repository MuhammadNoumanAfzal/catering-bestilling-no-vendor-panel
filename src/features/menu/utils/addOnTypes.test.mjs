import assert from "node:assert/strict";
import { test } from "node:test";
import { standaloneInput, validateStandaloneFields } from "./addOnTypes.js";

test("dependent add-ons retain the existing menu-only input", () => {
  assert.deepEqual(standaloneInput({ addOnType: "DEPENDENT" }), { addOnType: "DEPENDENT" });
  assert.equal(validateStandaloneFields({ addOnType: "DEPENDENT" }), "");
});
test("standalone products send their own pricing, counts and allergens", () => {
  const form = { addOnType: "INDEPENDENT", pricingType: "per-person", minimumGuests: "5", minimumQuantity: "2", allergens: ["milk"] };
  assert.equal(validateStandaloneFields(form), "");
  assert.deepEqual(standaloneInput(form), { addOnType: "INDEPENDENT", pricingType: "per-person", minimumGuests: 5, minimumQuantity: 1, allergens: ["milk"] });
  for (const value of ["", "0", "-1", "1.5", "NaN"]) assert.notEqual(validateStandaloneFields({ ...form, minimumGuests: value }), "");
});
test("standalone saves always use per-guest pricing, including old fixed-price forms", () => {
  const form = { addOnType: "INDEPENDENT", pricingType: "fixed", minimumGuests: "10", minimumQuantity: "6", allergens: [] };
  assert.equal(standaloneInput(form).pricingType, "per-person");
  assert.equal(standaloneInput(form).minimumQuantity, 1);
});
