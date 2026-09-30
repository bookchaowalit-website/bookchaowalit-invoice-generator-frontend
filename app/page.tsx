"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatTHB, invoiceText as renderInvoiceText, invoiceTotal, lineTotal, parseDraft, toAmount, type Draft, type Line } from "@/lib/invoice";
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
  const total = useMemo(() => invoiceTotal(draft.lines), [draft.lines]);
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

            <div className="desk-actions">
              <button className="outline-button" type="button" onClick={addLine}>Add line</button>
              <button className="ink-button" type="button" onClick={copyInvoice}>{copyState === "copied" ? "Copied text" : copyState === "failed" ? "Copy blocked" : "Copy invoice text"}</button>
              <button className="outline-button" type="button" onClick={() => window.print()}>Print / save PDF</button>
            </div>
            <p className="sr-only" role="status">{copyState === "copied" ? "Invoice text copied to the clipboard." : copyState === "failed" ? "The browser blocked clipboard access." : ""}</p>
            <p className="desk-footnote">This is a portfolio-quality local preview, not a tax filing system or shared accounting service.</p>
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
            <div className="paper-total"><span>TOTAL DUE</span><strong>{formatTHB(total)}</strong></div>
            <div className="paper-stamp">LOCAL<br />DRAFT</div>
            <p className="paper-note">Prepared in the browser · state is not shared</p>
          </aside>
        </div>

        <footer className="ledger-footer">No account, payment action, or tax claim is hidden in this prototype. The arithmetic stays inspectable.</footer>
      </div>
    </main>
  );
}
