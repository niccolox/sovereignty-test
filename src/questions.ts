/**
 * The Sovereignty Test — specification data, version 1.
 *
 * This file is the single source of truth. `data/questions.v1.json` is emitted
 * from it by `scripts/emit-json.ts`, and the page compiles this module in
 * directly, so the scorer makes no runtime fetch and cannot fail to load its
 * own questions.
 *
 * Changing any `label`, `question`, `sharpener`, `remediation` or `costRank`
 * is a specification version bump, not an edit. Two people comparing scores
 * are comparing these strings.
 */

export type AnswerState = "yes" | "partly" | "no" | "unknown";

/** The four answer states, in display order. */
export const ANSWER_STATES: readonly AnswerState[] = [
  "yes",
  "partly",
  "no",
  "unknown",
] as const;

/**
 * Points per state. `unknown` scores zero like `no`, but is reported
 * separately and is never counted as a pass: not knowing and knowing-it-is-bad
 * are different situations, and conflating them is how governance dashboards
 * lie.
 */
export const POINTS: Readonly<Record<AnswerState, number>> = {
  yes: 1,
  partly: 0.5,
  no: 0,
  unknown: 0,
} as const;

export interface Question {
  /** 1-based, stable across versions. */
  readonly id: number;
  /** Two to four words. Restores the three-second scan the full question loses. */
  readonly label: string;
  /** Verbatim from the specification. Never paraphrased in the UI. */
  readonly question: string;
  /** One line that removes the obvious way to answer dishonestly. */
  readonly sharpener: string;
  /** The concrete first step, not the whole fix. */
  readonly remediation: string;
  /** 1..7, unique, cheapest first. Author's judgment, stated as judgment. */
  readonly costRank: number;
}

export const SPEC_VERSION = "1" as const;

export const QUESTIONS: readonly Question[] = [
  {
    id: 1,
    label: "Vendor replaceability",
    question:
      "Can the primary vendor be replaced without rebuilding the institution?",
    sharpener:
      "Not “is there an alternative.” Could you actually do it this quarter.",
    remediation:
      "Rehearse the migration once, in staging. A plan nobody has attempted is not a capability.",
    costRank: 6,
  },
  {
    id: 2,
    label: "Runtime portability",
    question: "Can the runtime move to another environment?",
    sharpener: "Counts only if someone has done it, in staging at minimum.",
    remediation:
      "Run it somewhere else once, even in staging, and write down what broke.",
    costRank: 5,
  },
  {
    id: 3,
    label: "Data recovery",
    question:
      "Can the organization retain and reconstruct its data and knowledge?",
    sharpener:
      "Including embeddings, prompts, and eval sets, not just the database.",
    remediation:
      "Export embeddings, prompts and eval sets, not just the database. Check you can reload them.",
    costRank: 4,
  },
  {
    id: 4,
    label: "Agent auditability",
    question: "Can agent permissions and actions be inspected?",
    sharpener: "A log of prompts is not a log of permissions.",
    remediation: "Log the permission, not the prompt.",
    costRank: 2,
  },
  {
    id: 5,
    label: "Model swappability",
    question: "Can models be swapped without rewriting business logic?",
    sharpener: "If a model name appears in application code, the answer is no.",
    remediation:
      "Route through a capability declaration so no model name appears in application code.",
    costRank: 1,
  },
  {
    id: 6,
    label: "Network isolation",
    question:
      "Can critical functions operate privately or in restricted networks where required?",
    sharpener:
      "Relevant only if a regulator, contract, or jurisdiction requires it.",
    remediation:
      "Identify which functions actually carry the obligation, then test one in a restricted network.",
    costRank: 7,
  },
  {
    id: 7,
    label: "Key custody",
    question:
      "Does the organization retain identity, keys, policy, authorization, provenance, and audit?",
    sharpener: "All six. Losing any one of them loses the set.",
    remediation:
      "List where each of the six lives today. Any held only by a vendor is the one to move first.",
    costRank: 3,
  },
] as const;
