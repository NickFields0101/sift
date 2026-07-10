import assert from "node:assert/strict";
import test from "node:test";

import { searchLlmModels } from "../app/lib/model-search.ts";

const models = [
  { id: "openai/gpt-4.8-mini", name: "GPT 4.8 Mini" },
  { id: "anthropic/claude-opus-4.8", name: "Anthropic: Claude Opus 4.8" },
  { id: "meta-llama/llama-4", name: "Meta: Llama 4" },
];

test("finds friendly model names from a version-only search", () => {
  assert.deepEqual(
    searchLlmModels(models, "4.8", ["OpenRouter", "openrouter"]).map((model) => model.name),
    ["GPT 4.8 Mini", "Anthropic: Claude Opus 4.8"],
  );
});

test("searches name and model ID with order-independent terms", () => {
  assert.deepEqual(
    searchLlmModels(models, "4.8 opus").map((model) => model.id),
    ["anthropic/claude-opus-4.8"],
  );
  assert.deepEqual(
    searchLlmModels(models, "anthropic 4.8").map((model) => model.id),
    ["anthropic/claude-opus-4.8"],
  );
});

test("can match the current provider and preserves catalog order without a query", () => {
  assert.equal(searchLlmModels(models, "openrouter", ["OpenRouter"]).length, 3);
  assert.strictEqual(searchLlmModels(models, ""), models);
});
