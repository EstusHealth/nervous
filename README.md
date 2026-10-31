# Estus Training Hub

Estus Health's internal staff training intranet. A landing page plus one page per training.

| Area | Pages |
| --- | --- |
| Start here | `culture`, `playbook`, `accelerator`, `calendar` |
| Client pathway | `journey`, `welcome`, `nurture` |
| Team | `check` |
| Small Hinges | `hinges`, `sleep`, `morning`, `energy`, `load`, `transition`, `shutdown` |
| Therapy approaches | `act` (plus `act-game`), `cbt`, `mi`, `gaming`, `nervous` |
| Growth | `reels`, `gp` |

Progress ticks and tool drafts save in each person's own browser only.

## Deploy

Static site, no build step. `index.html` is the hub, every other `.html` file is a page. With clean URLs on, `/culture` serves `culture.html`.

On Vercel: import this repo, set **Framework Preset** to **Other**, leave the build command empty and the output directory as the root. Every push to `main` deploys.

This is internal material. Search engines are blocked (`robots.txt` and a `noindex` tag on every page), but anyone with the link can still open it. Turn on Vercel Deployment Protection if it should need a login.

Local preview: `npx serve .` then open http://localhost:3000.
