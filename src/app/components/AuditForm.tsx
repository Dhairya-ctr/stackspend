"use client";

import { useState, useEffect } from "react";
import { auditTool, type AuditInput, type AuditResult, type Confidence } from "@/lib/auditEngine";
import { pricing, toolOptions, useCases } from "@/data/pricing";

type PricingKey = keyof typeof pricing;

// ---------- helpers ----------

function validateSpend(raw: string): string | null {
  if (raw === "" || raw === undefined) return null; // empty = not yet touched
  const n = parseFloat(raw);
  if (isNaN(n))   return "Enter a valid number.";
  if (n < 0)      return "Spend cannot be negative.";
  return null;
}

function validateSeats(raw: string): string | null {
  if (raw === "" || raw === undefined) return null;
  const n = parseInt(raw, 10);
  if (isNaN(n))  return "Enter a whole number.";
  if (n < 1)     return "Minimum 1 seat required.";
  return null;
}

const CONFIDENCE_META: Record<Confidence, { label: string; className: string }> = {
  high:      { label: "High Savings Opportunity", className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  moderate:  { label: "Moderate Optimization",    className: "text-amber-400  bg-amber-400/10  border-amber-400/30"  },
  optimized: { label: "Already Optimized",         className: "text-zinc-400   bg-zinc-400/10   border-zinc-400/30"   },
};

// ---------- component ----------

export default function AuditForm() {
  const [tool,         setTool        ] = useState<string>("");
  const [plan,         setPlan        ] = useState<string>("");
  const [monthlySpend, setMonthlySpend] = useState<string>("");
  const [seats,        setSeats       ] = useState<string>("");
  const [useCase,      setUseCase     ] = useState<string>("");
  const [result,       setResult      ] = useState<AuditResult | null>(null);
  const [isLoading,    setIsLoading   ] = useState(false);

  // Track whether the user has interacted with a field (for inline errors)
  const [touchedSpend, setTouchedSpend] = useState(false);
  const [touchedSeats, setTouchedSeats] = useState(false);

  // ---- localStorage restore (once on mount) ----
  useEffect(() => {
    const saved = {
      tool:         localStorage.getItem("audit_tool")         ?? "",
      plan:         localStorage.getItem("audit_plan")         ?? "",
      seats:        localStorage.getItem("audit_seats")        ?? "",
      monthlySpend: localStorage.getItem("audit_monthlySpend") ?? "",
      useCase:      localStorage.getItem("audit_useCase")      ?? "",
    };
    if (saved.tool)         setTool(saved.tool);
    if (saved.plan)         setPlan(saved.plan);
    if (saved.seats)        setSeats(saved.seats);
    if (saved.monthlySpend) setMonthlySpend(saved.monthlySpend);
    if (saved.useCase)      setUseCase(saved.useCase);
  }, []);

  // ---- localStorage persist on every change ----
  useEffect(() => {
    localStorage.setItem("audit_tool",         tool);
    localStorage.setItem("audit_plan",         plan);
    localStorage.setItem("audit_seats",        seats);
    localStorage.setItem("audit_monthlySpend", monthlySpend);
    localStorage.setItem("audit_useCase",      useCase);
  }, [tool, plan, seats, monthlySpend, useCase]);

  // ---- derived validation ----
  const spendError = touchedSpend ? validateSpend(monthlySpend) : null;
  const seatsError = touchedSeats ? validateSeats(seats)        : null;

  const planOptions = tool ? Object.keys(pricing[tool as PricingKey] ?? {}) : [];

  const isFormValid =
    tool && plan && useCase &&
    monthlySpend !== "" && !validateSpend(monthlySpend) &&
    seats        !== "" && !validateSeats(seats);

  // ---- handlers ----
  function handleToolChange(value: string) {
    setTool(value);
    setPlan("");
    setResult(null);
  }

  /** Clamp spend to 0 on blur so the stored value is always clean. */
  function handleSpendBlur() {
    setTouchedSpend(true);
    const n = parseFloat(monthlySpend);
    if (!isNaN(n) && n < 0) setMonthlySpend("0");
  }

  /** Clamp seats to 1 on blur. */
  function handleSeatsBlur() {
    setTouchedSeats(true);
    const n = parseInt(seats, 10);
    if (!isNaN(n) && n < 1) setSeats("1");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setResult(null);

    // Use Math.max for a final safety net before passing to engine
    const input: AuditInput = {
      tool,
      plan,
      monthlySpend: Math.max(0, parseFloat(monthlySpend)),
      seats:        Math.max(1, parseInt(seats, 10)),
      useCase,
    };

    // Tiny artificial delay so the loading state is perceptible
    setTimeout(() => {
      setResult(auditTool(input));
      setIsLoading(false);
    }, 350);
  }

  // ---- shared input/select class builders ----
  const selectCls = (disabled = false) =>
    `w-full bg-zinc-900 border rounded-lg px-4 py-2.5 text-white text-sm
     focus:outline-none focus:ring-2 focus:ring-white/20 transition
     capitalize appearance-none cursor-pointer
     ${disabled ? "border-zinc-800 opacity-40 cursor-not-allowed" : "border-zinc-800"}`;

  const inputCls = (hasError: boolean) =>
    `w-full bg-zinc-900 border rounded-lg px-4 py-2.5 text-white text-sm
     focus:outline-none focus:ring-2 transition placeholder:text-zinc-600
     ${hasError
       ? "border-red-500/60 focus:ring-red-500/20"
       : "border-zinc-800 focus:ring-white/20"}`;

  // ---- render ----
  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>

        {/* Tool */}
        <div>
          <label htmlFor="tool" className="block text-sm font-medium text-zinc-400 mb-1.5">
            Tool
          </label>
          <select
            id="tool"
            value={tool}
            onChange={(e) => handleToolChange(e.target.value)}
            className={selectCls()}
          >
            <option value="" disabled>Select a tool</option>
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
            className={selectCls(!tool)}
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
              onBlur={handleSpendBlur}
              className={inputCls(!!spendError)}
            />
            {spendError && (
              <p className="mt-1 text-xs text-red-400">{spendError}</p>
            )}
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
              onBlur={handleSeatsBlur}
              className={inputCls(!!seatsError)}
            />
            {seatsError && (
              <p className="mt-1 text-xs text-red-400">{seatsError}</p>
            )}
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
            className={selectCls()}
          >
            <option value="" disabled>Select a use case</option>
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
          disabled={!isFormValid || isLoading}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl
                     hover:scale-[1.02] active:scale-[0.98] transition
                     disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed
                     cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Analyzing…
            </>
          ) : !isFormValid ? (
            "Complete all fields to audit"
          ) : (
            "Audit Stack"
          )}
        </button>
      </form>

      {/* Result panel */}
      {result && !isLoading && (
        <div className="mt-8 border border-zinc-800 rounded-xl p-6 bg-zinc-900/60 space-y-5 animate-in fade-in duration-300">

          {/* Confidence badge */}
          <div>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${CONFIDENCE_META[result.confidence].className}`}>
              {CONFIDENCE_META[result.confidence].label}
            </span>
          </div>

          {/* Recommendation */}
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Recommendation</p>
            <p className="text-lg font-semibold text-white">{result.recommendation}</p>
          </div>

          {/* Savings */}
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Estimated Monthly Savings</p>
            {result.savings > 0 ? (
              <p className="text-2xl font-bold text-emerald-400">${result.savings.toFixed(2)}/mo</p>
            ) : (
              <p className="text-sm text-zinc-500 italic">No savings identified — you&apos;re already on a good plan.</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Why</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{result.reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
