# Workflows

`deploy.yml` verifies, then deploys to GitHub Pages.

**Deployment is gated on every check passing.** The `deploy` job `needs: verify`,
so a failing scoring test, a drifted published JSON, drifted specification
prose, a modified already-published spec version, a page over the weight
budget, or a failing smoke test all stop publication. A red build cannot ship.

It deploys only from `master`. Pull requests are verified and never published.
