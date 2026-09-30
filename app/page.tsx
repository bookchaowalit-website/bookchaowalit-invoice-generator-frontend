"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatTHB, invoiceText as renderInvoiceText, invoiceTotals, isWhtRate, lineTotal, parseDraft, toAmount, VAT_RATE, WHT_RATES, type Draft, type Line } from "@/lib/invoice";
import { useStoredState } from "@/lib/use-stored-state";

const INITIAL_DRAFT: Draft = {
  number: "INV-001",
  issued: "",
  from: "Bookchaowalit",
  to: "Client Co.",
  lines: [
    { id: "1", desc: "Consulting", qty: 5, price: 1500 },
    { id: "2", desc: "Hosting", qty: 1, price: 500 },
  ],
  vat: false,
  wht: 0,
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function Home() {
  const [draft, setDraft] = useStoredState("invoice-generator-draft-v2", INITIAL_DRAFT, parseDraft);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const totals = useMemo(() => invoiceTotals(draft), [draft]);
  const invoiceText = useMemo(() => renderInvoiceText(draft), [draft]);

  const updateLine = (id: string, update: Partial<Line>) => {
    setDraft((current) => ({ ...current, lines: current.lines.map((line) => line.id === id ? { ...line, ...update } : line) }));
  };

  const addLine = () => {
    setDraft((current) => ({ ...current, lines: [...current.lines, { id: crypto.randomUUID(), desc: "New line", qty: 1, price: 0 }] }));
  };

  const removeLine = (id: string) => {
    setDraft((current) => ({ ...current, lines: current.lines.filter((line) => line.id !== id) }));
  };

  const copyInvoice = async () => {
    setCopyState((await copyText(invoiceText)) ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 1800);
  };

  return (
    <main className="ledger-room">
      <div className="ledger-shell">
        <header className="ledger-topbar">
          <Link className="ledger-wordmark" href="/">LEDGER / THB</Link>
          <span>local draft desk · browser only</span>
        </header>

        <section className="ledger-intro">
          <div>
            <p className="ledger-overline">write once / check twice</p>
            <h1>Make the paper add up.</h1>
          </div>
          <p>A focused invoice workbench for small service jobs. Enter the parties and line items on the left; the paper on the right is the truth you can review.</p>
        </section>

        <div className="ledger-layout">
          <section className="entry-desk" aria-labelledby="entry-heading">
            <header className="desk-heading">
              <div><span className="desk-index">01</span><h2 id="entry-heading">Enter the ledger</h2></div>
              <span>draft / autosaved locally</span>
            </header>

            <div className="party-fields">
              <label htmlFor="from">From<input id="from" value={draft.from} onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))} /></label>
              <label htmlFor="to">Bill to<input id="to" value={draft.to} onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))} /></label>
              <label htmlFor="number">Invoice no.<input id="number" value={draft.number} onChange={(event) => setDraft((current) => ({ ...current, number: event.target.value }))} /></label>
              <label htmlFor="issued">Issue date<input id="issued" type="date" value={draft.issued} onChange={(event) => setDraft((current) => ({ ...current, issued: event.target.value }))} /></label>
            </div>

            <div className="line-heading"><span>Line item</span><span>Qty</span><span>Rate / THB</span><span /></div>
            <div className="line-list">
              {draft.lines.map((line) => (
                <div className="line-row" key={line.id}>
                  <label><span className="sr-only">Description</span><input aria-label="Line description" value={line.desc} onChange={(event) => updateLine(line.id, { desc: event.target.value })} /></label>
                  <label><span className="sr-only">Quantity</span><input aria-label={(line.desc || "Line") + " quantity"} type="number" min="0" step="any" inputMode="decimal" value={line.qty} onChange={(event) => updateLine(line.id, { qty: toAmount(event.target.value) })} /></label>
                  <label><span className="sr-only">Rate in Thai baht</span><input aria-label={(line.desc || "Line") + " rate"} type="number" min="0" step="any" inputMode="decimal" value={line.price} onChange={(event) => updateLine(line.id, { price: toAmount(event.target.value) })} /></label>
                  <button className="remove-line" type="button" onClick={() => removeLine(line.id)} disabled={draft.lines.length === 1} aria-label={"Remove " + (line.desc || "line")}>Remove</button>
                </div>
              ))}
            </div>

            <fieldset className="tax-fields">
              <legend>Tax</legend>
              <label className="tax-check"><input type="checkbox" checked={draft.vat} onChange={(event) => setDraft((current) => ({ ...current, vat: event.target.checked }))} /> Add VAT {VAT_RATE}%</label>
              <label htmlFor="wht">Withholding tax
                <select id="wht" value={draft.wht} onChange={(event) => { const rate = Number(event.target.value); if (isWhtRate(rate)) setDraft((current) => ({ ...current, wht: rate })); }}>
                  {WHT_RATES.map((rate) => <option key={rate} value={rate}>{rate === 0 ? "None" : rate + "% of subtotal"}</option>)}
                </select>
              </label>
            </fieldset>

            <div className="desk-actions">
              <button className="outline-button" type="button" onClick={addLine}>Add line</button>
              <button className="ink-button" type="button" onClick={copyInvoice}>{copyState === "copied" ? "Copied text" : copyState === "failed" ? "Copy blocked" : "Copy invoice text"}</button>
              <button className="outline-button" type="button" onClick={() => window.print()}>Print / save PDF</button>
            </div>
            <p className="sr-only" role="status">{copyState === "copied" ? "Invoice text copied to the clipboard." : copyState === "failed" ? "The browser blocked clipboard access." : ""}</p>
            <p className="desk-footnote">This is a portfolio-quality local preview, not a tax filing system or shared accounting service. VAT and withholding lines are arithmetic aids; they do not make this a Thai tax invoice.</p>
          </section>

          <aside className="invoice-paper" aria-label="Invoice preview">
            <div className="paper-top">
              <span className="paper-title">INVOICE</span>
              <span className="paper-meta">THB / {draft.number || "DRAFT"}{draft.issued ? " / " + draft.issued : ""}</span>
            </div>
            <div className="paper-rule" />
            <div className="paper-parties"><div><span>FROM</span><strong>{draft.from || "Unnamed sender"}</strong></div><div><span>BILL TO</span><strong>{draft.to || "Unnamed client"}</strong></div></div>
            <div className="paper-lines">
              {draft.lines.map((line) => <div className="paper-line" key={line.id}><span>{line.desc || "Untitled line"} <small>× {line.qty}</small></span><b>{formatTHB(lineTotal(line))}</b></div>)}
              {draft.lines.length === 0 && <p className="paper-empty">Add a line to begin.</p>}
            </div>
            {(draft.vat || draft.wht > 0) && (
              <dl className="paper-taxes">
                <div><dt>Subtotal</dt><dd>{formatTHB(totals.subtotal)}</dd></div>
                {draft.vat && <div><dt>VAT {VAT_RATE}%</dt><dd>{formatTHB(totals.vat)}</dd></div>}
                {draft.wht > 0 && <div><dt>Withholding tax {draft.wht}%</dt><dd>−{formatTHB(totals.wht)}</dd></div>}
              </dl>
            )}
            <div className="paper-total"><span>TOTAL DUE</span><strong>{formatTHB(totals.due)}</strong></div>
            <div className="paper-stamp">LOCAL<br />DRAFT</div>
            <p className="paper-note">Prepared in the browser · state is not shared</p>
          </aside>
        </div>

        <footer className="ledger-footer">No account, payment action, or hidden tax logic in this prototype. The arithmetic stays inspectable.</footer>
      </div>
    </main>
  );
}
