## Day 1 — 2026-05-08

**Hours worked:** 4

**What I did:**
- Set up the StackSpend project using Next.js, TypeScript, and Tailwind CSS
- Created the initial landing page UI
- Initialized GitHub repository and pushed first commits
- Added required assignment markdown documentation files
- Planned overall architecture and audit engine structure

**What I learned:**
- The assignment is more product-focused than algorithm-focused
- Clean UX and explainable financial logic are more important than overengineering

**Blockers / what I'm stuck on:**
- Designing recommendation logic that feels financially realistic and defensible

**Plan for tomorrow:**
- Build the AI spend input form
- Start pricing data collection
- Implement the first version of the audit engine 

---

## Day 2 — 2026-05-09

**Hours worked:** 6

**What I did:**
- Built the interactive AI spend audit form
- Implemented dynamic pricing-based plan selection
- Created the initial audit recommendation engine
- Connected frontend form state to audit logic
- Added recommendation result cards with savings calculations
- Structured the project into components, data, and business logic layers

**What I learned:**
- Separating pricing data from audit logic makes recommendation rules easier to scale
- Dynamic forms significantly improve maintainability compared to hardcoded options
- Product clarity matters more than feature quantity

**Blockers / what I'm stuck on:**
- Expanding recommendation logic without making the rules overly complex
- Balancing realistic pricing heuristics with simple explainable outputs

**Plan for tomorrow:**
- Add localStorage persistence
- Write unit tests for audit logic
- Improve result explanations and recommendation quality
- Add edge-case validation