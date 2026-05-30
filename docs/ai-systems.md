# ViveKit — AI Systems & Model Routing

> Last Updated: 2026-05-29

---

## 1. Model Registry

ViveKit is configured with four models in `src/lib/ai/ai-config.ts`:

| Model ID | Provider | Context | Cost/1K Input | Use Case |
|:---|:---:|:---:|:---:|:---|
| `gemini-2.0-flash` | Google | 1M tokens | $0.0001 | Default — fast tasks, streaming, summarization |
| `gemini-2.0-pro` | Google | 2M tokens | $0.00125 | Complex reasoning, VIP disputes, contract analysis |
| `gpt-4o` | OpenAI | 128K tokens | $0.005 | Optional alternative |
| `claude-3-5-sonnet` | Anthropic | 200K tokens | $0.003 | Optional alternative |

Default in production: **Gemini 2.0 Flash** for all tasks. Gemini 2.0 Pro is routed for high-complexity reasoning tasks.

---

## 2. Dynamic Model Routing

`ROUTING_RULES` in `ai-config.ts`:

```
FAST tasks:      classify, summarize, extract  → gemini-2.0-flash
REASONING tasks: reply, analyze               → gemini-2.0-pro (when complexity = "high")
```

By routing the majority of traffic to Gemini 2.0 Flash, inference costs are reduced by up to 85% compared to running all requests through Gemini 2.0 Pro.

---

## 3. Global AI Configuration

```ts
DEFAULT_TEMPERATURE: 0.2    // Conservative — appropriate for business communication
MAX_RETRIES: 3              // Retry on transient Gemini failures
TIMEOUT_MS: 30000           // 30s hard timeout per request
```

---

## 4. Prompt Architecture

Prompts are assembled dynamically by `src/lib/ai/prompt-builder.ts` from 11 modular modules:

```
[System Core Persona]
  +
[Brand Voice Calibration]          ← tone_style, formality_level, persuasion_style
  +
[Operational Rules & Risk Control] ← forbidden_phrases, discount caps, delivery limits
  +
[Service Catalog Boundaries]       ← price ranges, revision policies, deliverables
  +
[Vector RAG Context]               ← match_memories_v2() results, weighted by importance_score
  +
[Raw Conversation Input]           ← pasted dialogue history
  +
[Additional Instructions]          ← operator-supplied real-time guidance
```

This strict layering prevents hallucinations and ensures replies respect business policies.

---

## 5. Streaming Architecture

`/api/ai/stream` uses Server-Sent Events (SSE) via the Vercel AI SDK:

```
Client (React) ──SSE──► /api/ai/stream ──► gemini.provider.ts ──► Gemini 2.0 API
                                                   │
                                        StreamingTextResponse
```

The stream body is type-checked at runtime — a null body throws an explicit error rather than a non-null assertion crash.

---

## 6. Security Integration

All three AI route handlers run `SecurityEngine.scanPromptInjection()` before any model call:

- Blocks strings like `"ignore previous instructions"`, `"system override"`, `"DROP TABLE"`
- Returns `HTTP 403` with `[SECURITY_BLOCKED]` log
- Injection attempts are persisted to `crm_security_incidents`

---

## 7. Observability

All AI operations are logged with structured tags:

- `[ViveKit_STREAM_ERROR]` — streaming failures
- `[APPROVAL_CONFIRMED]` — approved reply events
- `[SECURITY_BLOCKED]` — injection attempts
- `[AI_LOGGER]` — token usage, latency, model selection

---

Developed by **[ViveScript Solutions](https://www.vivescriptsolutions.com)**.
© ViveScript Solutions. All rights reserved.
