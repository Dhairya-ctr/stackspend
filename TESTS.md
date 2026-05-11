# TESTS.md — StackSpend Audit Engine

## Testing Framework

| Item | Detail |
|---|---|
| Framework | [Vitest](https://vitest.dev) v1 |
| Language | TypeScript (ESM, path aliases via `vitest.config.ts`) |
| Test file | `src/lib/auditEngine.test.ts` |
| Config | `vitest.config.ts` (root) |

---

## Running Tests

```bash
# Install deps (first time only)
npm install

# Run all tests once
npm test

# Watch mode — re-runs on file save
npm run test:watch
```

Expected output on a clean run:

```
 ✓ src/lib/auditEngine.test.ts (8 tests) 12ms
 Test Files  1 passed (1)
 Tests       8 passed (8)
```

---

## Test Cases

### 1. ChatGPT Team → Plus downgrade (small team)
**Input:** `chatgpt / team / 2 seats / $60 / writing`  
**Asserts:**
- Recommendation contains "Plus"
- `savings > 0`
- `confidence === "high"`  

**Why it matters:** Team plan becomes cost-inefficient below 5 seats — the most common ChatGPT over-spend pattern.

---

### 2. Cursor Business → Pro downgrade (solo developer)
**Input:** `cursor / business / 1 seat / $40 / coding`  
**Asserts:**
- Recommendation matches `/cursor pro/i`
- `savings === 20` (exact: 40 − 20)
- `confidence === "high"`  

**Why it matters:** Solo devs routinely land on Business plans without needing SSO or audit logs.

---

### 3. Gemini Ultra **retained** for research
**Input:** `gemini / ultra / 1 seat / $32 / research`  
**Asserts:**
- Recommendation matches `/optimized/i`
- `savings === 0`
- `confidence === "optimized"`  

**Why it matters:** Validates that the engine does *not* fire a false downgrade recommendation when the use case genuinely justifies a premium tier.

---

### 4. Gemini Ultra → Pro downgrade (non-research)
**Input:** `gemini / ultra / 1 seat / $32 / writing`  
**Asserts:**
- Recommendation matches `/gemini pro/i`
- `savings > 0`
- `confidence === "moderate"`  

**Why it matters:** Complements test 3 — same plan, different use case, should produce a downgrade.

---

### 5. No savings — already optimized
**Input:** `copilot / pro / 3 seats / $60 / coding`  
**Asserts:**
- `savings === 0`
- `confidence === "optimized"`  

**Why it matters:** Ensures the fallback path returns a clean, non-misleading zero-savings result.

---

### 6. Overprovisioning — high spend, solo user
**Input:** `chatgpt / pro / 1 seat / $200 / mixed`  
**Asserts:**
- Recommendation matches `/enterprise|review/i`
- `savings > 0`
- `confidence === "moderate"`  

**Why it matters:** Catches the common scenario of a solo founder on an enterprise plan they inherited or never reconsidered.

---

### 7. Edge case — savings cannot exceed monthly spend *(impossible savings guard)*
**Input:** `cursor / business / 1 seat / $5 / coding`  
**Asserts:**
- `savings <= 5` (clamped by `Math.min`)
- `savings >= 0`  

**Why it matters:** Without this guard, the engine could report saving more than the user actually spends — a credibility-destroying bug.

---

### 8. Edge case — negative monthlySpend is sanitized to zero
**Input:** `claude / team / 2 seats / -50 / writing`  
**Asserts:**
- No exception thrown
- `savings >= 0`  

**Why it matters:** Proves the `Math.max(0, monthlySpend)` guard inside the engine prevents arithmetic nonsense from propagating into the result.

---

## Edge Cases Covered

| Edge Case | How Handled |
|---|---|
| Negative spend | `Math.max(0, monthlySpend)` in engine |
| Seats < 1 | `Math.max(1, seats)` in engine |
| Savings > spend | `Math.min(raw, monthlySpend)` in `clampSavings()` |
| Unknown tool / plan | Early `optimized` return guard |
| Gemini Ultra + research | Explicit retain rule before downgrade rule |

---

## Why These Tests Matter

Pricing recommendation engines are easy to get subtly wrong — off-by-one seat counts, inverted comparison operators, or arithmetic that produces nonsensical savings figures all erode user trust immediately.

These tests enforce:

- **Correctness** of every named rule branch in `auditEngine.ts`
- **Boundary safety** so malformed inputs never reach the rule logic uncleaned
- **Regression protection** — any future change to pricing tiers or rule order will surface immediately in CI before it reaches users
