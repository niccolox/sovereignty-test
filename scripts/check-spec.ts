/**
 * Verifies the published specification prose still matches the source data.
 *
 * `spec/v1/index.md` restates every question, label, clarifier, remediation
 * and cost rank in human-readable form. Nothing stops those two copies
 * drifting except this check, and a spec that disagrees with the scorer is
 * worse than no spec.
 */

import { QUESTIONS, SPEC_VERSION } from "../src/questions.ts";

const path = new URL(`../spec/v${SPEC_VERSION}/index.md`, import.meta.url);
const spec = await Bun.file(path).text();

const problems: string[] = [];
for (const q of QUESTIONS) {
  const fields = {
    label: q.label,
    question: q.question,
    clarifier: q.sharpener,
    remediation: q.remediation,
  };
  for (const [field, value] of Object.entries(fields)) {
    if (!spec.includes(value)) problems.push(`Q${q.id} ${field} not found verbatim in the spec`);
  }
  if (!spec.includes(`cost rank ${q.costRank}`)) {
    problems.push(`Q${q.id} cost rank ${q.costRank} not stated in the spec`);
  }
}

if (problems.length > 0) {
  console.error("Specification prose has drifted from src/questions.ts:\n");
  for (const p of problems) console.error(`  - ${p}`);
  console.error("\nUpdate spec/v" + SPEC_VERSION + "/index.md so both agree.");
  process.exit(1);
}
console.log(`spec/v${SPEC_VERSION}/index.md matches all ${QUESTIONS.length} questions`);
