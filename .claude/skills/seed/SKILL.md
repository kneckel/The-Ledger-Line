---
name: seed
description: Seed a subuno-api table by converting data to JSON and POSTing each record individually. Use when the user wants to bulk-load reference data into the API.
disable-model-invocation: true
argument-hint: <table-name> [source-file]
---

# API Table Seeder

Seed the `$ARGUMENTS` table in subuno-api.

## Configuration

- Base URL: `http://localhost:36250`
- API version: `api/v1`
- App ID: `aab43548-75a1-4e57-a7fd-fc5f2c3d2b39`
- Output directory: `work/wip/`

## Workflow

1. **Identify the source data** from $ARGUMENTS or ask the user for the file path and target endpoint.

2. **Check the API model** in `src/api/models/` to understand the exact field names and types the API expects. Compare with the source data and note any field name or type mismatches.

3. **Check the local model** in `src/data/types.ts` to ensure it aligns with the API model. If there's a mismatch, update `types.ts` to match the API schema. Also update any static reference data in `src/data/reference/` that uses the old field names.

4. **Convert the source data to JSON**, adjusting field names and types to match the API model. Save to `work/wip/<table-name>.json`. Key considerations:
   - Map foreign key fields to their proper string identifiers (e.g. numeric PKs to ISO codes)
   - Omit optional fields when null
   - Preserve Unicode characters

5. **Generate a seed script** at `work/wip/seed-<table-name>.cjs` (use `.cjs` since the project has `"type": "module"` in package.json) that:
   - Reads the JSON file
   - POSTs each record individually to the API endpoint
   - Includes headers: `Content-Type: application/json` and `x-app-id`
   - Logs success/failure for each record
   - Reports totals at the end

6. **Ask the user** if they want to run the script now.

7. **Run type-check** (`npm run type-check`) to verify no TypeScript errors were introduced.
