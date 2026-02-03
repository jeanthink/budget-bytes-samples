import fs from "node:fs/promises";

const DEFAULT_ITEMS = [
  {
    name: "Milk",
    sku: "MILK-001",
    onHand: 1,
    reorderThreshold: 2,
    expiresOn: "2026-02-10"
  },
  {
    name: "Bread",
    sku: "BREAD-002",
    onHand: 0,
    reorderThreshold: 2,
    expiresOn: "2026-02-05"
  }
];

export async function loadInventoryStatus({ source, filePath }) {
  if (source === "file") {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  return DEFAULT_ITEMS;
}

export function findRestockCandidates(items) {
  const today = new Date();

  return items.filter((item) => {
    const expiresOn = item.expiresOn ? new Date(item.expiresOn) : null;
    const isExpiredSoon = expiresOn ? expiresOn <= addDays(today, 3) : false;
    return item.onHand <= item.reorderThreshold || isExpiredSoon;
  });
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
