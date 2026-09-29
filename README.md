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

**Not published yet.** This repository is reserved. Version 1 of the
specification and the scorer are not written.

## What will be here

- `spec/v1/` — the seven questions, their clarifiers, their short labels, and
  a remediation entry with a cost rank for each. Versioned and citable. Once a
  version is published its path is frozen; corrections ship as a new version.
- `index.html` — a scorer. Seven questions, four answers each (yes / partly /
  no / unknown), a score out of 7 with its arithmetic shown, and every gap
  ranked by how many points it recovers.
- `data/questions.v1.json` — the spec as data, emitted from the same source
  the page compiles in, so an independent implementation needs no JavaScript
  from here.

## How it will work

No signup. No account. No email field. Scoring runs entirely in your browser
and nothing is sent anywhere. Unknown is a real answer: it scores zero like a
failure but is reported separately, because not knowing and knowing-it-is-bad
are different situations and conflating them is how governance dashboards lie.

The score is self-reported. It is a conversation-starting number, not an
audited one.

## Licence

- **Specification text** (`spec/`, `data/`, and the questions themselves):
  [CC BY 4.0](LICENSE-SPEC). Use it, adapt it, implement it. Attribution
  required.
- **Code** (everything else): [Apache 2.0](LICENSE).

The name is provisional and descriptive.
