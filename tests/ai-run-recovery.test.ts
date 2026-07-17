import assert from "node:assert/strict";
import test from "node:test";

import { classifyAiRunFailure } from "../app/lib/ai-run-recovery.ts";

test("classifies account failures without allowing another billable request", () => {
  const authentication = classifyAiRunFailure({ code: "authentication_failed", message: "HTTP 401" }, "openrouter");
  assert.equal(authentication.category, "authentication");
  assert.equal(authentication.allowIdeaForgeFallback, false);
  assert.match(authentication.userMessage, /API key/);

  const billing = classifyAiRunFailure(new Error("OpenRouter returned HTTP 402: credits required"), "openrouter");
  assert.equal(billing.category, "billing");
  assert.equal(billing.allowIdeaForgeFallback, false);
  assert.match(billing.userMessage, /OpenRouter needs credits/);

  const rateLimit = classifyAiRunFailure({ error: { code: "rate_limited", message: "HTTP 429" } });
  assert.equal(rateLimit.category, "rate_limit");
  assert.equal(rateLimit.allowIdeaForgeFallback, false);
});

test("allows the bounded standard generator to recover from an Idea Forge timeout", () => {
  const result = classifyAiRunFailure({ code: "timeout", publicMessage: "The intelligence run reached its time limit." });
  assert.deepEqual(result, {
    category: "timeout",
    userMessage: "The model did not finish in time. Try again or choose a faster model.",
    allowIdeaForgeFallback: true,
  });
});

test("allows the standard generator to recover from Idea Forge schema failures", () => {
  for (const failure of [
    { code: "invalid_model_output", message: "The model returned an unsupported response." },
    "The Python Idea Forge result failed SIFT's local schema validation.",
    "The generated slate failed SIFT's local idea-quality contract.",
    "The framing pass did not return valid JSON.",
  ]) {
    const result = classifyAiRunFailure(failure);
    assert.equal(result.category, "idea_forge_schema");
    assert.equal(result.allowIdeaForgeFallback, true);
    assert.match(result.userMessage, /standard idea generation/);
  }
});

test("allows fallback for worker protocol, stop, and internal failures", () => {
  const cases = [
    [{ code: "worker_protocol", message: "invalid data" }, "worker_protocol"],
    [{ code: "worker_stopped", message: "The intelligence engine stopped unexpectedly." }, "worker_stopped"],
    [{ code: "internal_error", message: "The intelligence worker could not complete the run." }, "worker_internal"],
  ] as const;

  for (const [failure, category] of cases) {
    const result = classifyAiRunFailure(failure);
    assert.equal(result.category, category);
    assert.equal(result.allowIdeaForgeFallback, true);
  }
});

test("does not turn cancellation or an unknown error into an automatic fallback", () => {
  assert.deepEqual(classifyAiRunFailure("Idea Forge cancelled."), {
    category: "cancelled",
    userMessage: "The AI run was cancelled. Start it again when you are ready.",
    allowIdeaForgeFallback: false,
  });
  assert.equal(classifyAiRunFailure("Something unrelated happened").category, "unknown");
  assert.equal(classifyAiRunFailure("Something unrelated happened").allowIdeaForgeFallback, false);
});

test("never echoes secrets or raw provider responses", () => {
  const secret = "sk-or-v1-super-secret-value";
  const failures = [
    new Error(`HTTP 401 for ${secret}`),
    { code: "credits_required", message: `402 balance for ${secret}` },
    { code: "worker_protocol", publicMessage: `invalid data ${secret}` },
    { message: `unknown failure ${secret}`, cause: { message: `nested ${secret}` } },
  ];

  for (const failure of failures) {
    const serialized = JSON.stringify(classifyAiRunFailure(failure, "openrouter"));
    assert.equal(serialized.includes(secret), false);
    assert.equal(serialized.includes("sk-or"), false);
  }
});
