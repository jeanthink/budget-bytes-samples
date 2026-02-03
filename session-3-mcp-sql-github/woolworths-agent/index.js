import { AgentApplication } from "@microsoft/agents-hosting";
import { startServer } from "@microsoft/agents-hosting-express";
import dotenv from "dotenv";
import { z } from "zod";
import { findRestockCandidates, loadInventoryStatus } from "./lib/inventory.js";
import { createWoolworthsClient } from "./lib/woolworths-client.js";

dotenv.config();

const configSchema = z.object({
  PORT: z.coerce.number().default(3978),
  WOOLWORTHS_USERNAME: z.string().min(1),
  WOOLWORTHS_PASSWORD: z.string().min(1),
  WOOLWORTHS_SHOPPING_LIST_ID: z.string().min(1),
  INVENTORY_SOURCE: z.enum(["mock", "file"]).default("mock"),
  INVENTORY_FILE: z.string().default("./data/inventory.json"),
  DRY_RUN: z.enum(["true", "false"]).default("true")
});

const config = configSchema.parse({
  PORT: process.env.PORT,
  WOOLWORTHS_USERNAME: process.env.WOOLWORTHS_USERNAME,
  WOOLWORTHS_PASSWORD: process.env.WOOLWORTHS_PASSWORD,
  WOOLWORTHS_SHOPPING_LIST_ID: process.env.WOOLWORTHS_SHOPPING_LIST_ID,
  INVENTORY_SOURCE: process.env.INVENTORY_SOURCE,
  INVENTORY_FILE: process.env.INVENTORY_FILE,
  DRY_RUN: process.env.DRY_RUN
});

const agent = new AgentApplication({
  name: "WoolworthsRestockAgent",
  instructions:
    "You help track household grocery inventory, and trigger restock actions when items are low or expiring. Use the provided tools to check inventory and build a Woolworths trolley order. Always confirm before checkout.",
  tools: {
    async checkInventory() {
      return await loadInventoryStatus({
        source: config.INVENTORY_SOURCE,
        filePath: config.INVENTORY_FILE
      });
    },
    async checkAndRestock() {
      const items = await loadInventoryStatus({
        source: config.INVENTORY_SOURCE,
        filePath: config.INVENTORY_FILE
      });
      const client = createWoolworthsClient({
        username: config.WOOLWORTHS_USERNAME,
        password: config.WOOLWORTHS_PASSWORD,
        shoppingListId: config.WOOLWORTHS_SHOPPING_LIST_ID,
        dryRun: config.DRY_RUN === "true"
      });
      const candidates = findRestockCandidates(items);

      return await client.addItemsToTrolley(candidates);
    },
    async restockItems({ items }) {
      const client = createWoolworthsClient({
        username: config.WOOLWORTHS_USERNAME,
        password: config.WOOLWORTHS_PASSWORD,
        shoppingListId: config.WOOLWORTHS_SHOPPING_LIST_ID,
        dryRun: config.DRY_RUN === "true"
      });
      const candidates = findRestockCandidates(items);

      return await client.addItemsToTrolley(candidates);
    }
  }
});

await startServer(agent, { port: config.PORT });
console.log(`Woolworths agent server listening on port ${config.PORT}`);
