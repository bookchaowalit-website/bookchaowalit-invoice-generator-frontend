import { describe, expect, it } from "vitest";
import { formatTHB, invoiceText, invoiceTotal, lineTotal, parseDraft, toAmount, type Draft } from "./invoice";

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
    const draft: Draft = { number: "INV-001", issued: "2026-09-30", from: "Me", to: "You", lines: [{ id: "1", desc: "Work", qty: 2, price: 1000 }] };
    expect(invoiceText(draft)).toBe("INVOICE / THB / INV-001\nIssued: 2026-09-30\nFrom: Me\nBill to: You\nWork × 2 @ ฿1,000 — ฿2,000\nTotal: ฿2,000");
  });
});

describe("parseDraft", () => {
  it("upgrades older drafts and drops malformed lines", () => {
    const raw = JSON.stringify({ from: "A", to: "B", lines: [{ id: "1", desc: "x", qty: 1, price: 2 }, { id: 2 }] });
    expect(parseDraft(raw)).toEqual({ number: "", issued: "", from: "A", to: "B", lines: [{ id: "1", desc: "x", qty: 1, price: 2 }] });
    expect(parseDraft("[]")).toBeNull();
    expect(parseDraft("{bad")).toBeNull();
  });
});
