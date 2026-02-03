import test from "node:test";
import assert from "node:assert/strict";
import { findRestockCandidates } from "../lib/inventory.js";

const fixture = [
  {
    name: "Milk",
    sku: "MILK-001",
    onHand: 1,
    reorderThreshold: 2,
    expiresOn: "2026-02-10"
  },
  {
    name: "Pasta",
    sku: "PASTA-005",
    onHand: 4,
    reorderThreshold: 2,
    expiresOn: "2026-03-10"
  }
];

test("findRestockCandidates returns low stock items", () => {
  const results = findRestockCandidates(fixture);
  assert.equal(results.length, 1);
  assert.equal(results[0].sku, "MILK-001");
});
