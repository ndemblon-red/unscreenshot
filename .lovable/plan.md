

# Plan: Add Langfuse Observability to Screenshot Analysis

## What This Does

Langfuse is an open-source LLM observability platform. We'll instrument the `analyse-screenshot` edge function to log every AI call — tracking input, output, latency, errors, and costs — so you can monitor and debug your AI pipeline from the Langfuse Cloud dashboard.

## Steps

### 1. Add Langfuse Secrets
Store three secrets using the secrets tool:
- `LANGFUSE_SECRET_KEY` — your Langfuse secret key
- `LANGFUSE_PUBLIC_KEY` — your Langfuse public key
- `LANGFUSE_HOST` — your Langfuse Cloud URL (e.g. `https://cloud.langfuse.com`)

### 2. Instrument the Edge Function
Update `supabase/functions/analyse-screenshot/index.ts` to:

- Read the three Langfuse env vars at the start of each request
- Create a Langfuse trace with metadata (user agent, timestamp)
- Wrap the Anthropic API call in a Langfuse **generation** span that records:
  - Model name (`claude-sonnet-4-20250514`)
  - Input (system prompt + user message, image mime type — not the full base64)
  - Output (raw AI response text)
  - Latency (start/end timestamps)
  - Token usage (from Anthropic's response `usage` field)
  - Error status if the call fails
- Log the validation step (whether output was modified by `validateAndFix`)
- Flush Langfuse at the end of the request (Langfuse batches events and requires an explicit flush in serverless environments)

Since Deno edge functions can't use the `langfuse` npm SDK directly without complexity, we'll use the **Langfuse REST API** (`POST /api/public/ingestion`) to send trace and generation events. This is lightweight — just one `fetch` call at the end — and avoids any SDK compatibility issues.

### 3. Graceful Degradation
Langfuse logging will be fire-and-forget. If the Langfuse secrets are missing or the API call fails, the function continues normally — observability never blocks the user's screenshot analysis.

## Technical Details

- **No new files** — only `supabase/functions/analyse-screenshot/index.ts` is modified
- **No database changes**
- The Langfuse ingestion payload will include: trace ID, generation span with model/input/output/usage/latency
- Image base64 will NOT be sent to Langfuse (too large); only the mime type and a reference will be logged

