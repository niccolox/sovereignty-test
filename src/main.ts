/**
 * The Sovereignty Test — page behaviour.
 *
 * Renders from `QUESTIONS` so the page and the published JSON cannot drift.
 * The score is live from load (never hidden behind a submit), which is why the
 * score element is an aria-live region: without it a screen reader user taps
 * fourteen times and is never told the number moved.
 */

import { QUESTIONS, SPEC_VERSION, type AnswerState } from "./questions.ts";
import { announce, initialAnswers, score, type Result } from "./scoring.ts";

const STATE_LABELS: Record<AnswerState, string> = {
  yes: "yes",
  partly: "partly",
  no: "no",
  unknown: "unknown",
};

const answers = initialAnswers();
let lastTotal: number | null = null;

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  // textContent throughout. Specification strings never reach the DOM as HTML.
  if (text !== undefined) n.textContent = text;
  return n;
};

function renderQuestions(mount: HTMLElement): void {
  QUESTIONS.forEach((q, i) => {
    const sharpId = `sharp-${q.id}`;
    const fs = el("fieldset", "q");
    fs.setAttribute("aria-describedby", sharpId);

    const legend = el("legend", "q-legend");
    legend.append(
      el("span", "q-num", String(q.id)),
      el("span", "q-label", q.label),
      el("span", "q-text", q.question),
    );

    const sharp = el("p", "q-sharp", q.sharpener);
    sharp.id = sharpId;

    const group = el("div", "q-answers");
    for (const state of Object.keys(STATE_LABELS) as AnswerState[]) {
      const id = `q${q.id}-${state}`;
      const input = el("input", "ans-input");
      input.type = "radio";
      input.name = `q${q.id}`;
      input.value = state;
      input.id = id;
      input.checked = state === "unknown";
      input.addEventListener("change", () => {
        answers[i] = state;
        update();
      });

      const label = el("label", "ans");
      label.htmlFor = id;
      label.append(input, el("span", "ans-text", STATE_LABELS[state]));
      group.append(label);
    }

    fs.append(legend, sharp, group);
    mount.append(fs);
  });
}

function renderResult(result: Result): void {
  const scoreNum = document.getElementById("score-num")!;
  const scoreOf = document.getElementById("score-of")!;
  const maths = document.getElementById("maths")!;
  const live = document.getElementById("score-live")!;
  const gapsMount = document.getElementById("gaps")!;
  const summary = document.getElementById("result-summary")!;

  scoreNum.textContent = String(result.total);
  scoreOf.textContent = `of ${result.outOf}`;

  // The one authored motion moment. Restarts the animation on a real change
  // only; CSS drops it entirely under prefers-reduced-motion.
  if (lastTotal !== null && lastTotal !== result.total) {
    scoreNum.classList.remove("tick");
    void scoreNum.offsetWidth;
    scoreNum.classList.add("tick");
  }
  lastTotal = result.total;

  const parts = QUESTIONS.map((q, i) => `Q${q.id} ${answers[i]}`);
  maths.textContent = `${parts.join(" · ")}  →  ${result.total} / ${result.outOf}`;

  // Announced as one phrase, not a bare digit.
  live.textContent = announce(result);

  const gapCount = result.gaps.length;
  const unknownCount = result.unknowns.length;

  if (result.total === result.outOf) {
    summary.textContent =
      "Nothing to fix on this axis. Note what this test does not cover: it measures whether you could leave, not how well you govern what you have.";
  } else if (gapCount === 0 && unknownCount === result.outOf) {
    // The specific defect this branch exists to prevent: a 0 with seven
    // unknowns must not render the same empty list as a 7 with no gaps.
    summary.textContent =
      "You do not know the answer to any of these. That is the finding.";
  } else if (gapCount === 0) {
    summary.textContent =
      "No gaps among the questions you answered. The unknowns below are the work.";
  } else {
    summary.textContent = "What is costing you the most, in order.";
  }

  gapsMount.replaceChildren();
  for (const gap of result.gaps) {
    const li = el("li", "gap");
    li.append(
      el("span", "gap-pts", `+${gap.recoverable}`),
      (() => {
        const body = el("div", "gap-body");
        body.append(
          el("b", "gap-title", `${gap.question.label}: ${STATE_LABELS[gap.state]}.`),
          el("span", "gap-fix", ` ${gap.question.remediation}`),
        );
        return body;
      })(),
    );
    gapsMount.append(li);
  }

  const unknownBlock = document.getElementById("unknowns")!;
  unknownBlock.replaceChildren();
  unknownBlock.hidden = unknownCount === 0;
  if (unknownCount > 0) {
    const n = unknownCount;
    unknownBlock.append(
      el("span", "gap-pts", `${n} × ?`),
      (() => {
        const body = el("div", "gap-body");
        body.append(
          el(
            "b",
            "gap-title",
            n === result.outOf
              ? "All seven unanswered."
              : `${n} unanswered (${result.unknowns.map((q) => q.label).join(", ")}).`,
          ),
          el(
            "span",
            "gap-fix",
            " Someone in your organisation knows. Until they tell you these score zero, and they are listed apart from the gaps above deliberately.",
          ),
        );
        return body;
      })(),
    );
  }
}

function update(): void {
  renderResult(score(answers));
}

function main(): void {
  const form = document.getElementById("questions");
  if (!form) return;
  renderQuestions(form as HTMLElement);
  document.getElementById("stamp")!.textContent =
    `Sovereignty Test spec v${SPEC_VERSION} · questions.v${SPEC_VERSION}.json`;
  update(); // Live from load: 0 of 7, 7 unknown, before any interaction.
}

main();
