export type AuditInput = {
    tool: string;
    plan: string;
    seats: number;
    monthlySpend: number;
    useCase: string;
};

export type Confidence = "high" | "moderate" | "optimized";

export type AuditResult = {
    recommendation: string;
    savings: number;
    reason: string;
    confidence: Confidence;
};

/** Clamp a raw savings figure so it can never exceed what the user actually pays
 *  and can never be negative. */
function clampSavings(raw: number, monthlySpend: number): number {
    return Math.max(0, Math.min(raw, monthlySpend));
}

export function auditTool(input: AuditInput): AuditResult {
    // --- Sanitize inputs so the engine is impossible to break ---
    const tool         = input.tool?.trim().toLowerCase() ?? "";
    const plan         = input.plan?.trim().toLowerCase() ?? "";
    const useCase      = input.useCase?.trim().toLowerCase() ?? "";
    const seats        = Math.max(1, Math.floor(input.seats ?? 1));
    const monthlySpend = Math.max(0, input.monthlySpend ?? 0);

    // Guard: unknown tool or plan → early optimized return
    if (!tool || !plan) {
        return {
            recommendation: "Current plan looks optimized",
            savings: 0,
            reason: "Not enough information to make a recommendation.",
            confidence: "optimized",
        };
    }

    // --- ChatGPT rules ---
    if (tool === "chatgpt" && useCase === "coding") {
        return {
            recommendation: "Consider Cursor Pro + ChatGPT Free",
            savings: clampSavings(10, monthlySpend),
            reason:
                "Developer-focused workflows rarely benefit from ChatGPT's conversation-tier pricing. " +
                "A coding-first IDE like Cursor handles completions and inline edits more efficiently, " +
                "while the free ChatGPT tier covers ad-hoc queries. Separating these concerns typically " +
                "reduces spend without any capability loss.",
            confidence: "high",
        };
    }

    if (tool === "chatgpt" && plan === "team" && seats < 5) {
        const raw = monthlySpend - 20 * seats;
        return {
            recommendation: "Switch to ChatGPT Plus (per member)",
            savings: clampSavings(raw, monthlySpend),
            reason:
                "ChatGPT Team unlocks collaborative workspaces and admin controls — features that " +
                "deliver diminishing returns for teams smaller than 5. Individual Plus subscriptions " +
                "provide equivalent model access at a lower blended cost for your team size.",
            confidence: "high",
        };
    }

    // --- Cursor rules ---
    if (tool === "cursor" && plan === "business" && seats === 1) {
        const raw = monthlySpend - 20;
        return {
            recommendation: "Switch to Cursor Pro",
            savings: clampSavings(raw, monthlySpend),
            reason:
                "Cursor Business is designed for teams that require SSO, audit logs, and centralised " +
                "billing. A solo developer gains none of these benefits. Cursor Pro delivers the same " +
                "AI completion quality at half the price.",
            confidence: "high",
        };
    }

    // --- Claude rules ---
    if (tool === "claude" && plan === "team" && seats < 5) {
        const raw = monthlySpend - 20;
        return {
            recommendation: "Switch to Claude Pro",
            savings: clampSavings(raw, monthlySpend),
            reason:
                "Claude Team pricing is structured around shared context windows and collaborative " +
                "projects — value that scales with team size. Below five seats, the per-user cost " +
                "exceeds Claude Pro without meaningful additional benefit for most workflows.",
            confidence: "high",
        };
    }

    // --- GitHub Copilot rules ---
    if (tool === "copilot" && plan === "business" && seats <= 2) {
        const raw = monthlySpend - 10 * seats;
        return {
            recommendation: "Switch to GitHub Copilot Individual",
            savings: clampSavings(raw, monthlySpend),
            reason:
                "Copilot Business adds organisation-level policy controls and SAML SSO. For one or " +
                "two developers these governance features are rarely used, making the per-seat premium " +
                "difficult to justify over the individual tier.",
            confidence: "high",
        };
    }

    // --- Gemini rules ---
    if (tool === "gemini" && plan === "ultra" && useCase !== "research") {
        const raw = monthlySpend - 20;
        return {
            recommendation: "Switch to Gemini Pro",
            savings: clampSavings(raw, monthlySpend),
            reason:
                "Gemini Ultra's primary advantage is its extended context window and experimental " +
                "capabilities suited to deep research and long-document analysis. For coding, writing, " +
                "or mixed workloads, Gemini Pro provides comparable quality at significantly lower cost.",
            confidence: "moderate",
        };
    }

    // Gemini Ultra retained for research — explicit keep rule
    if (tool === "gemini" && plan === "ultra" && useCase === "research") {
        return {
            recommendation: "Current plan looks optimized",
            savings: 0,
            reason:
                "Gemini Ultra's extended context and experimental reasoning features are well-matched " +
                "to research-heavy workflows. No cheaper alternative offers equivalent capability for " +
                "this use case.",
            confidence: "optimized",
        };
    }

    // --- Overprovisioning: high spend, solo user ---
    if (monthlySpend > 150 && seats === 1) {
        return {
            recommendation: "Review enterprise-tier subscriptions",
            savings: clampSavings(50, monthlySpend),
            reason:
                "Spending over $150/month as a single user is a strong signal of over-provisioned " +
                "enterprise or team tiers. Review each active subscription for features you are not " +
                "actively using — consolidating to individual plans could yield significant savings.",
            confidence: "moderate",
        };
    }

    // --- Optimized fallback ---
    return {
        recommendation: "Current plan looks optimized",
        savings: 0,
        reason:
            "Based on your tool, plan, team size, and primary use case, no significantly cheaper or " +
            "better-fit alternative was identified. Your current setup appears well-matched to your needs.",
        confidence: "optimized",
    };
}
