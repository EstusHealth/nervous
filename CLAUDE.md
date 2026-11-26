# Estus Training Hub

Live staff intranet. Vercel deploys every push to `main`.

## Rules
- Always commit and push straight to `main`. No side branches, no waiting PRs.
  Snapshots are built from `main`, so anything left on a branch gets lost.
- Every page loads, in `<head>`: `<script src="theme.js"></script><script src="suite.js"></script>`, then `<script src="hub-data.js" defer></script><script src="nav.js" defer></script>` before `</head>` (light/dark switch, suites, the top bar and Menu).
- New pages get an entry in `hub-data.js` (add it to `M`, then put its slug in one folder or group in `HUB`) and a line in `README.md`. Each page lives in one place only.
- A page in a suite (see `suite.js`) is listed on the hub through its suite, not on its own.
- Never use em-dashes in page copy.
