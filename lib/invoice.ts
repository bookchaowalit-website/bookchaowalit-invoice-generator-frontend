export type Line = { id: string; desc: string; qty: number; price: number };
/** Thai withholding-tax rates commonly applied to service invoices (percent of the pre-VAT amount). */
export const WHT_RATES = [0, 1, 2, 3, 5] as const;
export type WhtRate = (typeof WHT_RATES)[number];
export const VAT_RATE = 7;

export type Draft = { number: string; issued: string; from: string; to: string; lines: Line[]; vat: boolean; wht: WhtRate };

export type Totals = { subtotal: number; vat: number; wht: number; due: number };

/** Coerces user input to a finite, non-negative number with at most 2 decimals. */
export function toAmount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

export function lineTotal(line: Pick<Line, "qty" | "price">): number {
  return Math.round(toAmount(line.qty) * toAmount(line.price) * 100) / 100;
}

export function invoiceTotal(lines: Line[]): number {
  return Math.round(lines.reduce((sum, line) => sum + lineTotal(line) * 100, 0)) / 100;
}

/** Percent of an amount, rounded half-up to the satang. */
function percentOf(amount: number, percent: number): number {
  return Math.round(Math.round(amount * 100) * percent / 100) / 100;
}

/**
 * Subtotal, optional 7% VAT, and withholding tax computed on the pre-VAT
 * subtotal (Thai practice), each rounded to the satang. Due = subtotal + VAT − WHT.
 */
export function invoiceTotals(draft: Pick<Draft, "lines" | "vat" | "wht">): Totals {
  const subtotal = invoiceTotal(draft.lines);
  const vat = draft.vat ? percentOf(subtotal, VAT_RATE) : 0;
  const wht = percentOf(subtotal, draft.wht);
  return { subtotal, vat, wht, due: Math.round((subtotal + vat - wht) * 100) / 100 };
}

export function isWhtRate(value: unknown): value is WhtRate {
  return typeof value === "number" && (WHT_RATES as readonly number[]).includes(value);
}

export function formatTHB(amount: number): string {
  return "฿" + amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function invoiceText(draft: Draft): string {
  return [
    "INVOICE / THB" + (draft.number ? " / " + draft.number : ""),
    ...(draft.issued ? ["Issued: " + draft.issued] : []),
    "From: " + draft.from,
    "Bill to: " + draft.to,
    ...draft.lines.map((line) => `${line.desc || "Untitled line"} × ${toAmount(line.qty)} @ ${formatTHB(toAmount(line.price))} — ${formatTHB(lineTotal(line))}`),
    ...taxLines(draft),
  ].join("\n");
}

function taxLines(draft: Draft): string[] {
  const totals = invoiceTotals(draft);
  if (!draft.vat && draft.wht === 0) return ["Total: " + formatTHB(totals.due)];
  return [
    "Subtotal: " + formatTHB(totals.subtotal),
    ...(draft.vat ? [`VAT ${VAT_RATE}%: ` + formatTHB(totals.vat)] : []),
    ...(draft.wht ? [`Withholding tax ${draft.wht}%: −` + formatTHB(totals.wht)] : []),
    "Total due: " + formatTHB(totals.due),
  ];
}

function isLine(value: unknown): value is Line {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return typeof line.id === "string" && typeof line.desc === "string" && typeof line.qty === "number" && typeof line.price === "number";
}

/** Reads a stored draft; older drafts without number/issued/vat/wht are upgraded. */
export function parseDraft(raw: string | null): Draft | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (typeof data !== "object" || data === null || typeof data.from !== "string" || typeof data.to !== "string" || !Array.isArray(data.lines)) return null;
    return {
      number: typeof data.number === "string" ? data.number : "",
      issued: typeof data.issued === "string" ? data.issued : "",
      from: data.from,
      to: data.to,
      lines: data.lines.filter(isLine).map((line) => ({ ...line, qty: toAmount(line.qty), price: toAmount(line.price) })),
      vat: data.vat === true,
      wht: isWhtRate(data.wht) ? data.wht : 0,
    };
  } catch {
    return null;
  }
}
