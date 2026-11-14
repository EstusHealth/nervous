# Estus Training Hub

Estus Health's internal staff training intranet. A landing page plus one page per training.

| Area | Pages |
| --- | --- |
| Start here | `culture`, `playbook`, `accelerator`, `calendar`, `gm` (GM Mode: ACT, values and habits on the master calendar) |
| Client pathway | `journey`, `welcome`, `nurture` |
| Team | `check` |
| Small Hinges | `hinges`, `sleep`, `morning`, `energy`, `load`, `transition`, `shutdown` |
| Therapy approaches | `neuroaffirming` (Neuroaffirming Practice, the Estus way), `ot-models` (OT Models and Frames), `act` (plus `act-game`), `cbt`, `beliefs` (Core Beliefs), `mi`, `gaming`, `nervous`, `problem-solving`, `sport-psych` (Sport Psychology map), `assessments` (Assessment Atlas), `executive-function` (Executive Function map) |
| Growth | `growth` (Growth HQ, start here), `must-be-nice`, `shorts` (Shorts Studio: builder, playbook, B-roll library and tagging standard), `meta` (Meta Ads System, from Brandon Willington's course, plus the ad scripts and copy check), `copy`, `gp`. Shared data and rules: `growth.js` |
| Templates: reports | `fca`, `ptd` (Potential to Drive), `ftd` (Medical Fitness to Drive), `summary` (Therapy Service Summary), `sensory` (Sensory Profile Report for schools and stakeholders), `letter` (Letter of Support) |
| Templates: handouts | `goals` (Goal Plan, SMART goals), `chaining` (forward or backward chaining plan), `prompts` (Prompt Hierarchy Guide for support workers), `planner` (Student Planner) |
| Templates: admin | `signature` (Gmail email signature) |

Progress ticks and tool drafts save in each person's own browser only.

## Assessment Atlas

`assessments.html` maps 40 assessments across 10 domains. Tools sit in the `TOOLS` array near the top of the script: ages (`min` and `max` in years drive the Finder), time, telehealth fit (`yes`, `care`, `no`), access, and `feeds`, the report templates each tool supports. `ours: true` marks tools already named in our builders. Add a tool by adding one object; the map, Reports view and Finder pick it up.

## OT Models and Frames

`ot-models.html` maps four occupation-based models, six frames of reference and three process frameworks, the 12 theories they draw on, and 11 starting questions (`QUESTIONS` array) that point to a model, a frame, measures on the Assessment Atlas and hub pages.

## Neuroaffirming Practice

`neuroaffirming.html` sets the Estus way: five neurotypes, four big ideas (monotropism, double empathy, masking, burnout) and four practice commitments, each with a do and don't list, plus 12 frameworks and a language guide. The `LANG` array holds the wording guide. Entries marked `flag:true` match the `PHRASES` checks at the top of `kit.js`; if you add a check there, add the phrase here too.

## Executive Function

`executive-function.html` maps ten EF skills, 13 models and 34 supports. Supports sit in the `SUPPORTS` array: `layer` (`env`, `routine`, `tool`, `skill`, in that order of preference), the skills it helps (`b`), age groups and an optional hub page. Skills link to the BRIEF-2 and WCPA entries on the Assessment Atlas.

## Light and dark mode

`theme.js` is loaded in the `<head>` of every page. It adds a Light/Dark button to the top bar and saves the choice in the browser (`hub_theme`), shared across every page. With no choice saved, pages follow the device setting. New pages need `<script src="theme.js"></script>` before `</head>` and the usual `:root[data-theme="light"|"dark"]` token blocks.

## growth.js: one source for Growth

`growth.js` holds everything the Growth pages share, so it is changed in one place: the brands, the Small Hinges, the CTA list and CTA map, the funnel benchmarks, the weekly scoreboard, the 55 Must be nice cards (`CARDS`), the 24 ad hooks (`HOOKS`, each with an organic and an ad version), and the copy checker. Growth HQ, Must Be Nice, Shorts Studio, Meta Ads System and Geometry Puzzle Copy load it with `<script src="growth.js"></script>` in `<head>`, after `theme.js`.

- **Copy checker.** `GROWTH.check(text)` returns flags worst first: `bad` (fix before it ships), `warn` (check it) and `note` (fine if true). `GROWTH.hookFlags(text)` is the one-sentence hook rule. The rules sit in `RULES`. It merged the five checkers the Growth pages used to have, and it lets "how to guarantee" through because that is the Must be nice anti-recipe joke. If you add a rule, run every card through it: the series number "#1" in a caption and "plan review" in a card are the kind of thing that trips a careless rule.
- **Hooks.** Every hook is one complete sentence. `GROWTH.bank()` returns the ad hooks and the Must be nice lines together, each with `organic` and `ad` text. The ad version of a card comes from `SAY` and never says the viewer has a condition.
- **Scoreboard.** Paste the shared Google Sheet link into `SCOREBOARD.url` and Growth HQ links to it.
- `growth.js` is not page copy, but it is written to the same rules: no em-dashes, Australian spelling.

## Growth HQ

`growth.html` is the front door for Growth: the plan on a page, the weekly rhythm and owners, the scoreboard, the CTA map, the hook bank, the copy check, the house rules and what moved in the November 2026 merge. Almost everything on it is drawn from `growth.js`. Hook bank filters save in each person's browser only.

## Must Be Nice series

`must-be-nice.html` is the home of the "Must be nice" content series. Every card in its bank is a full post: the line, the kind cause, what keeps it hard (the inversion), the small hinge and a shot idea. The post maker turns a card into a text walk, a talk to camera script, an anti-recipe or a five slide carousel, and saves the text overlay (1080 x 1920, clear background) or the slides (1080 x 1350) as PNG files. The cards live in `CARDS` in `growth.js`; add new ones there and Meta Ads System picks them up too. The CTAs and the copy check also come from `growth.js`. Stars, posted ticks and cards written in the worksheet save in each person's browser only.

## Shorts Studio

`shorts.html` builds a ready-to-paste prompt for a short or ad from chips: brand, type of short, purpose, audience, topic, platform, length, hook, captions, text look, CTA, B-roll, pacing, voice, sound and what to get back. The one-sentence hook rule and the house rules go into every prompt. Pick a hook from the hook bank (ads get the ad version) and the hook is checked as you type. Under What you want back, **Claude edits my clip** turns it into an edit prompt: Claude cuts the attached clip, with an edit format, an end screen and extras.

- **Playbook tab.** What was Reels Studio: the workflow, what Claude can and won't do, five formats with a prompt for each, the transition library, end screens and the CTA ladder, reading pace, fix-it prompts, specs, shooting, sound, our rules and the pre-post checklist. It sits in `<div id="pb">` outside the app, its styles are scoped under `#pb`, and the app's own styles are fenced off from it with `:where(:not(#pb *))`, so neither side restyles the other. Its section ids (`#how`, `#formats`, `#check` and so on) open the Playbook tab. Formats sit in `FMTS`, transitions in `TR`, end screens in `ENDS`, fix-it prompts in `FIX` and checklist items in `CK`, in the `pbjs` script. Example stills live in `img/reels/`.
- **B-roll library and Tagging guide.** The standard every clip is filed and tagged by (file name format `brand_category_shot_subject_yyyymmdd.mp4`, Drive folder `Shorts B-roll Library > Brand > Category`, required fields and the privacy check). Clip screenshots live in `img/broll/`.
- Library data, lists and recipes sit in the JSON block with `id="state"` near the bottom of the page. Brands and CTAs are not in the Lists tab: they come from `growth.js`. Clips, lists and recipes changed on the page save in that person's browser only, and Export JSON on the Lists tab copies them out. Saved lists from before the merge pick up the new edit options once (`mig: ["edit-v1"]`), and stay deleted if someone removes them.

## Meta Ads System

`meta.html` is Brandon Willington's Meta ads course rebuilt for Estus. It now also holds what was the Reels Playbook: the hook bank (ad versions, from `growth.js`), the 6-beat ad scripts and script builder, the shoot day lists, the copy check, and the test order in Optimise. The leak finder starts at hook rate and hold rate, and every healthy range comes from `GROWTH.bench`. Ticks and drafts from the old Reels Playbook carry over (same storage keys).

## Retired pages

`reels.html` (Reels Playbook) and `reels-studio.html` (Reels Studio) are now small forwarding pages. They send old links, section anchors included, to Meta Ads System and to Shorts Studio's Playbook tab. They are not on the hub.

## Message templates

`welcome.html` and `nurture.html` share one engine, `msg.js`. It draws the "Fill once" bar, fills every template from it, builds the branded email for pasting into PracSuite, and names any blank still left when you copy. `nurture` covers a lead up to the booking (referral form first, then the call). `welcome` covers the booked call and the follow-up.

Change a fact once: the hourly fee and the booking, referral form and what-to-expect links sit at the top of `msg.js`. Client details typed into the bar stay in that browser tab only. A clinician's own name and links save in their browser.

## Driving report builders

`ptd.html` and `ftd.html` share one engine, `drive.js`, and the brand fonts for Word export, `drive-fonts.js`. Drafts use the same JSON schema as the earlier driving builder, so old drafts and Gem output open unchanged. Opening a draft of the other type switches to the right builder.

## Template kit

`summary.html`, `sensory.html`, `letter.html`, `goals.html`, `chaining.html`, `prompts.html` and `planner.html` share one engine, `kit.js`, and one stylesheet, `kit.css`. Each page is a small shell: it loads the engine, then hands it a definition with the sections (forms), the checks, a worked example and `build()`, which returns the document as a list of blocks. The engine draws the page, saves the draft in the browser, shows the A4 preview, prints it (Ctrl+P or **File, Print or save as PDF** prints the document only) and turns the same blocks into a branded Word file. Word export loads JSZip and `drive-fonts.js` the first time it is used.

- A clinician's own name, AHPRA number, phone and email are typed once and fill in on every kit template (`estus-kit-me-v1`). If empty, they are read from the driving builders.
- Draft files (`.json`) open in any kit page and switch to the right template.
- `**bold**` in any text field comes out bold in the preview and in Word.
- Short tables and the sign-off stay on one page, in print and in Word. Printing from Chrome or Edge adds the client name and page numbers to the foot of each page.
- The wording checks (functioning labels, em-dashes and so on) sit at the top of `kit.js` and run over every text field. A page can add its own, like the neuroaffirming goal checks in `goals.html`.
- `sensory.html` holds no test items and no cut scores. The clinician enters the classification from the score summary.
- `sensory.html` writes for a school by default. **Written for: Other stakeholders** swaps the headings for family, support workers or a workplace.
- `chaining.html` covers forward chaining, backward chaining and the whole task. The **+** on the Forward or backward page moves the learner on one step.
- `planner.html` takes any day in the week and runs from that Monday.
- `prompts.html` is general education on purpose. It never sets prompt levels for one person. That belongs in the person's support plan.
- `letter.html` is a plain letter on Estus letterhead: details, your text, your signature.
- The default hourly rate for new recommendation rows is `RATE` at the top of the script in `summary.html`.

To add a template: copy the smallest page (`prompts.html`), change the definition, add the page to `PAGES` at the top of `kit.js`, then add a card in `index.html` and a line here.

## Deploy

Static site, no build step. `index.html` is the hub, every other `.html` file is a page. With clean URLs on, `/culture` serves `culture.html`.

On Vercel: import this repo, set **Framework Preset** to **Other**, leave the build command empty and the output directory as the root. Every push to `main` deploys.

This is internal material. Search engines are blocked (`robots.txt` and a `noindex` tag on every page), but anyone with the link can still open it. Turn on Vercel Deployment Protection if it should need a login.

Local preview: `npx serve .` then open http://localhost:3000.
