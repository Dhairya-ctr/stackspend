"use client";

import { useState } from "react";
import { auditTool, type AuditInput, type AuditResult } from "@/lib/auditEngine";
import { pricing, toolOptions, useCases } from "@/data/pricing";

type PricingKey = keyof typeof pricing;

export default function AuditForm() {
  const [tool, setTool] = useState<string>("");
  const [plan, setPlan] = useState<string>("");
  const [monthlySpend, setMonthlySpend] = useState<string>("");
  const [seats, setSeats] = useState<string>("");
  const [useCase, setUseCase] = useState<string>("");
  const [result, setResult] = useState<AuditResult | null>(null);

  const planOptions = tool ? Object.keys(pricing[tool as PricingKey] ?? {}) : [];

  function handleToolChange(value: string) {
    setTool(value);
    setPlan("");
    setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tool || !plan || !monthlySpend || !seats || !useCase) return;

    const input: AuditInput = {
      tool,
      plan,
      monthlySpend: parseFloat(monthlySpend),
      seats: parseInt(seats, 10),
      useCase,
    };

    const auditResult = auditTool(input);
    setResult(auditResult);
  }

  const isFormValid = tool && plan && monthlySpend && seats && useCase;

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tool */}
        <div>
          <label htmlFor="tool" className="block text-sm font-medium text-zinc-400 mb-1.5">
            Tool
          </label>
          <select
            id="tool"
            value={tool}
            onChange={(e) => handleToolChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition capitalize appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Select a tool
            </option>
            {toolOptions.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Plan */}
        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-zinc-400 mb-1.5">
            Plan
          </label>
          <select
            id="plan"
            value={plan}
            onChange={(e) => { setPlan(e.target.value); setResult(null); }}
            disabled={!tool}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition capitalize appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {tool ? "Select a plan" : "Choose a tool first"}
            </option>
            {planOptions.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Spend & Seats — side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="monthlySpend" className="block text-sm font-medium text-zinc-400 mb-1.5">
              Monthly Spend ($)
            </label>
            <input
              id="monthlySpend"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 60"
              value={monthlySpend}
              onChange={(e) => { setMonthlySpend(e.target.value); setResult(null); }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label htmlFor="seats" className="block text-sm font-medium text-zinc-400 mb-1.5">
              Seats
            </label>
            <input
              id="seats"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 3"
              value={seats}
              onChange={(e) => { setSeats(e.target.value); setResult(null); }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Use Case */}
        <div>
          <label htmlFor="useCase" className="block text-sm font-medium text-zinc-400 mb-1.5">
            Primary Use Case
          </label>
          <select
            id="useCase"
            value={useCase}
            onChange={(e) => { setUseCase(e.target.value); setResult(null); }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition capitalize appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Select a use case
            </option>
            {useCases.map((uc) => (
              <option key={uc} value={uc} className="capitalize">
                {uc.charAt(0).toUpperCase() + uc.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
        >
          Audit Stack
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="mt-8 border border-zinc-800 rounded-xl p-6 bg-zinc-900/60 space-y-4 animate-in fade-in duration-300">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Recommendation</p>
            <p className="text-lg font-semibold text-white">{result.recommendation}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Estimated Savings</p>
            <p className={`text-2xl font-bold ${result.savings > 0 ? "text-emerald-400" : "text-zinc-400"}`}>
              {result.savings > 0 ? `$${result.savings.toFixed(2)}/mo` : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Reason</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
