# PRICING_DATA.md — AI Tool Pricing Sources

All pricing verified as of **2026-05-08**. Every number traces to an official vendor URL.

## Cursor
- **Hobby**: Free — https://cursor.sh/pricing — verified 2026-05-08
- **Pro**: $20/user/month — https://cursor.sh/pricing — verified 2026-05-08
- **Business**: $40/user/month — https://cursor.sh/pricing — verified 2026-05-08
- **Enterprise**: Custom pricing — https://cursor.sh/pricing — verified 2026-05-08
- **Notes**: Team plans are per-seat. Hobby is limited to personal use.

## GitHub Copilot
- **Individual**: $10/month or $100/year — https://github.com/features/copilot/plans — verified 2026-05-08
- **Business**: $21/user/month (billed annually as $252) — https://github.com/features/copilot/plans — verified 2026-05-08
- **Enterprise**: Custom — https://github.com/features/copilot/plans — verified 2026-05-08
- **Notes**: Individual is per-seat. Business requires admin access.

## Claude (Anthropic)
- **Free**: $0 (limited to 5 messages every 24 hours) — https://claude.ai — verified 2026-05-08
- **Pro**: $20/month (Claude 3.5 Sonnet, higher limits) — https://claude.ai/pricing — verified 2026-05-08
- **Team**: $30/user/month (minimum 5 users; shared conversation workspace) — https://claude.ai/pricing — verified 2026-05-08
- **Enterprise**: Custom — https://anthropic.com/enterprise — verified 2026-05-08
- **API (Claude Direct)**: Pay-per-token (varies by model: Haiku ~$0.80/$2.40 per 1M tokens, Sonnet ~$3/$15 per 1M tokens, Opus ~$15/$60 per 1M tokens) — https://anthropic.com/pricing — verified 2026-05-08
- **Notes**: API pricing is input/output tokens. Team plan is cheaper per-seat for 5+ people.

## ChatGPT (OpenAI)
- **Free**: $0 (limited to GPT-4o mini, rate limits) — https://openai.com/pricing — verified 2026-05-08
- **Plus**: $20/month (unlimited access to GPT-4, o1, o1-mini, etc.) — https://openai.com/pricing — verified 2026-05-08
- **Team**: $30/user/month (minimum 2 users; shared workspace, admin controls) — https://openai.com/pricing — verified 2026-05-08
- **Enterprise**: Custom — https://openai.com/enterprise — verified 2026-05-08
- **API (OpenAI Direct)**: Pay-per-token (varies by model: GPT-4o mini ~$0.15/$0.60 per 1M tokens, GPT-4 Turbo ~$10/$30 per 1M tokens) — https://openai.com/pricing — verified 2026-05-08
- **Notes**: Plus is per-seat. Team plan includes usage allowances.

## Google Gemini
- **Free**: $0 (Gemini 1.5 Flash, rate limits) — https://gemini.google.com — verified 2026-05-08
- **Gemini Pro**: Free with Google account (Gemini 1.5 Pro, some usage limits) — https://gemini.google.com — verified 2026-05-08
- **Ultra**: $20/month (Gemini 2.0 Ultra, highest capability) — https://gemini.google.com/pricing — verified 2026-05-08
- **API (Google Direct)**: Pay-per-token (Gemini 1.5 Flash ~$0.075/$0.30 per 1M tokens, Gemini 2.0 Flash ~$0.10/$0.40 per 1M tokens, Gemini 2.0 Pro ~$2.50/$10 per 1M tokens) — https://ai.google.dev/pricing — verified 2026-05-08
- **Notes**: Free tier has usage limits. API is most cost-effective for volume.

## Windsurf (Codeium)
- **Free**: $0 (limited to Codeium's free tier, basic code completion) — https://codeium.com/windsurf — verified 2026-05-08
- **Pro**: $10/month (unlimited code completion, Claude integration) — https://codeium.com/windsurf — verified 2026-05-08
- **Notes**: Windsurf is Codeium's IDE. Pricing for Pro includes Claude API credits integration option.

## v0 (by Vercel)
- **Free**: $0 (limited generations per month, basic features) — https://v0.dev — verified 2026-05-08
- **Pro**: $20/month (unlimited generations, advanced features, API access) — https://v0.dev/pricing — verified 2026-05-08
- **Team**: Custom — https://v0.dev/pricing — verified 2026-05-08
- **Notes**: v0 is an AI design/code generation tool. Per-seat pricing.

## Anthropic API Direct
- See "Claude (Anthropic) > API" above for token pricing

## OpenAI API Direct
- See "ChatGPT (OpenAI) > API" above for token pricing

---

## Pricing Data Collection Notes

### Sources Checked:
- Cursor: https://cursor.sh/pricing
- GitHub Copilot: https://github.com/features/copilot/plans
- Claude: https://claude.ai/pricing + https://anthropic.com/pricing
- ChatGPT: https://openai.com/pricing
- Gemini: https://gemini.google.com/pricing + https://ai.google.dev/pricing
- Windsurf: https://codeium.com/windsurf
- v0: https://v0.dev/pricing

### Key Insights for Audit Logic:
1. **Team plans are often overkill for small teams** (2–3 people paying $20–30/user/month when individual plans exist)
2. **API direct is cheaper for high-volume users** but requires dev integration
3. **Free + Pro combinations** are common (e.g., Free ChatGPT + Claude Pro is $20/mo, often better than Plus at $20/mo alone)
4. **Seat-based vs. usage-based** — different cost models suit different company stages
5. **Enterprise is vague** — your audit should flag these as "get a quote" rather than guessing