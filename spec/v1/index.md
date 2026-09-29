# The Sovereignty Test — specification v1

**Version 1 · 2026-09-28 · [CC BY 4.0](../../LICENSE-SPEC)**

> **This version is frozen.** Once published, nothing under `spec/v1/` changes,
> including typographical corrections. Anyone may have cited it. Corrections
> ship as `spec/v1.1/`. CI fails any build that modifies a published version
> path.

## What this measures, and what it does not

Existing AI governance assessments ask how well you manage the AI you have.
NIST AI RMF, ISO 42001 and the frameworks built on them are thorough about
process maturity, documentation and control coverage.

**This asks a different question: if you had to replace it, could you?**

These seven questions are the axis those frameworks do not cover. Run them
alongside your existing assessment, not instead of it. A high score here says
nothing about how well you govern the systems you have, and a high score there
says nothing about whether you could leave.

> **No endorsement.** NIST AI RMF and ISO 42001 are named here only to locate
> the gap this test addresses. Neither body endorses, reviews, or is affiliated
> with this work. Naming a framework to describe a gap is not a claim of
> alignment with it.

## Unit of measurement

Version 1 scores **the organisation's AI stack as a whole**, not individual
systems. The seven questions are written at institution level, and seven
questions times N systems cannot be answered in two minutes.

**Known limitation.** In a heterogeneous estate, `yes` does not say what
population it quantifies over: every system, most systems, or the one that
matters. Two scores from differently-shaped organisations are therefore not
strictly comparable. Defining the population and the quantifier is the largest
open item for a future version.

## Answering

Each question takes one of four answers.

| Answer | Points | Meaning |
|---|---:|---|
| `yes` | 1 | Demonstrably true today. |
| `partly` | 0.5 | True for some of the estate, or true in principle but unrehearsed. |
| `no` | 0 | Not true. |
| `unknown` | 0 | You do not know. |

**`unknown` scores zero like `no` but is never counted as a pass, and is
reported separately.** Not knowing and knowing-it-is-bad are different
situations. Conflating them is the most common way a governance dashboard
lies, so this specification keeps them apart everywhere: in the score, in the
output, and in the published data.

Every question starts at `unknown`. That is where honest assessment begins,
not an admission.

## The seven questions

Each carries a short **label** for scanning, the **question** itself, a
**clarifier** that removes the obvious way to answer dishonestly, a
**remediation** naming the concrete first step, and a **cost rank** from 1
(cheapest to fix) to 7.

### 1. Vendor replaceability · cost rank 6

> Can the primary vendor be replaced without rebuilding the institution?

*Not “is there an alternative.” Could you actually do it this quarter.*

**First step:** Rehearse the migration once, in staging. A plan nobody has attempted is not a capability.

### 2. Runtime portability · cost rank 5

> Can the runtime move to another environment?

*Counts only if someone has done it, in staging at minimum.*

**First step:** Run it somewhere else once, even in staging, and write down what broke.

### 3. Data recovery · cost rank 4

> Can the organization retain and reconstruct its data and knowledge?

*Including embeddings, prompts, and eval sets, not just the database.*

**First step:** Export embeddings, prompts and eval sets, not just the database. Check you can reload them.

### 4. Agent auditability · cost rank 2

> Can agent permissions and actions be inspected?

*A log of prompts is not a log of permissions.*

**First step:** Log the permission, not the prompt.

### 5. Model swappability · cost rank 1

> Can models be swapped without rewriting business logic?

*If a model name appears in application code, the answer is no.*

**First step:** Route through a capability declaration so no model name appears in application code.

### 6. Network isolation · cost rank 7

> Can critical functions operate privately or in restricted networks where required?

*Relevant only if a regulator, contract, or jurisdiction requires it.*

**First step:** Identify which functions actually carry the obligation, then test one in a restricted network.

### 7. Key custody · cost rank 3

> Does the organization retain identity, keys, policy, authorization, provenance, and audit?

*All six. Losing any one of them loses the set.*

**First step:** List where each of the six lives today. Any held only by a vendor is the one to move first.

## Scoring

Sum the points. The result is **X of 7**, in steps of 0.5.

**Weighting is equal across the seven questions.** This is a stated version-1
limitation, not a finding. Unequal weights would need evidence about which
question predicts real lock-in, and no such evidence exists yet. Question 7
bundles six capabilities into one point, so equal weighting across questions
does not compensate for unequal granularity inside one. Both are known.

**Gaps** are questions answered `partly` or `no`. Order them by points
recoverable, descending; break ties by cost rank, ascending, so the cheaper of
two equally valuable fixes comes first. `unknown` answers are **not** gaps and
are listed separately.

**Cost ranks are the author's judgment, stated as judgment.** They are a
first-step ordering, not an estimate of what a fix costs your organisation.

## The score is self-reported

Every answer is self-assessed with no evidence requirement. Someone who
migrated their runtime last month and someone who believes it would work both
answer `yes` to question 2.

**This is a conversation-starting number, not an audited one.** Published
critique of self-scored maturity tiers identifies exactly this as why such
scores fail in audit, and that critique applies here. It was accepted
deliberately, to keep the test answerable in two minutes. A future version may
require an evidence strength per answer.

## Implementing this specification

The machine-readable form is [`data/questions.v1.json`](../../data/questions.v1.json),
generated from the same source the reference scorer compiles in. It carries the
questions, labels, clarifiers, remediations, cost ranks, point values and
scoring rules. You need nothing else, and you do not need to read our code.

The specification text is CC BY 4.0: implement it, adapt it, cite it.
Attribution required. The reference implementation is Apache-2.0.

The name is provisional and descriptive.
