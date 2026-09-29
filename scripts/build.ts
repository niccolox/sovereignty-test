/**
 * Assembles `_site/` for GitHub Pages and enforces the page-weight budget.
 *
 * Page weight is what a first-time visitor actually downloads: the HTML, the
 * bundle and the font. The specification and the published JSON are not
 * fetched by the page, so they are served but not counted.
 */

import { mkdir, rm, cp, stat } from "node:fs/promises";

const ROOT = new URL("..", import.meta.url).pathname;
const SITE = `${ROOT}_site`;
const BUDGET = 100 * 1024;

await rm(SITE, { recursive: true, force: true });
await mkdir(SITE, { recursive: true });

const built = await Bun.build({
  entrypoints: [`${ROOT}src/main.ts`],
  outdir: SITE,
  minify: true,
  target: "browser",
});
if (!built.success) {
  for (const log of built.logs) console.error(log);
  process.exit(1);
}

await Bun.write(`${SITE}/index.html`, Bun.file(`${ROOT}index.html`));
await cp(`${ROOT}fonts`, `${SITE}/fonts`, { recursive: true });
await cp(`${ROOT}data`, `${SITE}/data`, { recursive: true });
await cp(`${ROOT}spec`, `${SITE}/spec`, { recursive: true });

const weigh = async (p: string) => (await stat(p)).size;
const html = await weigh(`${SITE}/index.html`);
const js = await weigh(`${SITE}/main.js`);
const font = await weigh(`${SITE}/fonts/ibm-plex-sans-latin-wght-normal.woff2`);
const total = html + js + font;

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
console.log(`  index.html  ${kb(html)}`);
console.log(`  main.js     ${kb(js)}`);
console.log(`  font        ${kb(font)}`);
console.log(`  ---------------------`);
console.log(`  page weight ${kb(total)}  (budget ${kb(BUDGET)})`);

if (total > BUDGET) {
  console.error(
    `\nPage weight ${kb(total)} exceeds the ${kb(BUDGET)} budget. The budget is what stops the two-minute promise decaying one convenient dependency at a time.`,
  );
  process.exit(1);
}
console.log(`\n_site/ built, ${kb(BUDGET - total)} of budget to spare.`);
