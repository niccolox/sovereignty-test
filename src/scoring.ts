/**
 * Scoring for The Sovereignty Test.
 *
 * This module is the one that ships. The page imports it and the test suite
 * imports it; there is no second implementation of the arithmetic anywhere.
 */

import {
  POINTS,
  QUESTIONS,
  type AnswerState,
  type Question,
} from "./questions.ts";

export interface Gap {
  readonly question: Question;
  /** Only `partly` or `no` produce gaps. `unknown` is reported separately. */
  readonly state: Extract<AnswerState, "partly" | "no">;
  /** Points a full `yes` would recover: 0.5 from `partly`, 1 from `no`. */
  readonly recoverable: number;
}

export interface Result {
  /** 0 to 7, in steps of 0.5. */
  readonly total: number;
  readonly outOf: number;
  /** Gaps in priority order: most recoverable first, cheapest fix breaking ties. */
  readonly gaps: readonly Gap[];
  /** Questions answered `unknown`, in question order. Never mixed into gaps. */
  readonly unknowns: readonly Question[];
  /** Count of questions answered anything other than `unknown`. */
  readonly answered: number;
}

const VALID = new Set<string>(Object.keys(POINTS));

/**
 * Score a full set of answers.
 *
 * `answers[i]` corresponds to `QUESTIONS[i]`. Throws on a wrong-length array
 * or an unrecognised state rather than silently scoring zero, because a silent
 * zero is indistinguishable from a real failing answer.
 */
export function score(answers: readonly AnswerState[]): Result {
  if (!Array.isArray(answers)) {
    throw new TypeError("score(): answers must be an array");
  }
  if (answers.length !== QUESTIONS.length) {
    throw new RangeError(
      `score(): expected ${QUESTIONS.length} answers, received ${answers.length}`,
    );
  }

  let total = 0;
  let answered = 0;
  const gaps: Gap[] = [];
  const unknowns: Question[] = [];

  for (let i = 0; i < QUESTIONS.length; i++) {
    const state = answers[i];
    if (typeof state !== "string" || !VALID.has(state)) {
      throw new TypeError(
        `score(): answer ${i + 1} is not a valid state: ${JSON.stringify(state)}`,
      );
    }
    const question = QUESTIONS[i]!;
    const points = POINTS[state];
    total += points;

    if (state === "unknown") {
      unknowns.push(question);
      continue;
    }
    answered++;
    if (points < 1) {
      gaps.push({
        question,
        state: state as "partly" | "no",
        recoverable: 1 - points,
      });
    }
  }

  // Most points recoverable first; cheapest fix wins ties. `costRank` is
  // unique across the seven, so this ordering is total and deterministic.
  gaps.sort(
    (a, b) =>
      b.recoverable - a.recoverable || a.question.costRank - b.question.costRank,
  );

  return {
    total: Math.round(total * 2) / 2,
    outOf: QUESTIONS.length,
    gaps,
    unknowns,
    answered,
  };
}

/** The state every question starts in: nothing answered yet. */
export function initialAnswers(): AnswerState[] {
  return QUESTIONS.map(() => "unknown");
}

/** Formats the score the way the live region announces it. */
export function announce(result: Result): string {
  const n = `${result.total} of ${result.outOf}`;
  return result.unknowns.length > 0
    ? `${n}, ${result.unknowns.length} unknown`
    : n;
}
