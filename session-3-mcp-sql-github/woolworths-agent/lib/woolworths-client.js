const BASE_URL = "https://www.woolworths.co.nz";

export function createWoolworthsClient({
  username,
  password,
  shoppingListId,
  dryRun
}) {
  return {
    async addItemsToTrolley(items) {
      if (!items || items.length === 0) {
        return {
          mode: dryRun ? "dry-run" : "live",
          target: BASE_URL,
          message: "No restock candidates found."
        };
      }

      const payload = {
        username,
        shoppingListId,
        dryRun,
        items: items.map((item) => ({
          name: item.name,
          sku: item.sku,
          quantity: Math.max((item.reorderThreshold ?? 1) - (item.onHand ?? 0), 1)
        }))
      };

      if (dryRun) {
        return {
          mode: "dry-run",
          target: BASE_URL,
          payload
        };
      }

      throw new Error(
        "Live Woolworths automation is not enabled. Configure API or browser automation before running with DRY_RUN=false."
      );
    }
  };
}
