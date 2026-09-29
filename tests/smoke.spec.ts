import { expect, test } from "@playwright/test";
import { QUESTIONS } from "../src/questions.ts";
import { score, type AnswerState } from "../src/scoring.ts";

const answerAll = async (page: import("@playwright/test").Page, states: AnswerState[]) => {
  for (const [i, q] of QUESTIONS.entries()) {
    await page.locator(`#q${q.id}-${states[i]}`).check({ force: true });
  }
};

test("renders seven questions with their labels", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("fieldset.q")).toHaveCount(7);
  for (const q of QUESTIONS) {
    await expect(page.locator(".q-label", { hasText: q.label })).toBeVisible();
    await expect(page.locator(".q-text", { hasText: q.question })).toBeVisible();
  }
});

test("score is live from load at 0 of 7 with seven unknown", async ({ page }) => {
  await page.goto("/");
  // Before any interaction at all.
  await expect(page.locator("#score-num")).toHaveText("0");
  await expect(page.locator("#score-of")).toHaveText("of 7");
  await expect(page.locator("#score-live")).toHaveText("0 of 7, 7 unknown");
  await expect(page.locator("#unknowns")).toBeVisible();
  // A zero with seven unknowns is not a zero with seven gaps.
  await expect(page.locator("ol.gaps li")).toHaveCount(0);
});

test("all four answer states are selectable", async ({ page }) => {
  await page.goto("/");
  for (const state of ["yes", "partly", "no", "unknown"] as AnswerState[]) {
    const input = page.locator(`#q1-${state}`);
    await input.check({ force: true });
    await expect(input).toBeChecked();
  }
});

const CASES: Array<[string, AnswerState[]]> = [
  ["all yes", Array(7).fill("yes")],
  ["all no", Array(7).fill("no")],
  ["all partly", Array(7).fill("partly")],
  ["all unknown", Array(7).fill("unknown")],
  ["mixed", ["yes", "partly", "partly", "no", "partly", "unknown", "unknown"]],
];

for (const [name, states] of CASES) {
  test(`displayed score matches the module for ${name}`, async ({ page }) => {
    await page.goto("/");
    await answerAll(page, states);
    const expected = score(states);
    await expect(page.locator("#score-num")).toHaveText(String(expected.total));
    await expect(page.locator("ol.gaps li")).toHaveCount(expected.gaps.length);
    await expect(page.locator("#unknowns")).toBeVisible({ visible: expected.unknowns.length > 0 });
  });
}

test("gap list renders in rank order", async ({ page }) => {
  await page.goto("/");
  const states: AnswerState[] = Array(7).fill("partly");
  await answerAll(page, states);
  const expected = score(states).gaps.map((g) => g.question.label);
  const rendered = await page.locator("ol.gaps .gap-title").allTextContents();
  expect(rendered.map((t) => t.split(":")[0]!.trim())).toEqual(expected);
});

test("all-yes and all-unknown do not render the same empty result", async ({ page }) => {
  await page.goto("/");
  await answerAll(page, Array(7).fill("yes"));
  const yesSummary = await page.locator("#result-summary").textContent();
  await expect(page.locator("#unknowns")).toBeHidden();

  await answerAll(page, Array(7).fill("unknown"));
  const unknownSummary = await page.locator("#result-summary").textContent();
  await expect(page.locator("#unknowns")).toBeVisible();

  expect(yesSummary).not.toBe(unknownSummary);
  expect(unknownSummary).toContain("do not know");
});

test("version stamp identifies the spec version", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#stamp")).toHaveText(/spec v1 · questions\.v1\.json/);
});

test("remediation renders as text, never as markup", async ({ page }) => {
  await page.goto("/");
  await answerAll(page, Array(7).fill("no"));
  const html = await page.locator("ol.gaps").innerHTML();
  expect(html).not.toContain("<script");
  const first = page.locator("ol.gaps .gap-fix").first();
  await expect(first).toHaveText(/\S/);
});

test("keyboard: seven tab stops reach every question group", async ({ page }) => {
  await page.goto("/");
  const ids: string[] = [];
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab");
    const id = await page.evaluate(() => document.activeElement?.id ?? "");
    if (id) ids.push(id);
  }
  // Each stop lands on the checked radio of a distinct question.
  const groups = new Set(ids.map((id) => id.split("-")[0]));
  expect(groups.size).toBe(7);
});

test("no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("answer controls meet the 44px target floor", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  const labels = page.locator(".ans");
  const n = await labels.count();
  expect(n).toBe(28);
  for (let i = 0; i < n; i++) {
    const box = await labels.nth(i).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
});
