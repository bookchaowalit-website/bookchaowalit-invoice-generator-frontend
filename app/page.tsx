"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Line = { id: string; desc: string; qty: number; price: number };
type Draft = { from: string; to: string; lines: Line[] };

const INITIAL_DRAFT: Draft = {
  from: "Bookchaowalit",
  to: "Client Co.",
  lines: [
    { id: "1", desc: "Consulting", qty: 5, price: 1500 },
    { id: "2", desc: "Hosting", qty: 1, price: 500 },
  ],
};

function makeId() {
  return crypto.randomUUID();
}

function useDraft() {
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("invoice-generator-draft-v2");
      if (saved) {
        // Hydrate the browser-only draft after the server-rendered sample.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft(JSON.parse(saved) as Draft);
      }
    } catch {
      // Keep the useful sample when local storage is unavailable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("invoice-generator-draft-v2", JSON.stringify(draft));
  }, [draft, ready]);

  return [draft, setDraft] as const;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function Home() {
  const [draft, setDraft] = useDraft();
  const [copied, setCopied] = useState(false);
  const total = useMemo(() => draft.lines.reduce((sum, line) => sum + line.qty * line.price, 0), [draft.lines]);
  const invoiceText = useMemo(() => [
    "INVOICE / THB",
    "From: " + draft.from,
    "Bill to: " + draft.to,
    ...draft.lines.map((line) => line.desc + " × " + line.qty + " — ฿" + (line.qty * line.price).toLocaleString()),
    "Total: ฿" + total.toLocaleString(),
  ].join("\n"), [draft, total]);

  const updateLine = (id: string, update: Partial<Line>) => {
    setDraft((current) => ({ ...current, lines: current.lines.map((line) => line.id === id ? { ...line, ...update } : line) }));
  };

  const addLine = () => {
    setDraft((current) => ({ ...current, lines: [...current.lines, { id: makeId(), desc: "New line", qty: 1, price: 0 }] }));
  };

  const removeLine = (id: string) => {
    setDraft((current) => ({ ...current, lines: current.lines.filter((line) => line.id !== id) }));
  };

  const copyInvoice = async () => {
    if (await copyText(invoiceText)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <main className="ledger-room">
      <span className="contract-mark" dangerouslySetInnerHTML={{ __html: "<!-- THESIS: a THB invoice is assembled like a paper ledger; FINISH: live total, draft paper, local state -->" }} />
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
            </div>

            <div className="line-heading"><span>Line item</span><span>Qty</span><span>Rate / THB</span><span /></div>
            <div className="line-list">
              {draft.lines.map((line) => (
                <div className="line-row" key={line.id}>
                  <label><span className="sr-only">Description</span><input value={line.desc} onChange={(event) => updateLine(line.id, { desc: event.target.value })} /></label>
                  <label><span className="sr-only">Quantity</span><input aria-label={line.desc + " quantity"} type="number" min="0" value={line.qty} onChange={(event) => updateLine(line.id, { qty: Number(event.target.value) })} /></label>
                  <label><span className="sr-only">Rate in Thai baht</span><input aria-label={line.desc + " rate"} type="number" min="0" value={line.price} onChange={(event) => updateLine(line.id, { price: Number(event.target.value) })} /></label>
                  <button className="remove-line" type="button" onClick={() => removeLine(line.id)} disabled={draft.lines.length === 1}>Remove</button>
                </div>
              ))}
            </div>

            <div className="desk-actions">
              <button className="outline-button" type="button" onClick={addLine}>Add line</button>
              <button className="ink-button" type="button" onClick={copyInvoice}>{copied ? "Copied text" : "Copy invoice text"}</button>
            </div>
            <p className="desk-footnote">This is a portfolio-quality local preview, not a tax filing system or shared accounting service.</p>
          </section>

          <aside className="invoice-paper" aria-label="Invoice preview">
            <div className="paper-top">
              <span className="paper-title">INVOICE</span>
              <span className="paper-meta">THB / DRAFT</span>
            </div>
            <div className="paper-rule" />
            <div className="paper-parties"><div><span>FROM</span><strong>{draft.from || "Unnamed sender"}</strong></div><div><span>BILL TO</span><strong>{draft.to || "Unnamed client"}</strong></div></div>
            <div className="paper-lines">
              {draft.lines.map((line) => <div className="paper-line" key={line.id}><span>{line.desc || "Untitled line"} <small>× {line.qty}</small></span><b>฿{(line.qty * line.price).toLocaleString()}</b></div>)}
              {draft.lines.length === 0 && <p className="paper-empty">Add a line to begin.</p>}
            </div>
            <div className="paper-total"><span>TOTAL DUE</span><strong>฿{total.toLocaleString()}</strong></div>
            <div className="paper-stamp">LOCAL<br />DRAFT</div>
            <p className="paper-note">Prepared in the browser · state is not shared</p>
          </aside>
        </div>

        <footer className="ledger-footer">No account, payment action, or tax claim is hidden in this prototype. The arithmetic stays inspectable.</footer>
      </div>
    </main>
  );
}
