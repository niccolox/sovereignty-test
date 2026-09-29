import { describe, expect, test } from "bun:test";
import { announce, initialAnswers, score } from "./scoring.ts";
import { ANSWER_STATES, POINTS, QUESTIONS, type AnswerState } from "./questions.ts";

const fill = (s: AnswerState): AnswerState[] => QUESTIONS.map(() => s);

describe("spec data", () => {
  test("has exactly seven questions", () => {
    expect(QUESTIONS.length).toBe(7);
  });

  test("costRank values are unique and cover 1..7", () => {
    const ranks = QUESTIONS.map((q) => q.costRank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("ids are 1..7 in order", () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("every question carries a label, sharpener and remediation", () => {
    for (const q of QUESTIONS) {
      expect(q.label.length).toBeGreaterThan(0);
      expect(q.sharpener.length).toBeGreaterThan(0);
      expect(q.remediation.length).toBeGreaterThan(0);
    }
  });

  test("unknown scores zero, like no, and never like a pass", () => {
    expect(POINTS.unknown).toBe(0);
    expect(POINTS.unknown).toBe(POINTS.no);
    expect(POINTS.unknown).toBeLessThan(POINTS.partly);
  });
});

describe("score: the five committed result states", () => {
  test("all yes -> 7 of 7, no gaps, no unknowns", () => {
    const r = score(fill("yes"));
    expect(r.total).toBe(7);
    expect(r.gaps).toHaveLength(0);
    expect(r.unknowns).toHaveLength(0);
    expect(announce(r)).toBe("7 of 7");
  });

  test("all unknown -> 0 of 7, ZERO gaps, seven unknowns", () => {
    const r = score(fill("unknown"));
    expect(r.total).toBe(0);
    // The defect this guards: an unknown is not a gap. A 0 with seven
    // unknowns and a 0 with seven noes must not render the same empty list.
    expect(r.gaps).toHaveLength(0);
    expect(r.unknowns).toHaveLength(7);
    expect(r.answered).toBe(0);
    expect(announce(r)).toBe("0 of 7, 7 unknown");
  });

  test("all no -> 0 of 7, seven gaps, no unknowns", () => {
    const r = score(fill("no"));
    expect(r.total).toBe(0);
    expect(r.gaps).toHaveLength(7);
    expect(r.unknowns).toHaveLength(0);
    expect(r.answered).toBe(7);
  });

  test("all no and all unknown both score 0 but differ structurally", () => {
    const a = score(fill("no"));
    const b = score(fill("unknown"));
    expect(a.total).toBe(b.total);
    expect(a.gaps.length).not.toBe(b.gaps.length);
    expect(a.unknowns.length).not.toBe(b.unknowns.length);
  });

  test("all partly -> 3.5 of 7, seven equal gaps ordered by costRank alone", () => {
    const r = score(fill("partly"));
    expect(r.total).toBe(3.5);
    expect(r.gaps).toHaveLength(7);
    expect(new Set(r.gaps.map((g) => g.recoverable))).toEqual(new Set([0.5]));
    // Every gap is worth the same, so this case exercises the tie-break alone.
    expect(r.gaps.map((g) => g.question.costRank)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("mixed, the wireframe case -> 2.5 of 7, one gap at +1, two unknown", () => {
    const r = score(["yes", "partly", "partly", "no", "partly", "unknown", "unknown"]);
    expect(r.total).toBe(2.5);
    expect(r.unknowns).toHaveLength(2);
    expect(r.gaps).toHaveLength(4);
    expect(r.gaps[0]!.recoverable).toBe(1);
    expect(r.gaps[0]!.question.label).toBe("Agent auditability");
    expect(announce(r)).toBe("2.5 of 7, 2 unknown");
  });
});

describe("score: point values", () => {
  test.each([
    ["yes", 1],
    ["partly", 0.5],
    ["no", 0],
    ["unknown", 0],
  ] as const)("a single %s among six yeses contributes %p", (state, points) => {
    const answers = fill("yes");
    answers[0] = state;
    expect(score(answers).total).toBe(6 + points);
  });

  test("recoverable is 1 from no and 0.5 from partly", () => {
    const answers = fill("yes");
    answers[0] = "no";
    answers[1] = "partly";
    const r = score(answers);
    const byLabel = Object.fromEntries(r.gaps.map((g) => [g.question.label, g.recoverable]));
    expect(byLabel["Vendor replaceability"]).toBe(1);
    expect(byLabel["Runtime portability"]).toBe(0.5);
  });

  test("totals land on exact halves, never float dust", () => {
    for (const s of ANSWER_STATES) {
      const t = score(fill(s)).total;
      expect(t * 2).toBe(Math.round(t * 2));
    }
    const r = score(["partly", "partly", "partly", "yes", "partly", "partly", "partly"]);
    expect(r.total).toBe(4);
  });
});

describe("score: gap ordering", () => {
  test("a no always outranks a partly regardless of cost", () => {
    const answers = fill("yes");
    // costRank 7 (most expensive) answered no, costRank 1 (cheapest) partly.
    answers[5] = "no";
    answers[4] = "partly";
    const r = score(answers);
    expect(r.gaps[0]!.question.label).toBe("Network isolation");
    expect(r.gaps[1]!.question.label).toBe("Model swappability");
  });

  test("equal recoverable ties break to the cheaper fix", () => {
    const answers = fill("yes");
    answers[0] = "partly"; // costRank 6
    answers[4] = "partly"; // costRank 1
    const r = score(answers);
    expect(r.gaps.map((g) => g.question.costRank)).toEqual([1, 6]);
  });

  test("ordering is deterministic across repeated calls", () => {
    const answers = fill("partly");
    const a = score(answers).gaps.map((g) => g.question.id);
    const b = score(answers).gaps.map((g) => g.question.id);
    expect(a).toEqual(b);
  });
});

describe("score: unknowns", () => {
  test("unknowns stay in question order, not cost order", () => {
    const answers = fill("yes");
    answers[5] = "unknown";
    answers[0] = "unknown";
    const r = score(answers);
    expect(r.unknowns.map((q) => q.id)).toEqual([1, 6]);
  });

  test("an unknown never appears among the gaps", () => {
    const answers = fill("unknown");
    answers[0] = "no";
    const r = score(answers);
    expect(r.gaps).toHaveLength(1);
    expect(r.gaps[0]!.question.id).toBe(1);
    expect(r.unknowns.map((q) => q.id)).toEqual([2, 3, 4, 5, 6, 7]);
  });
});

describe("score: malformed input throws rather than scoring zero", () => {
  test("too few answers", () => {
    expect(() => score(["yes", "yes"] as AnswerState[])).toThrow(RangeError);
  });

  test("too many answers", () => {
    expect(() => score(fill("yes").concat("yes"))).toThrow(RangeError);
  });

  test("an unrecognised state", () => {
    const answers = fill("yes");
    (answers as string[])[3] = "maybe";
    expect(() => score(answers)).toThrow(TypeError);
  });

  test("undefined, null and non-strings", () => {
    for (const bad of [undefined, null, 1, {}, []]) {
      const answers = fill("yes");
      (answers as unknown[])[0] = bad;
      expect(() => score(answers)).toThrow(TypeError);
    }
  });

  test("a non-array", () => {
    expect(() => score("yes" as unknown as AnswerState[])).toThrow(TypeError);
  });
});

describe("initialAnswers", () => {
  test("starts every question at unknown, scoring 0 of 7 with 7 unknown", () => {
    const r = score(initialAnswers());
    expect(announce(r)).toBe("0 of 7, 7 unknown");
    expect(r.gaps).toHaveLength(0);
  });

  test("returns a fresh array each call", () => {
    const a = initialAnswers();
    a[0] = "yes";
    expect(initialAnswers()[0]).toBe("unknown");
  });
});
