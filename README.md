# Estus Training Hub

Estus Health's internal staff training intranet. A landing page plus one page per training.

| Area | Pages |
| --- | --- |
| Start here | `culture`, `playbook`, `accelerator`, `calendar` |
| Client pathway | `journey`, `welcome`, `nurture` |
| Team | `check` |
| Small Hinges | `hinges`, `sleep`, `morning`, `energy`, `load`, `transition`, `shutdown` |
| Therapy approaches | `act` (plus `act-game`), `cbt`, `mi`, `gaming`, `nervous`, `problem-solving` |
| Growth | `reels`, `must-be-nice`, `copy`, `gp` |
| Templates | `fca`, `ptd` (Potential to Drive), `ftd` (Medical Fitness to Drive), `signature` (Gmail email signature) |

Progress ticks and tool drafts save in each person's own browser only.

## Light and dark mode

`theme.js` is loaded in the `<head>` of every page. It adds a Light/Dark button to the top bar and saves the choice in the browser (`hub_theme`), shared across every page. With no choice saved, pages follow the device setting. New pages need `<script src="theme.js"></script>` before `</head>` and the usual `:root[data-theme="light"|"dark"]` token blocks.

## Must Be Nice series

`must-be-nice.html` is the home of the "Must be nice" content series. Every card in its bank is a full post: the line, the kind cause, what keeps it hard (the inversion), the small hinge and a shot idea. The post maker turns a card into a text walk, a talk to camera script, an anti-recipe or a five slide carousel, and saves the text overlay (1080 x 1920, clear background) or the slides (1080 x 1350) as PNG files. Add cards to the `BANK` array near the top of the script. Stars, posted ticks and cards written in the worksheet save in each person's browser only.

## Message templates

`welcome.html` and `nurture.html` share one engine, `msg.js`. It draws the "Fill once" bar, fills every template from it, builds the branded email for pasting into PracSuite, and names any blank still left when you copy. `nurture` covers a lead up to the booking (referral form first, then the call). `welcome` covers the booked call and the follow-up.

Change a fact once: the hourly fee and the booking, referral form and what-to-expect links sit at the top of `msg.js`. Client details typed into the bar stay in that browser tab only. A clinician's own name and links save in their browser.

## Driving report builders

`ptd.html` and `ftd.html` share one engine, `drive.js`, and the brand fonts for Word export, `drive-fonts.js`. Drafts use the same JSON schema as the earlier driving builder, so old drafts and Gem output open unchanged. Opening a draft of the other type switches to the right builder.

## Deploy

Static site, no build step. `index.html` is the hub, every other `.html` file is a page. With clean URLs on, `/culture` serves `culture.html`.

On Vercel: import this repo, set **Framework Preset** to **Other**, leave the build command empty and the output directory as the root. Every push to `main` deploys.

This is internal material. Search engines are blocked (`robots.txt` and a `noindex` tag on every page), but anyone with the link can still open it. Turn on Vercel Deployment Protection if it should need a login.

Local preview: `npx serve .` then open http://localhost:3000.
