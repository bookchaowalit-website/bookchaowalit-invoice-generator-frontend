"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

function Shell({
  title,
  subtitle,
  badge = "Portfolio demo · local-only",
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{badge}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </header>
        {children}
        <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
          Honest demo: no multi-tenant backend. State (if any) stays in this browser.
        </footer>
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 " +
    className;
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      : variant === "secondary"
        ? "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-500"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);
  return [value, setValue] as const;
}

function uid() {
  return crypto.randomUUID();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}


type Line = { id: string; desc: string; qty: number; price: number };
export default function Home() {
  const [from, setFrom] = useState("Bookchaowalit");
  const [to, setTo] = useState("Client Co.");
  const [lines, setLines] = useState<Line[]>([
    { id: "1", desc: "Consulting", qty: 5, price: 1500 },
    { id: "2", desc: "Hosting", qty: 1, price: 500 },
  ]);
  const total = lines.reduce((a, l) => a + l.qty * l.price, 0);
  return (
    <Shell title="Invoice Generator" subtitle="Build a simple THB invoice preview entirely client-side.">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1"><span className="text-sm">From</span><input className={inputClass} value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="block space-y-1"><span className="text-sm">Bill to</span><input className={inputClass} value={to} onChange={(e) => setTo(e.target.value)} /></label>
      </div>
      <div className="mt-4 space-y-2">
        {lines.map((l) => (
          <div key={l.id} className="grid grid-cols-[1fr_80px_100px_auto] gap-2">
            <input className={inputClass} value={l.desc} onChange={(e) => setLines((prev) => prev.map((x) => x.id === l.id ? { ...x, desc: e.target.value } : x))} />
            <input type="number" className={inputClass} value={l.qty} onChange={(e) => setLines((prev) => prev.map((x) => x.id === l.id ? { ...x, qty: Number(e.target.value) } : x))} />
            <input type="number" className={inputClass} value={l.price} onChange={(e) => setLines((prev) => prev.map((x) => x.id === l.id ? { ...x, price: Number(e.target.value) } : x))} />
            <Button variant="ghost" onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))}>×</Button>
          </div>
        ))}
        <Button variant="secondary" onClick={() => setLines((prev) => [...prev, { id: uid(), desc: "Item", qty: 1, price: 0 }])}>Add line</Button>
      </div>
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-sm text-zinc-500">Invoice preview</div>
        <div className="mt-2 font-medium">{from} → {to}</div>
        <ul className="mt-3 space-y-1 text-sm">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between"><span>{l.desc} × {l.qty}</span><span className="font-mono">฿{(l.qty * l.price).toLocaleString()}</span></li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-zinc-200 pt-3 text-lg font-semibold dark:border-zinc-800">
          <span>Total</span><span className="font-mono">฿{total.toLocaleString()}</span>
        </div>
      </div>
    </Shell>
  );
}
