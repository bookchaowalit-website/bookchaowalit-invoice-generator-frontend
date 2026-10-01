import { describe, expect, it } from "vitest";
import { formatTHB, invoiceText, invoiceTotal, invoiceTotals, lineTotal, parseDraft, toAmount, type Draft } from "./invoice";

describe("amounts", () => {
  it("coerces invalid or negative input to zero", () => {
    expect(toAmount("")).toBe(0);
    expect(toAmount(Number.NaN)).toBe(0);
    expect(toAmount(-5)).toBe(0);
    expect(toAmount("12.345")).toBe(12.35);
  });

  it("totals lines without floating point drift", () => {
    expect(lineTotal({ qty: 3, price: 0.1 })).toBe(0.3);
    expect(invoiceTotal([{ id: "a", desc: "", qty: 5, price: 1500 }, { id: "b", desc: "", qty: 1, price: 500 }, { id: "c", desc: "", qty: -2, price: 100 }])).toBe(8000);
  });

  it("formats baht with up to two decimals", () => {
    expect(formatTHB(8000)).toBe("฿8,000");
    expect(formatTHB(0.5)).toBe("฿0.5");
  });
});

describe("invoiceText", () => {
  it("renders a plain-text invoice", () => {
    const draft: Draft = { number: "INV-001", issued: "2026-09-30", from: "Me", to: "You", lines: [{ id: "1", desc: "Work", qty: 2, price: 1000 }], vat: false, wht: 0 };
    expect(invoiceText(draft)).toBe("INVOICE / THB / INV-001\nIssued: 2026-09-30\nFrom: Me\nBill to: You\nWork × 2 @ ฿1,000 — ฿2,000\nTotal: ฿2,000");
  });
});

describe("parseDraft", () => {
  it("upgrades older drafts and drops malformed lines", () => {
    const raw = JSON.stringify({ from: "A", to: "B", lines: [{ id: "1", desc: "x", qty: 1, price: 2 }, { id: 2 }] });
    expect(parseDraft(raw)).toEqual({ number: "", issued: "", from: "A", to: "B", lines: [{ id: "1", desc: "x", qty: 1, price: 2 }], vat: false, wht: 0 });
    expect(parseDraft("[]")).toBeNull();
    expect(parseDraft("{bad")).toBeNull();
  });
});

describe("VAT and withholding tax", () => {
  const lines = [{ id: "1", desc: "Design", qty: 1, price: 10000 }];

  it("adds 7% VAT and withholds on the pre-VAT subtotal", () => {
    expect(invoiceTotals({ lines, vat: true, wht: 3 })).toEqual({ subtotal: 10000, vat: 700, wht: 300, due: 10400 });
    expect(invoiceTotals({ lines, vat: false, wht: 0 })).toEqual({ subtotal: 10000, vat: 0, wht: 0, due: 10000 });
  });

  it("rounds each tax half-up to the satang", () => {
    const odd = [{ id: "1", desc: "", qty: 1, price: 333.33 }];
    // 333.33 × 7% = 23.3331 → 23.33; × 3% = 9.9999 → 10.00
    expect(invoiceTotals({ lines: odd, vat: true, wht: 3 })).toEqual({ subtotal: 333.33, vat: 23.33, wht: 10, due: 346.66 });
    // 0.5 satang rounds up: 150.5 × 1% = 1.505 → 1.51
    expect(invoiceTotals({ lines: [{ id: "1", desc: "", qty: 1, price: 150.5 }], vat: false, wht: 1 }).wht).toBe(1.51);
  });

  it("prints the tax breakdown only when a tax applies", () => {
    const draft: Draft = { number: "", issued: "", from: "Me", to: "You", lines, vat: true, wht: 3 };
    expect(invoiceText(draft).split("\n").slice(-4)).toEqual(["Subtotal: ฿10,000", "VAT 7%: ฿700", "Withholding tax 3%: −฿300", "Total due: ฿10,400"]);
  });

  it("keeps valid stored tax settings and drops invalid ones", () => {
    const base = { from: "A", to: "B", lines: [] };
    expect(parseDraft(JSON.stringify({ ...base, vat: true, wht: 5 }))).toMatchObject({ vat: true, wht: 5 });
    expect(parseDraft(JSON.stringify({ ...base, vat: "yes", wht: 4 }))).toMatchObject({ vat: false, wht: 0 });
  });
});

describe("satang rounding edge cases", () => {
  it("rounds half a satang up even when the float sits just below .5", () => {
    expect(toAmount(1.005)).toBe(1.01);
    expect(toAmount("8.345")).toBe(8.35);
    expect(lineTotal({ qty: 0.5, price: 2.01 })).toBe(1.01);
    expect(lineTotal({ qty: 1.5, price: 0.67 })).toBe(1.01);
    expect(lineTotal({ qty: 3, price: 1.15 })).toBe(3.45);
  });

  it("keeps totals on whole satang for a VAT + WHT invoice", () => {
    const totals = invoiceTotals({ lines: [{ id: "a", desc: "", qty: 0.5, price: 2.01 }], vat: true, wht: 3 });
    expect(totals).toEqual({ subtotal: 1.01, vat: 0.07, wht: 0.03, due: 1.05 });
  });

  it("drops repeated line ids and accepts a BOM-prefixed saved draft", () => {
    const raw = "﻿" + JSON.stringify({ from: "a", to: "b", lines: [{ id: "1", desc: "x", qty: 1, price: 1 }, { id: "1", desc: "y", qty: 2, price: 2 }] });
    expect(parseDraft(raw)?.lines.map((line) => line.desc)).toEqual(["x"]);
  });
});
