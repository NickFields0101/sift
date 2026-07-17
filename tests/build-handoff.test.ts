import assert from "node:assert/strict";
import test from "node:test";

import type { IdeaRoute } from "../app/lib/idea-quality";
import type { ThesisScreenDecision } from "../app/lib/scoring";

const moduleUrl = new URL("../app/lib/build-handoff.ts", import.meta.url).href;
const { createBuildHandoff } = await import(moduleUrl) as typeof import("../app/lib/build-handoff");

test("maps every idea route to an honest prototype mode and guarded tool recommendation", () => {
  const expectations: Record<IdeaRoute, {
    label: string;
    mode: string;
    tools: string[];
    firstAction: RegExp;
  }> = {
    Xahau: {
      label: "Xahau",
      mode: "xahau_hook_prototype",
      tools: ["xahau-mcp"],
      firstAction: /allowlisted Hook starter/i,
    },
    Evernode: {
      label: "Evernode",
      mode: "evernode_contract_prototype",
      tools: ["evernode-mcp"],
      firstAction: /deterministic HotPocket contract starter/i,
    },
    Both: {
      label: "Xahau + Evernode",
      mode: "hybrid_prototype",
      tools: ["evernode-mcp", "xahau-mcp"],
      firstAction: /Evernode contract starter.*separate Xahau Hook starter/i,
    },
    "Neither yet": {
      label: "Conventional (no protocol yet)",
      mode: "conventional_prototype",
      tools: [],
      firstAction: /conventional prototype without invoking protocol tools/i,
    },
  };

  for (const route of Object.keys(expectations) as IdeaRoute[]) {
    const result = createBuildHandoff({ route, decision: "advance_to_validation" });
    const expected = expectations[route];
    assert.equal(result.route, route);
    assert.equal(result.routeLabel, expected.label);
    assert.equal(result.prototypeMode, expected.mode);
    assert.deepEqual(result.recommendedTools, expected.tools);
    assert.match(result.recommendedFirstSafeAction, expected.firstAction);
  }
});

test("decision cautions never turn a thesis result into validation or production approval", () => {
  const decisions: ThesisScreenDecision[] = [
    "advance_to_validation",
    "revise_thesis",
    "park_idea",
    "incomplete",
  ];
  const cautions = decisions.map((decision) => createBuildHandoff({ route: "Xahau", decision }).decisionCaution);

  assert.equal(new Set(cautions).size, decisions.length);
  assert.match(cautions[0], /not customer validation or production approval/i);
  assert.match(cautions[1], /learning experiment, not approval/i);
  assert.match(cautions[2], /must not be treated as evidence/i);
  assert.match(cautions[3], /resolve the missing checks/i);
});

test("the handoff states every non-negotiable execution and evidence restriction", () => {
  for (const route of ["Xahau", "Evernode", "Both", "Neither yet"] as const) {
    const result = createBuildHandoff({ route, decision: "advance_to_validation" });
    const restrictions = result.restrictions.join(" ");
    assert.match(restrictions, /advisory preview/i);
    assert.match(restrictions, /not customer validation/i);
    assert.match(restrictions, /seeds.*private keys.*signing credentials.*wallet secrets/i);
    assert.match(restrictions, /No signing.*transaction submission.*spending.*lease acquisition.*deployment/i);
    assert.match(restrictions, /No commands.*file paths.*working directories.*shells.*timeouts/i);
  }
});

test("Neither yet never recommends a protocol tool and Both keeps the layers separate", () => {
  const conventional = createBuildHandoff({ route: "Neither yet", decision: "revise_thesis" });
  assert.deepEqual(conventional.recommendedTools, []);
  assert.match(conventional.restrictions.at(-1) ?? "", /Do not route this idea through Xahau or Evernode/i);

  const hybrid = createBuildHandoff({ route: "Both", decision: "advance_to_validation" });
  assert.deepEqual(hybrid.recommendedTools, ["evernode-mcp", "xahau-mcp"]);
  assert.match(hybrid.restrictions.at(-1) ?? "", /responsibilities separate/i);
  assert.match(hybrid.restrictions.at(-1) ?? "", /does not validate the other layer/i);
});

test("the handoff is deterministic, immutable, and contains no operational request fields", () => {
  const input = { route: "Evernode" as const, decision: "advance_to_validation" as const };
  const first = createBuildHandoff(input);
  const second = createBuildHandoff(input);
  assert.deepEqual(first, second);
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.recommendedTools), true);
  assert.equal(Object.isFrozen(first.restrictions), true);
  assert.deepEqual(Object.keys(first).sort(), [
    "decisionCaution",
    "prototypeMode",
    "recommendedFirstSafeAction",
    "recommendedTools",
    "restrictions",
    "route",
    "routeLabel",
  ]);
  for (const forbidden of ["arguments", "command", "cwd", "directory", "path", "privateKey", "seed", "shell", "timeout"]) {
    assert.equal(Object.hasOwn(first, forbidden), false);
  }
});
