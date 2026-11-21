/* Estus Training Hub: suites.
   A suite is a set of pages that act as one training with tabs (for example CBT and Core Beliefs).
   The pages stay separate files, so each keeps its own drafts, ticks and links.
   This file is the one source for suites:
   - On a member page (loaded with <script src="suite.js"></script> after theme.js, not deferred),
     it draws a tab bar under the black hub bar the moment that bar is parsed, before the page
     content loads, so #section links and page scripts see the final layout.
   - index.html reads HUB_SUITES to show each suite as one entry.
   parts: [file, tab label, progress slug]. Slugs match the "s" in each page's Mark done script. */
var HUB_SUITES = [
  {id:'week', t:'Your Week', p:'Interactive tools',
   d:'Lifestyle first. Build the three Estus calendars, then run your week like a GM: a 60-second reset, values turned into protected blocks, and habits booked as reps.',
   i:['Three calendars','Weekly planner','60-second reset','Rep tracker'], w:['Everyone'],
   parts:[['calendar.html','Calendars','calendar'],['gm.html','GM Mode','gm']]},
  {id:'leadflow', t:'Lead to First Session', p:'Interactive trainers',
   d:'Form first, then the call. The messages that get a new lead to the referral form and a booking, then the free 15 minute welcome call with CLOSER and the follow-up.',
   i:['Lead and form sequences','Getting them to show','CLOSER frame','Objection finder','Fill-once messages'], w:['Clinicians','Ops','Driving OT'],
   parts:[['nurture.html','1. Lead to booking','nurture'],['welcome.html','2. Welcome call','welcome']]},
  {id:'smallhinges', t:'Small Hinges', p:'Program series',
   d:'One focused session per area. Start with the overview (the model, Find Your Hinge and the session shape), then learn the six hinges.',
   i:['Find your hinge','Session shape','Six session plans'], w:['Clinicians','Marketing'],
   parts:[['hinges.html','Overview','hinges'],['sleep.html','Sleep','sleep'],['morning.html','Morning','morning'],['energy.html','Energy','energy'],['load.html','Cognitive load','load'],['transition.html','Transitions','transition'],['shutdown.html','Shutdown','shutdown']]},
  {id:'cbtbeliefs', t:'CBT and Core Beliefs', p:'Approach',
   d:'The thought, feeling, body, action cycle, then the deeper beliefs underneath it, including the ones neurodivergent clients are often taught.',
   i:['Cycle','Thought record','Exposure ladder','Taught beliefs','Downward arrow'], w:['Clinicians','Driving OT'],
   parts:[['cbt.html','CBT','cbt'],['beliefs.html','Core Beliefs','beliefs']]},
  {id:'efps', t:'Executive Function and Problem Solving', p:'Interactive map',
   d:'Ten EF skills and 34 supports in our order (environment, routine, tool, then skill), plus 18 plain-language thinking tools from bottleneck to task analysis.',
   i:['Skill map','Supports finder','Bottleneck simulator','Task analysis'], w:['Everyone'],
   parts:[['executive-function.html','Executive Function','ef'],['problem-solving.html','Problem Solving','problemsolving']]},
  {id:'ads', t:'Ads and Copy', p:'Interactive course',
   d:'Brandon Willington\'s Meta ads course rebuilt for Estus (funnel maths, hook bank, ad scripts and the weekly review), plus Geometry Puzzle Copy: find the one fact that makes yes feel obvious.',
   i:['Forecast','Hook bank','Ad scripts','Pitch lab'], w:['Marketing','Clinicians','Team leaders'],
   parts:[['meta.html','Meta Ads System','metaads'],['copy.html','Geometry Puzzle Copy','copy']]},
  {id:'content', t:'Content Studio', p:'Interactive tools',
   d:'Everything for organic content in one place: build a short or a clip edit prompt, pick a ready podcast clip, or turn a Must be nice card into a post.',
   i:['Prompt builder','B-roll library','Clip library','Post maker'], w:['Marketing','Clinicians','Team leaders'],
   parts:[['shorts.html','Shorts Studio','shortsmaker'],['clips.html','Podcast Clips','clips'],['must-be-nice.html','Must Be Nice','mustbenice']]}
];

