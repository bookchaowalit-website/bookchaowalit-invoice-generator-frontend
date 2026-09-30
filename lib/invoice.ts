export type Line = { id: string; desc: string; qty: number; price: number };
export type Draft = { number: string; issued: string; from: string; to: string; lines: Line[] };

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
    "Total: " + formatTHB(invoiceTotal(draft.lines)),
  ].join("\n");
}

function isLine(value: unknown): value is Line {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return typeof line.id === "string" && typeof line.desc === "string" && typeof line.qty === "number" && typeof line.price === "number";
}

/** Reads a stored draft; older drafts without number/issued are upgraded. */
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
    };
  } catch {
    return null;
  }
}
