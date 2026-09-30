# Upgrade plan

## Current state

Score: 8/10 (was 7/10) — tested invoice arithmetic incl. optional VAT 7% / withholding tax, print/PDF, config-driven canonical host, CI.

## Backlog

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
- Optional VAT 7% and withholding tax (1/2/3/5% of the pre-VAT subtotal, Thai practice) in `lib/invoice.ts` (`invoiceTotals`), each rounded half-up to the satang; shown on the paper and in copied text only when a tax applies; stored drafts validated/upgraded. Tested.

## Done in this pass (pass 3)
- Edge-case pass on `lib/invoice.ts` (regression tests in `lib/invoice.test.ts`):
  - Satang rounding used `Math.round(x * 100) / 100`, which rounds binary
    floats *down* at the half: `1.005` became 1.00 and a line of 0.5 × 2.01
    (exactly 1.005 baht) was billed 1.00 instead of 1.01 (also 1.5 × 0.67).
    New `roundSatang` removes the representation error before rounding half-up;
    used by `toAmount`, `lineTotal` and the total due.
  - Saved drafts with repeated line ids (duplicate React keys, edited
    together) or a leading BOM are handled.
- Backlog (P2): amounts above ~9e13 baht lose satang precision (2^53); cap
  inputs or switch to integer satang if very large invoices are in scope.
