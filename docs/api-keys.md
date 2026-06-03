# API Keys Documentation

## Overview

ViveKit supports three AI providers for response generation:
- **Google Gemini**
- **OpenAI** (GPT-4, GPT-4o)
- **Anthropic Claude** (Claude 3.5 Sonnet, Opus, Haiku)

Users supply their own API keys (BYOK model), which are never stored on ViveKit servers. Keys are forwarded as `X-AI-Key` headers in requests and used only for that specific API call.

## Security Model

### Key Handling

- ❌ **Keys are NOT stored** in the database
- ❌ **Keys are NOT logged** in debug logs
- ❌ **Keys are NOT cached** between requests
- ✅ **Keys are forwarded** as secure headers only
- ✅ **Keys are validated** before use
- ✅ **Keys are isolated** per user/account

### API Call Flow

```
User provides key in UI
        ↓
Key validated (format check, length check)
        ↓
Prompt + context assembled
        ↓
Request sent to AI provider
   Headers: X-AI-Key: [user's key]
        ↓
Response received
        ↓
Key discarded (not stored)
```

## Provider Setup

### 1. Google Gemini

**What You Need:**
- Google Cloud Project with Gemini API enabled
- API key (not OAuth)

**Where to Get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project (or select existing)
3. Enable "Generative Language API"
4. Go to Credentials → Create API Key
5. Copy the key

**In ViveKit:**
1. Settings → AI Providers
2. Select "Google Gemini"
3. Paste your API key
4. Click "Verify Connection"
5. Check "Use for response generation"

**Models Available:**
- `gemini-2.0-flash` (latest, fast, low cost)
- `gemini-1.5-pro` (most capable)
- `gemini-1.5-flash` (balanced)

**Pricing:**
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens
- Free tier: 15 requests/minute (generous for testing)

**Rate Limits:**
- Free: 15 requests/minute, 1,500 requests/day
- Paid: Higher with scaling

### 2. OpenAI

**What You Need:**
- OpenAI API key (from your organization)
- Billing enabled on your account

