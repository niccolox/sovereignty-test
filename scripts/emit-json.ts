/**
 * Emits `data/questions.v1.json` from `src/questions.ts`.
 *
 * The JSON is the published, citable form of the specification: an
 * independent implementation needs it and should not have to read our
 * TypeScript. `--check` verifies the committed file still matches the source,
 * which is what stops the published spec drifting from what the page scores.
 */

import { QUESTIONS, SPEC_VERSION, POINTS, ANSWER_STATES } from "../src/questions.ts";

const OUT = new URL("../data/questions.v1.json", import.meta.url);

function build(): string {
  const ranks = QUESTIONS.map((q) => q.costRank).sort((a, b) => a - b);
  const expected = QUESTIONS.map((_, i) => i + 1);
  if (JSON.stringify(ranks) !== JSON.stringify(expected)) {
    throw new Error(
      `costRank must be unique and cover 1..${QUESTIONS.length}; got ${ranks.join(",")}`,
    );
  }
  const doc = {
    $comment:
      "Generated from src/questions.ts. Do not edit by hand; run `bun run emit`.",
    spec: "The Sovereignty Test",
    version: SPEC_VERSION,
    license: "CC-BY-4.0",
    answerStates: ANSWER_STATES,
    points: POINTS,
    scoring: {
      outOf: QUESTIONS.length,
      unknownIsNotAPass: true,
      unknownReportedSeparately: true,
      gapOrder: "descending by points recoverable, ties broken by ascending costRank",
      weighting: "equal across questions; a stated version-1 limitation, not a finding",
    },
    questions: QUESTIONS,
  };
  return JSON.stringify(doc, null, 2) + "\n";
}

const text = build();

if (process.argv.includes("--check")) {
  const onDisk = await Bun.file(OUT).text().catch(() => "");
  if (onDisk !== text) {
    console.error(
      "data/questions.v1.json does not match src/questions.ts. Run `bun run emit` and commit the result.",
    );
    process.exit(1);
  }
  console.log("data/questions.v1.json matches src/questions.ts");
} else {
  await Bun.write(OUT, text);
  console.log(`wrote data/questions.v1.json (${text.length} bytes)`);
}
