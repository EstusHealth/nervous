# Estus Training Hub

Live staff intranet. Vercel deploys every push to `main`.

## Rules
- Always commit and push straight to `main`. No side branches, no waiting PRs.
  Snapshots are built from `main`, so anything left on a branch gets lost.
- Every page loads `theme.js` in `<head>` (light/dark switch).
- New pages get an entry in `index.html` (add it to `M`, then put its slug in a folder or group in `HUB`) and a line in `README.md`.
- A page in a suite (see `suite.js`) loads `<script src="suite.js"></script>` right after `theme.js` and is listed on the hub through its suite, not on its own.
- Never use em-dashes in page copy.