**Where to Get:**
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign in or create account
3. Navigate to API Keys
4. Click "Create new secret key"
5. Copy the key (you won't see it again)

**In ViveKit:**
1. Settings → AI Providers
2. Select "OpenAI"
3. Paste your API key
4. Click "Verify Connection"
5. Check "Use for response generation"

**Models Available:**
- `gpt-4o` (latest, most capable, recommended)
- `gpt-4-turbo` (powerful, cheaper than GPT-4)
- `gpt-3.5-turbo` (fastest, cheapest)

**Pricing:**
- GPT-4o: Input $5/1M, Output $15/1M tokens
- GPT-4-turbo: Input $10/1M, Output $30/1M tokens
- GPT-3.5-turbo: Input $0.50/1M, Output $1.50/1M tokens

**Rate Limits:**
- Standard: 3,500 requests/minute (higher with usage)
- Upgradeable based on account history

### 3. Anthropic Claude

**What You Need:**
- Anthropic API key
- Billing enabled on your account

**Where to Get:**
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Sign in or create account
3. Navigate to API Keys
4. Click "Create Key"
5. Copy the key

**In ViveKit:**
1. Settings → AI Providers
2. Select "Anthropic Claude"
3. Paste your API key
4. Click "Verify Connection"
5. Check "Use for response generation"

**Models Available:**
- `claude-3-5-sonnet-20241022` (latest, best balance)
- `claude-3-opus-20250219` (most capable, higher cost)
- `claude-3-haiku-20240307` (fastest, cheapest)

**Pricing:**
- Sonnet: Input $3/1M, Output $15/1M tokens
- Opus: Input $15/1M, Output $75/1M tokens
- Haiku: Input $0.80/1M, Output $4/1M tokens

**Rate Limits:**
- Standard: 40 requests/minute

## Configuration in ViveKit

### Admin Settings

Navigate to: **Settings → AI Providers & Routing**

```
┌────────────────────────────────────────┐
│ AI Provider Configuration              │
├────────────────────────────────────────┤
│                                        │
│ ☑ Google Gemini                       │
│   Model: gemini-2.0-flash             │
│   Priority: 1 (Primary)               │
│   Cost tracking: Enabled              │
│                                        │
│ ☑ OpenAI                              │
│   Model: gpt-4o                       │
│   Priority: 2 (Fallback)              │
│   Cost tracking: Enabled              │
│                                        │
│ ☐ Anthropic Claude                    │
│   Model: claude-3-5-sonnet            │
│   Priority: 3 (Emergency)             │
│   Cost tracking: Disabled             │
│                                        │
│ [Update Configuration]                │
└────────────────────────────────────────┘
```

### Per-Conversation Provider Selection

Users can override the default provider when generating responses:

```
UI: [Select Provider ▼]
    - Google Gemini (Primary)
    - OpenAI (Fallback)
    - Claude (Manual Override)

Generate Response [Button]
```

### Fallback Routing

If primary provider fails:
1. Try primary provider
2. If timeout/error → try secondary provider
3. If secondary fails → try tertiary provider
4. If all fail → return error to user

**Configuration:**
```json
{
  "routing": {
    "primary": "gemini",
    "fallback": "openai",
    "emergency": "claude",
    "timeoutSeconds": 30,
    "retries": 2
  }
}
```

## Cost Tracking & Monitoring

### Costs Dashboard

ViveKit automatically tracks costs per provider:

```
Settings → Usage & Costs

Total Usage This Month: 2.3M tokens
Total Cost: $45.32

Provider Breakdown:
┌──────────┬─────────┬────────┬─────────┐
│ Provider │ Tokens  │ Cost   │ % Total │
├──────────┼─────────┼────────┼─────────┤
│ Gemini   │ 1.5M    │ $22.50 │ 49.7%   │
│ OpenAI   │ 650K    │ $19.50 │ 43.1%   │
│ Claude   │ 150K    │ $3.32  │ 7.3%    │
└──────────┴─────────┴────────┴─────────┘

Daily Breakdown:
- Yesterday: 180K tokens, $4.50
- Today: 420K tokens, $8.75
- Trend: ↑ 15% from last week
```

### Cost Estimation

Before generating response, ViveKit estimates costs:

```
Estimated Usage:
- Input tokens: ~850 (prompt + context)
- Output tokens: ~200 (response)
- Total: ~1,050 tokens

Cost Estimate: $0.08 (Gemini)
              $0.15 (OpenAI)
              $0.06 (Claude)

[Generate with Gemini] [Other Providers...]
```

### Alerts & Limits

Set usage alerts to avoid surprises:

```
Settings → Cost Controls

Daily Spend Limit: $50
⚠️ Alert at: $40 (80% usage)

Monthly Spend Limit: $500
⚠️ Alert at: $400 (80% usage)

Auto-disable providers when limit reached:
☑ Stop using expensive providers
☑ Switch to cheaper alternatives
☐ Block all generation (manual review)
```

## Troubleshooting

### Invalid API Key

**Error:** "401 Unauthorized"

**Solutions:**
1. Verify key was copied completely (no extra spaces)
2. Check key hasn't been revoked in provider console
3. For Gemini: Ensure API is enabled in Google Cloud
4. For OpenAI: Check billing is active and account not suspended
5. For Claude: Verify key is from console.anthropic.com, not old keys

### Rate Limit Exceeded

**Error:** "429 Too Many Requests"

**Solutions:**
1. Wait 1 minute before retrying
2. Upgrade to higher tier on provider account
3. Switch to cheaper/faster provider
4. Batch requests instead of immediate retry
5. For production: Contact provider support for rate limit increase

### Provider Timeout

**Error:** "Request timeout (>30s)"

**Solutions:**
1. Try different provider (might be provider issue)
2. Reduce prompt complexity/context size
3. Try faster model (e.g., Gemini Flash instead of 1.5 Pro)
4. Check your internet connection
5. Wait a few minutes and retry

### Key Appears in Logs

**Concern:** "My API key might be exposed"

**Response:**
1. ViveKit never logs API keys
2. Check browser console/network tab (keys should not appear)
3. If found in logs: This indicates a bug. Report to ViveKit support immediately
4. **Immediately revoke** the exposed key in provider console
5. Generate new key and update ViveKit

## Best Practices

### 1. Use Environment-Specific Keys

Create separate API keys for:
- **Development** (low cost key, not production)
- **Staging** (test key)
- **Production** (main key, highest rate limit)

**Don't:**
```
❌ Share production keys in team Slack
❌ Use same key across all environments
❌ Leave keys in git repositories
```

**Do:**
```
✅ Store keys in ViveKit settings only
✅ Use separate keys per environment
✅ Rotate keys quarterly
✅ Revoke keys that are no longer needed
```

### 2. Monitor Costs Regularly

```
Weekly: Check Usage & Costs dashboard
- Look for unexpected spikes
- Verify tokens/cost ratios

Monthly: Review provider breakdown
- Which provider is most cost-effective?
- Any optimization opportunities?

Quarterly: Audit and rotate keys
- Revoke old keys
- Generate new ones
- Update provider rate limits
```

### 3. Optimize Token Usage

Reduce costs by:
- **Summarize context** (don't include full 10,000-token history)
- **Use cheaper models** when appropriate (Gemini Flash vs 1.5 Pro)
- **Batch requests** (fewer separate calls)
- **Cache frequently-used prompts**

### 4. Set Spending Controls

```
Conservative:
- Daily limit: $10
- Monthly limit: $200
- Alert at 50% usage

Standard:
- Daily limit: $50
- Monthly limit: $1,000
- Alert at 75% usage

Aggressive:
- Daily limit: $200
- Monthly limit: $5,000
- Alert at 90% usage
```

## Provider Comparison

| Factor | Gemini | OpenAI | Claude |
|--------|--------|--------|--------|
| **Speed** | ⚡ Fastest | ⚡ Very Fast | ⚡ Fast |
| **Cost** | $ Cheapest | $$ Mid-range | $$ Mid-range |
| **Quality** | ★★★★ Excellent | ★★★★★ Best | ★★★★★ Best |
| **Latency** | 1-2s | 2-3s | 2-3s |
| **Rate Limit** | 15 req/min (free) | High | 40 req/min |
| **Best For** | Rapid iteration, cost-sensitive | Enterprise, quality | Complex reasoning, safety |

## Common Use Cases

### Scenario 1: Budget-Conscious Startup

**Setup:**
- Primary: Gemini (2.0 Flash)
- Fallback: Claude Haiku
- Avoid: GPT-4o (too expensive)

**Config:**
```json
{
  "defaultProvider": "gemini",
  "fallback": "claude-haiku",
  "costLimit": "$100/month",
  "autoSwitchOnCost": true
}
```

**Cost:** ~$80/month for 500K tokens

### Scenario 2: Enterprise Quality

**Setup:**
- Primary: GPT-4o (best quality)
- Fallback: Claude Sonnet (similar quality)
- Secondary: Gemini (if needed)

**Config:**
```json
{
  "defaultProvider": "openai",
  "fallback": "claude",
  "costLimit": "$2,000/month",
  "requireHighQuality": true
}
```

**Cost:** ~$1,500/month for 1M tokens

### Scenario 3: Balanced Approach

**Setup:**
- Gemini (primary, cheap)
- Claude (fallback, quality)
- OpenAI (emergency only)

**Config:**
```json
{
  "routing": {
    "cheap": "gemini",
    "balanced": "claude",
    "expensive": "openai"
  }
}
```

**Cost:** ~$200/month for 500K tokens

---

Last Updated: 2026-06-03
