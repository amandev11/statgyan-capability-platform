# StatGyan AI Assessment Engine — setup

StatGyan's generation pipeline is **AI-first with a deterministic fallback**.
Without any configuration the app remains fully functional using the offline
deterministic engine. Adding one key upgrades generation to real AI.

## Configuration

Add these in the project's Keys / API keys panel (never in client code):

| Env var | Required for AI | Default | Purpose |
|---|---|---|---|
| `OPENROUTER_API_KEY` | yes | — | OpenRouter key. Read only inside `src/convex/ai.ts` (a Node Convex action); it never reaches the browser, localStorage, or any network request from the client. |
| `AI_PRIMARY_MODEL` | no | `openrouter/free` | The `openrouter/free` router auto-selects currently-available free models that support structured JSON output — so the default cannot go obsolete. Point it at any specific model to pin it. |
| `AI_FALLBACK_MODEL` | no | — | Optional second model tried if the primary is rate-limited or unavailable. |

No paid model is hard-coded anywhere; both model slots are fully configurable.

## How the pipeline behaves

- **Key present** → material analysis → knowledge map (cached by content hash) →
  blueprint matrix → multi-candidate AI generation → local validation →
  AI grounding validation → final assessment.
- **Any failure** (missing key, 429 rate limit, timeout, 5xx, malformed JSON,
  low grounding score) → automatic per-slot or whole-run fallback to the
  deterministic StatGyan engine. The UI states which engine produced each
  assessment ("Engine: N AI · M fallback · provider") and a status chip shows
  connected / fallback mode.

## Security properties

- API key exists only server-side (`"use node"` action file).
- Uploaded documents are treated as untrusted data: wrapped in
  `<SOURCE_DOCUMENT>` delimiters with explicit instructions that content inside
  them can never override the system prompt.
- Only material text and aggregate competency scores are sent to the provider —
  never emails, tokens, or profile PII.
- Generated questions are always validated twice (local heuristics + AI grounding
  check) before review; nothing publishes automatically.
