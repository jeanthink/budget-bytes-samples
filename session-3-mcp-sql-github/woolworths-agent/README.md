# Woolworths Restock Agent (Microsoft Agents SDK)

This sample demonstrates how to scaffold a Microsoft Agents SDK app that can log in to a Woolworths New Zealand account and prepare a trolley order when household inventory is low or expiring. The implementation uses a **dry-run** mode by default so you can safely validate the flow before wiring in a live Woolworths integration.

## Features

- Loads inventory from a mock list or JSON file.
- Flags low-stock or expiring items.
- Prepares an order payload for Woolworths trolley actions.
- Runs as a Microsoft Agents SDK hosted service.

## Prerequisites

- Node.js 18+
- A Woolworths New Zealand account
- A Woolworths shopping list ID

## Setup

```bash
cd session-3-mcp-sql-github/woolworths-agent
npm install
cp .env.example .env
```

Update `.env` with your Woolworths credentials and shopping list ID. Keep `DRY_RUN=true` until you have a trusted automation path.

## Run the agent

```bash
npm start
```

The agent exposes three tools:

- `checkInventory` → returns inventory items.
- `restockItems` → prepares a trolley payload for items that need restocking (the agent filters to low-stock or expiring items before building the order).
- `checkAndRestock` → loads inventory and prepares a trolley payload in one step.

## Safe automation guidance

Live checkout automation is intentionally disabled. To implement a production workflow, integrate a server-side Woolworths API client or a vetted browser automation flow, then remove the `DRY_RUN` guard in `lib/woolworths-client.js`.

## Example request

Send a JSON payload to the agent (via your preferred channel) to restock items:

```json
{
  "tool": "checkAndRestock",
  "items": [
    {
      "name": "Milk",
      "sku": "MILK-001",
      "onHand": 1,
      "reorderThreshold": 2,
      "expiresOn": "2026-02-10"
    }
  ]
}
```
