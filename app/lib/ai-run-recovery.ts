export type AiRunFailureCategory =
  | "authentication"
  | "billing"
  | "rate_limit"
  | "timeout"
  | "idea_forge_schema"
  | "worker_protocol"
  | "worker_stopped"
  | "worker_internal"
  | "cancelled"
  | "model_request"
  | "unknown";

export interface AiRunRecovery {
  category: AiRunFailureCategory;
  userMessage: string;
  allowIdeaForgeFallback: boolean;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/**
 * Build a bounded classification signal. The signal is inspected locally and is
 * never returned, which prevents provider responses, prompts, or credentials
 * from being reflected into the renderer.
 */
function classificationSignal(value: unknown): string {
  const parts: string[] = [];
  const seen = new Set<object>();

  const visit = (candidate: unknown, depth: number) => {
    if (depth > 2 || parts.join(" ").length >= 8_000) return;
    if (typeof candidate === "string") {
      parts.push(candidate.slice(0, 2_000));
      return;
    }
    if (candidate instanceof Error) {
      parts.push(candidate.name.slice(0, 120), candidate.message.slice(0, 2_000));
      visit(candidate.cause, depth + 1);
      return;
    }
    const object = record(candidate);
    if (!object || seen.has(object)) return;
    seen.add(object);
    for (const key of ["code", "name", "message", "publicMessage", "error", "cause"] as const) {
      visit(object[key], depth + 1);
    }
  };

  visit(value, 0);
  return parts.join(" ").toLocaleLowerCase("en-US").slice(0, 8_000);
}

function recovery(
  category: AiRunFailureCategory,
  userMessage: string,
  allowIdeaForgeFallback = false,
): AiRunRecovery {
  return { category, userMessage, allowIdeaForgeFallback };
}

/**
 * Convert an untrusted worker/provider failure into a fixed, actionable recovery
 * instruction. Raw error text is deliberately never returned.
 */
export function classifyAiRunFailure(value: unknown, provider?: string): AiRunRecovery {
  const signal = classificationSignal(value);
  const openRouter = provider?.toLocaleLowerCase("en-US") === "openrouter" || /\bopenrouter\b/.test(signal);

  if (/\b(?:authentication_failed|invalid_api_key|unauthori[sz]ed|http\s*401|status\s*401|401)\b|invalid api key|rejected (?:its )?credentials/.test(signal)) {
    return recovery(
      "authentication",
      "The API key was not accepted. Check the key in AI settings, then try again.",
    );
  }
  if (/\b(?:credits_required|payment_required|http\s*402|status\s*402|402)\b|credits?|spending limit|insufficient (?:balance|quota)/.test(signal)) {
    return recovery(
      "billing",
      openRouter
        ? "OpenRouter needs credits or a higher spending limit. Update your OpenRouter account, then try again."
        : "The model provider needs credits or a higher spending limit. Update that account, then try again.",
    );
  }
  if (/\b(?:rate_limited|http\s*429|status\s*429|429)\b|rate.?limit|too many requests/.test(signal)) {
    return recovery(
      "rate_limit",
      "The model provider is temporarily rate limiting requests. Wait a moment, then try again.",
    );
  }
  if (/\b(?:cancelled|canceled|app_closing)\b/.test(signal)) {
    return recovery("cancelled", "The AI run was cancelled. Start it again when you are ready.");
  }
  if (/\b(?:timeout|timed out|worker_timeout)\b|took too long|time limit|time budget/.test(signal)) {
    return recovery(
      "timeout",
      "The model did not finish in time. Try again or choose a faster model.",
      true,
    );
  }
  if (/\b(?:worker_protocol|incompatible_protocol)\b|protocol violation|incompatible response|returned invalid data/.test(signal)) {
    return recovery(
      "worker_protocol",
      "The local intelligence engine returned an incompatible response. SIFT can safely continue with standard idea generation.",
      true,
    );
  }
  if (/\b(?:worker_stopped|worker_unavailable|worker_write|run_not_found|capability_unavailable)\b|engine stopped unexpectedly|engine is unavailable|engine is not installed|could not be started|did not become ready|missing run identifier/.test(signal)) {
    return recovery(
      "worker_stopped",
      "The local intelligence engine stopped unexpectedly. SIFT can safely continue with standard idea generation.",
      true,
    );
  }
  if (/\b(?:invalid_model_output|invalid_result|schema_validation|output_too_large)\b|schema validation|invalid idea format|result failed sift's local schema|slate failed sift's local idea-quality contract|unsupported response|empty response|did not return valid json|model returned an invalid|model must return exactly|duplicate (?:opportunity frames|raw candidates)|referenced an unknown opportunity frame|final idea set contains duplicate/.test(signal)) {
    return recovery(
      "idea_forge_schema",
      "Idea Forge returned an invalid idea format. SIFT can safely continue with standard idea generation.",
      true,
    );
  }
  if (/\b(?:internal_error|worker_error|budget_exceeded)\b|intelligence worker could not complete|idea forge (?:engine )?(?:could not complete|failed)/.test(signal)) {
    return recovery(
      "worker_internal",
      "The local Idea Forge engine could not complete this pass. SIFT can safely continue with standard idea generation.",
      true,
    );
  }
  if (/\b(?:provider_error|provider_unavailable|model_not_found|bad_request|http\s*4\d\d|status\s*4\d\d)\b|model endpoint rejected|selected model/.test(signal)) {
    return recovery(
      "model_request",
      "The selected model rejected the request. Check the model in AI settings, then try again.",
    );
  }
  return recovery(
    "unknown",
    "The AI request could not finish. Try again or choose another model.",
  );
}
