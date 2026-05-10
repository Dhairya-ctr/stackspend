export type AuditInput = {
    tool: string;
    plan: string;
    seats: number;
    monthlySpend: number;
    useCase: string;
};

export type AuditResult = {
    recommendation: string;
    savings: number;
    reason: string;
};

export function auditTool(input: AuditInput): AuditResult {
    const { tool, plan, seats, monthlySpend, useCase } = input;

    // ChatGPT rules
    if (tool === "chatgpt" && useCase === "coding") {
        return {
            recommendation: "Consider Cursor Pro + ChatGPT Free",
            savings: 10,
            reason:
                "Developer-focused workflows may get better value from coding-first AI tools.",
        };
    }

    // Cursor rules
    if (tool === "cursor" && plan === "business" && seats === 1) {
        return {
            recommendation: "Switch to Cursor Pro",
            savings: monthlySpend - 20,
            reason:
                "Cursor Business is optimized for teams and compliance workflows, not solo developers.",
        };
    }

    // Claude rules
    if (tool === "claude" && plan === "team" && seats < 5) {
        return {
            recommendation: "Switch to Claude Pro",
            savings: monthlySpend - 20,
            reason:
                "Claude Team becomes more cost-effective at larger team sizes with shared collaboration needs.",
        };
    }

    // Copilot rules
    if (tool === "copilot" && plan === "business" && seats <= 2) {
        return {
            recommendation: "Switch to GitHub Copilot Individual",
            savings: monthlySpend - 10,
            reason:
                "Business features may not justify the higher per-seat pricing for very small teams.",
        };
    }

    // Gemini rules
    if (tool === "gemini" && plan === "ultra" && useCase !== "research") {
        return {
            recommendation: "Switch to Gemini Pro",
            savings: monthlySpend - 20,
            reason:
                "Gemini Ultra is primarily valuable for extremely large-context workloads and advanced research tasks.",
        };
    }

    if (monthlySpend > 150 && seats === 1) {
        return {
            recommendation: "Review enterprise-tier subscriptions",
            savings: 50,
            reason:
                "High monthly spend for a solo user may indicate overprovisioned plans.",
        };
    }

    // Already optimized fallback
    return {
        recommendation: "Current plan looks optimized",
        savings: 0,
        reason:
            "No significantly cheaper or better-fit alternative was identified based on the provided inputs.",
    };
}