(function () {
  var here = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var suite = null, idx = -1;
  HUB_SUITES.forEach(function (s) {
    s.parts.forEach(function (p, i) { if (p[0].replace(/\.html$/, '') === here) { suite = s; idx = i; } });
  });
  if (!suite) return;                                  // the hub itself, or a page outside any suite

  var st = document.createElement('style');
  st.textContent =
    '.esuite{background:#111419;color:#FBFAF8;border-bottom:1px solid #2C323C;position:relative;z-index:5}' +
    '.esuite-in{max-width:1120px;margin:0 auto;padding:0 max(16px,env(safe-area-inset-right,0px)) 0 max(16px,env(safe-area-inset-left,0px));display:flex;align-items:stretch;gap:4px 18px}' +
    '.esuite-name{flex:none;display:flex;align-items:center;font:600 12px/1 "Barlow Semi Condensed","Arial Narrow",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#AEB5C2;padding-right:18px;border-right:1px solid #2C323C;white-space:nowrap}' +
    '.esuite-tabs{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}' +
    '.esuite-tabs::-webkit-scrollbar{display:none}' +
    '.esuite a{flex:none;display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 12px;color:#D6DAE2;text-decoration:none;font:600 13px/1 "Barlow Semi Condensed","Arial Narrow",sans-serif;letter-spacing:.08em;text-transform:uppercase;border-bottom:3px solid transparent;white-space:nowrap}' +
    '.esuite a:hover{color:#FBFAF8;border-bottom-color:#3A3F48}' +
    '.esuite a[aria-current="page"]{color:#FBFAF8;border-bottom-color:#2CA5B8}' +
    '.esuite a:focus-visible{outline:2px solid #2CA5B8;outline-offset:-2px}' +
    '.esuite-ok{color:#5FC38A;font-size:12px}' +
    '@media (max-width:600px){.esuite-name{display:none}}' +
    '@media print{.esuite{display:none}}';
  document.head.appendChild(st);

  var bar = document.createElement('nav');
  bar.className = 'esuite';
  bar.setAttribute('aria-label', suite.t + ': pages in this training');
  var h = '<div class="esuite-in"><span class="esuite-name">' + suite.t + '</span><div class="esuite-tabs">';
  suite.parts.forEach(function (p, i) {
    h += '<a href="' + p[0] + '" data-slug="' + p[2] + '"' + (i === idx ? ' aria-current="page"' : '') + '>' +
         '<span class="esuite-ok" aria-hidden="true"></span>' + p[1] + '</a>';
  });
  bar.innerHTML = h + '</div></div>';

  function ticks() {
    var d = {};
    try { d = JSON.parse(localStorage.getItem('hub_done')) || {}; } catch (e) {}
    bar.querySelectorAll('a').forEach(function (a) {
      var on = !!d[a.getAttribute('data-slug')];
      a.firstChild.textContent = on ? '✓' : '';
      a.setAttribute('title', on ? 'Done' : '');
    });
  }
  ticks();

  var placed = false;
  function place(nav) {
    if (placed) return;
    placed = true;
    // Match the hub bar's side margins (some pages pull it out to the edges), and move any space
    // below the hub bar to below the tabs, so the page content sits exactly where it did before.
    var ns = getComputedStyle(nav);
    bar.style.marginLeft = ns.marginLeft; bar.style.marginRight = ns.marginRight;
    if (parseFloat(ns.marginBottom)) { bar.style.marginBottom = ns.marginBottom; nav.style.marginBottom = '0px'; }
    nav.insertAdjacentElement('afterend', bar);
  }
  function finish() {                                   // runs once the whole page is parsed
    var nav = document.querySelector('nav.ehub');
    if (nav) place(nav);
    if (!placed) return;
    var hubIn = nav.querySelector('.ehub-in'), barIn = bar.querySelector('.esuite-in');   // line up with the hub bar on wide pages
    if (hubIn) { var cs = getComputedStyle(hubIn); barIn.style.maxWidth = cs.maxWidth; barIn.style.paddingLeft = cs.paddingLeft; barIn.style.paddingRight = cs.paddingRight; }
    var tabs = bar.querySelector('.esuite-tabs'), cur = bar.querySelector('[aria-current="page"]');
    if (cur && tabs.scrollWidth > tabs.clientWidth) tabs.scrollLeft = Math.max(0, cur.offsetLeft - tabs.offsetLeft - (tabs.clientWidth - cur.offsetWidth) / 2);
    var btn = document.getElementById('ehub-done');
    if (btn) btn.addEventListener('click', function () { setTimeout(ticks, 0); });
  }
  window.addEventListener('storage', function (e) { if (e.key === 'hub_done') ticks(); });
  window.addEventListener('pageshow', ticks);

  // Place the bar as soon as the hub bar exists, before the rest of the page is parsed.
  var now = document.querySelector('nav.ehub');
  if (now) { place(now); finish(); return; }
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () {
      var nav = document.querySelector('nav.ehub');
      if (nav) { mo.disconnect(); place(nav); }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', function () { mo.disconnect(); finish(); });
  } else {
    document.addEventListener('DOMContentLoaded', finish);
  }
})();
