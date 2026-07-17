import type { IdeaRoute } from "./idea-quality";
import type { ThesisScreenDecision } from "./scoring";

export type BuildPrototypeMode =
  | "xahau_hook_prototype"
  | "evernode_contract_prototype"
  | "hybrid_prototype"
  | "conventional_prototype";

export type BuildHandoffTool = "xahau-mcp" | "evernode-mcp";

export interface CreateBuildHandoffInput {
  route: IdeaRoute;
  decision: ThesisScreenDecision;
}

export interface BuildHandoff {
  route: IdeaRoute;
  routeLabel: string;
  prototypeMode: BuildPrototypeMode;
  recommendedTools: readonly BuildHandoffTool[];
  recommendedFirstSafeAction: string;
  decisionCaution: string;
  restrictions: readonly string[];
}

interface RouteHandoff {
  routeLabel: string;
  prototypeMode: BuildPrototypeMode;
  recommendedTools: readonly BuildHandoffTool[];
  recommendedFirstSafeAction: string;
  routeRestriction?: string;
}

const ROUTE_HANDOFFS: Readonly<Record<IdeaRoute, RouteHandoff>> = Object.freeze({
  Xahau: Object.freeze({
    routeLabel: "Xahau",
    prototypeMode: "xahau_hook_prototype",
    recommendedTools: Object.freeze(["xahau-mcp"] as const),
    recommendedFirstSafeAction: "Preview an allowlisted Hook starter with Xahau MCP.",
    routeRestriction: "A Hook starter must use an explicitly selected allowlisted archetype; monetary limits are never chosen silently.",
  }),
  Evernode: Object.freeze({
    routeLabel: "Evernode",
    prototypeMode: "evernode_contract_prototype",
    recommendedTools: Object.freeze(["evernode-mcp"] as const),
    recommendedFirstSafeAction: "Preview a deterministic HotPocket contract starter with Evernode MCP.",
    routeRestriction: "A contract starter remains an offline prototype until its determinism and contract-API findings are reviewed.",
  }),
  Both: Object.freeze({
    routeLabel: "Xahau + Evernode",
    prototypeMode: "hybrid_prototype",
    recommendedTools: Object.freeze(["evernode-mcp", "xahau-mcp"] as const),
    recommendedFirstSafeAction: "Preview the Evernode contract starter, then preview the separate Xahau Hook starter.",
    routeRestriction: "Keep the Evernode and Xahau responsibilities separate; a starter from one tool does not validate the other layer.",
  }),
  "Neither yet": Object.freeze({
    routeLabel: "Conventional (no protocol yet)",
    prototypeMode: "conventional_prototype",
    recommendedTools: Object.freeze([] as const),
    recommendedFirstSafeAction: "Export the build brief and define a conventional prototype without invoking protocol tools.",
    routeRestriction: "Do not route this idea through Xahau or Evernode unless a concrete protocol need is established later.",
  }),
});

const DECISION_CAUTIONS: Readonly<Record<ThesisScreenDecision, string>> = Object.freeze({
  advance_to_validation: "The idea is clear enough for a validation prototype; it is not customer validation or production approval.",
  revise_thesis: "The thesis needs revision. Any prototype is a learning experiment, not approval to advance.",
  park_idea: "The thesis was parked. A starter must not be treated as evidence that the idea should proceed.",
  incomplete: "The idea screen is incomplete. Resolve the missing checks before treating a prototype as a recommended next step.",
});

const COMMON_RESTRICTIONS = Object.freeze([
  "Generated output is an advisory preview until a person reviews and deliberately exports it.",
  "Public research, generated code, and starter output are not customer validation.",
  "Never request or forward seeds, private keys, signing credentials, wallet secrets, or other credentials.",
  "No signing, transaction submission, XAH or EVR spending, lease acquisition, or deployment is authorized.",
  "No commands, executable arguments, file paths, working directories, shells, or timeouts are produced by this handoff.",
] as const);

/**
 * Describes the safest route-aware handoff after SIFT has calculated a thesis
 * decision. It is presentation data only: it cannot invoke tools, construct
 * process input, write files, or turn a prototype into validation evidence.
 */
export function createBuildHandoff(input: CreateBuildHandoffInput): BuildHandoff {
  const route = ROUTE_HANDOFFS[input.route];
  const restrictions = route.routeRestriction
    ? [...COMMON_RESTRICTIONS, route.routeRestriction]
    : [...COMMON_RESTRICTIONS];

  return Object.freeze({
    route: input.route,
    routeLabel: route.routeLabel,
    prototypeMode: route.prototypeMode,
    recommendedTools: Object.freeze([...route.recommendedTools]),
    recommendedFirstSafeAction: route.recommendedFirstSafeAction,
    decisionCaution: DECISION_CAUTIONS[input.decision],
    restrictions: Object.freeze(restrictions),
  });
}
