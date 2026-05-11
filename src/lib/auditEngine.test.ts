import { describe, it, expect } from "vitest";
import { auditTool } from "@/lib/auditEngine";

// ---------------------------------------------------------------------------
// auditEngine.ts — unit tests
// ---------------------------------------------------------------------------

describe("auditTool()", () => {

  // 1. ChatGPT Team → downgrade for small teams
  it("recommends ChatGPT Plus when team plan has fewer than 5 seats", () => {
    const result = auditTool({
      tool: "chatgpt",
      plan: "team",
      seats: 2,
      monthlySpend: 60,
      useCase: "writing",
    });

    expect(result.recommendation).toMatch(/plus/i);
    expect(result.savings).toBeGreaterThan(0);
    expect(result.confidence).toBe("high");
  });

  // 2. Cursor Business → downgrade for solo developer
  it("recommends Cursor Pro when Business plan is used by a single seat", () => {
    const result = auditTool({
      tool: "cursor",
      plan: "business",
      seats: 1,
      monthlySpend: 40,
      useCase: "coding",
    });

    expect(result.recommendation).toMatch(/cursor pro/i);
    expect(result.savings).toBe(20); // 40 - 20
    expect(result.confidence).toBe("high");
  });

  // 3. Gemini Ultra retained for research workflows
  it("keeps Gemini Ultra when use case is research", () => {
    const result = auditTool({
      tool: "gemini",
      plan: "ultra",
      seats: 1,
      monthlySpend: 32,
      useCase: "research",
    });

    expect(result.recommendation).toMatch(/optimized/i);
    expect(result.savings).toBe(0);
    expect(result.confidence).toBe("optimized");
  });

  // 4. Gemini Ultra → downgrade for non-research use case
  it("recommends Gemini Pro when Ultra is used for a non-research use case", () => {
    const result = auditTool({
      tool: "gemini",
      plan: "ultra",
      seats: 1,
      monthlySpend: 32,
      useCase: "writing",
    });

    expect(result.recommendation).toMatch(/gemini pro/i);
    expect(result.savings).toBeGreaterThan(0);
    expect(result.confidence).toBe("moderate");
  });

  // 5. No savings case → optimized result
  it("returns optimized result when no cheaper alternative exists", () => {
    const result = auditTool({
      tool: "copilot",
      plan: "pro",
      seats: 3,
      monthlySpend: 60,
      useCase: "coding",
    });

    expect(result.savings).toBe(0);
    expect(result.confidence).toBe("optimized");
  });

  // 6. High-spend solo user → overprovisioning recommendation
  it("flags overprovisioning when a solo user spends more than $150/month", () => {
    const result = auditTool({
      tool: "chatgpt",
      plan: "pro",
      seats: 1,
      monthlySpend: 200,
      useCase: "mixed",
    });

    expect(result.recommendation).toMatch(/enterprise|review/i);
    expect(result.savings).toBeGreaterThan(0);
    expect(result.confidence).toBe("moderate");
  });

  // 7. Edge case: savings can never exceed monthlySpend (impossible savings guard)
  it("never returns savings that exceed the reported monthly spend", () => {
    // Artificially low spend to trigger the clamp
    const result = auditTool({
      tool: "cursor",
      plan: "business",
      seats: 1,
      monthlySpend: 5,   // less than the normal $20 Pro price — engine must clamp
      useCase: "coding",
    });

    expect(result.savings).toBeLessThanOrEqual(5);
    expect(result.savings).toBeGreaterThanOrEqual(0);
  });

  // 8. Edge case: negative monthlySpend is sanitized to 0
  it("treats negative monthlySpend as zero without throwing", () => {
    expect(() =>
      auditTool({
        tool: "claude",
        plan: "team",
        seats: 2,
        monthlySpend: -50,
        useCase: "writing",
      })
    ).not.toThrow();

    const result = auditTool({
      tool: "claude",
      plan: "team",
      seats: 2,
      monthlySpend: -50,
      useCase: "writing",
    });

    expect(result.savings).toBeGreaterThanOrEqual(0);
  });
});
