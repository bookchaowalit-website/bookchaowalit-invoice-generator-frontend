# Upgrade plan

## Current state

Score: 7/10 (was 5/10) — invoice arithmetic is now tested and robust to bad input, print/PDF works, CI in place; no tax/VAT support.

## Backlog

- P1: Optional VAT (7%) and withholding-tax lines with tested rounding.
- P1: Multiple saved drafts (currently one autosaved draft).
- P2: Playwright smoke test (edit line, copy, print view).
- P2: Due date / payment terms field.

## Done in this pass

- CI (`.github/workflows/ci.yml`): `npm ci`, lint, typecheck, vitest, `next build` on every push and PR.
- `/api/mcp` uses a typed JSON-RPC handler (`lib/mcp.ts`, tested) with proper error codes and an honest `get_app_info` tool; this fixed the template's lint errors.
- `/more-projects` renders from `lib/related-projects.ts` (was ~980 lines of unrolled links plus an unused data copy) and no longer links to itself; removed the stale `app/page.tsx.backup`.
- Invoice math moved to `lib/invoice.ts` (tested): negative/NaN input clamps to 0, totals round to 2 decimals, stored drafts are validated and upgraded.
- Added invoice number + issue date, a Print / save PDF action with a print stylesheet, clipboard-failure feedback, and labels for every line input.
- Removed the hidden `dangerouslySetInnerHTML` design-note span and the set-state-in-effect lint suppression (now `lib/use-stored-state.ts`).

## Done in this pass (pass 2)

- Canonical host is config-driven: `lib/site.ts` resolves `NEXT_PUBLIC_SITE_URL` (validated, clear error on a non-http(s) value) and feeds `metadataBase`, generated `app/sitemap.ts` / `app/robots.ts` and the MCP `get_app_info` URL; removed the stale template `public/sitemap.xml` / `robots.txt` (they pointed at `bookchaowalit.com` and a `*.vercel.app` name that differs from the project URL). Tested in `lib/site.test.ts`.
