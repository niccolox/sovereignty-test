# The Sovereignty Test

Seven questions about whether your organisation could replace its AI vendors.

Existing governance assessments ask how well you manage the AI you have. This
asks a different question: if you had to replace it, could you? These seven
questions are the axis those frameworks do not cover. Run them alongside your
existing assessment, not instead of it.

> **No endorsement.** This test names NIST AI RMF and ISO 42001 only to locate
> the gap it addresses. Neither body endorses, reviews, or is affiliated with
> this work. Naming a framework to describe a gap is not a claim of alignment
> with it.

## Status

**Published.** Specification v1 and the scorer are live at
**<https://niccolox.github.io/sovereignty-test/>**

Verified against the live deployment, not just the build: 29 scoring tests and
15 browser smoke tests, the latter run against the deployed URL.

## What is here

- `spec/v1/index.md` — the specification. Seven questions, their labels,
  clarifiers, remediations and cost ranks, the scoring rules, and the stated
  limitations. Frozen once published; corrections ship as a new version.
- `src/questions.ts` — the single source of truth. The spec prose, the
  published JSON and the page all derive from it, and CI fails if any of them
  drift apart.
- `src/scoring.ts` — the scoring. The module the page ships is the module the
  tests import; there is no second copy of the arithmetic.
- `data/questions.v1.json` — the machine-readable specification, generated
  from the source. Implement the test without reading our TypeScript.
- `index.html` + `src/main.ts` — the scorer.

## Running it

```sh
bun install
bun run check     # scoring tests, generated-file checks, build, page-weight budget
bun run build     # assembles _site/
bunx playwright test   # browser smoke tests against the local build

# Verify a deployment rather than a build:
SMOKE_BASE_URL=https://niccolox.github.io/sovereignty-test/ bunx playwright test
```

The page weighs 56.6 KB against a 100 KB budget that CI enforces: 44.6 KB of
that is the self-hosted font, 6.5 KB the HTML and CSS, 5.5 KB the script.

## How it will work

No signup. No account. No email field. Scoring runs entirely in your browser
and nothing is sent anywhere. Unknown is a real answer: it scores zero like a
failure but is reported separately, because not knowing and knowing-it-is-bad
are different situations and conflating them is how governance dashboards lie.

The score is self-reported. It is a conversation-starting number, not an
audited one.

## Licence

- **Font** (`fonts/`): IBM Plex Sans, [SIL Open Font License 1.1](fonts/SOURCE.md).
  Self-hosted so the page makes no third-party request.
- **Specification text** (`spec/`, `data/`, and the questions themselves):
  [CC BY 4.0](LICENSE-SPEC). Use it, adapt it, implement it. Attribution
  required.
- **Code** (everything else): [Apache 2.0](LICENSE).

The name is provisional and descriptive.
