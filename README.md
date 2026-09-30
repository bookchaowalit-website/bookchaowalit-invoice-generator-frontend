# Invoice Generator

THB invoice preview client-side.

## Features
- Editable sender, client, invoice number, issue date and line items
- Live THB totals (non-negative, rounded to satang)
- Copy as plain text, or print / save as PDF (print view shows only the invoice paper)
- Draft autosaved to localStorage (validated on load)

## Limitations
- Demo-grade

## Run
```bash
npm install
npm run dev
```

## Honesty
Portfolio demo. Not multi-tenant SaaS. Prefer local-only state over fake production claims.

## Checks

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

CI runs the same checks on every push (`.github/workflows/ci.yml`).
