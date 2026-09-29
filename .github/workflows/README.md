# Workflows

`deploy.yml` currently builds and verifies only. **It does not deploy.**

Deployment to GitHub Pages needs two things that are deliberately not done yet:

1. **The repository must be public.** Pages requires it on the free plan, and
   this repository stays private until specification v1 is ready to publish.
2. **Pages must be enabled** with `actions/deploy-pages`, plus `pages: write`
   and `id-token: write` permissions and a `github-pages` environment.

Both happen together, once, as a deliberate act. Until then every push is
verified and the built site is kept as a build artifact so it can be inspected
without being published.
