/* Estus Training Hub: the top bar on every page.
   Loaded with <script src="nav.js" defer></script> after hub-data.js (which needs suite.js).
   Reads only window.ESTUS_HUB, so page scripts keep their own names.
   It adds, from the one list in hub-data.js:
   - the five folder tabs (Start, Clients, Therapy, Growth, Me at Estus) in the black hub bar,
   - a Menu button on every page, builders included: search everything, quick links and the full map,
     also opened with / or Ctrl+K (Cmd+K on a Mac), closed with Esc,
   - a "More in this folder" strip at the end of each training page.
   Nothing here saves anything. */
(function () {
  var X = window.ESTUS_HUB; if (!X) return;
  var M = X.M, HUB = X.HUB, HUB_HOME = X.HOME, HUB_QUICK = X.QUICK;

  var file = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') + '.html';
  if (file === '.html') file = 'index.html';
  var isHub = file === 'index.html';
  var ALIAS = { 'act-game.html': 'act.html' };                       // pages that sit inside another page
  var here = null;
  Object.keys(M).forEach(function (s) { if (!M[s].su && M[s].h === (ALIAS[file] || file)) here = s; });
  var PAR = X.PARENT || {};
  var entry = here ? (PAR[here] || here) : null;                        // a suite page is listed through its suite
  var home = entry ? HUB_HOME[entry] : null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function link(s) { return isHub ? '#' + s : 'index.html#' + s; }

  var COL = { teal: '#2CA5B8', blue: '#6FA8D2', navy: '#8299DA', plum: '#D58FC1', slate: '#A3A9B6' };

  var css =
    '.enav{display:flex;align-items:stretch;gap:2px;flex:1 1 auto;justify-content:center;min-width:0}' +
    '.enav a{display:inline-flex;align-items:center;min-height:36px;padding:0 10px;color:#D6DAE2!important;text-decoration:none;font:600 13px/1 "Barlow Semi Condensed","Arial Narrow",sans-serif;letter-spacing:.1em;text-transform:uppercase;border-bottom:3px solid transparent;white-space:nowrap}' +
    '.enav a:hover{color:#FBFAF8!important;border-bottom-color:#3A3F48}' +
    '.enav a[aria-current="true"]{color:#FBFAF8!important;border-bottom-color:var(--nc,#2CA5B8)}' +
    '.enav a:focus-visible,.enav-btn:focus-visible{outline:2px solid #2CA5B8;outline-offset:2px}' +
    '.enav-btn{font:600 12px/1 "Barlow Semi Condensed","Arial Narrow",sans-serif;letter-spacing:.1em;text-transform:uppercase;border:1px solid #2CA5B8;background:#2CA5B8;color:#090909;padding:9px 12px;cursor:pointer;min-height:36px;display:inline-flex;align-items:center;gap:7px}' +
    '.enav-btn:hover{background:#4CC3D4;border-color:#4CC3D4}' +
    '.enav-btn svg{flex:none}' +
    '.enav-btn kbd{font:inherit;opacity:.65;border:1px solid currentColor;padding:1px 4px;letter-spacing:0}' +
    /* in a page's black bar the tabs take their own row under the logo and buttons */
    '.ehub-in .enav{order:5;flex:1 0 100%;justify-content:flex-start;margin:0 -10px -10px;padding-top:2px;border-top:1px solid #22252B;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}' +
    '.enav::-webkit-scrollbar{display:none}' +
    '.ehub-in .enav a{min-height:40px}' +
    '.mast .enav{flex:0 1 auto;overflow-x:auto;scrollbar-width:none}' +
    '@media (max-width:860px){.mast .tabs{width:100%}.mast .enav{order:5;flex:1 0 100%;justify-content:flex-start;margin-left:-10px}}' +
    '.enav-p .k-teal{--c:#1F8A9B}.enav-p .k-blue{--c:#2F6F9E}.enav-p .k-navy{--c:#344982}.enav-p .k-plum{--c:#AB5C95}.enav-p .k-slate{--c:#5B6170}' +
    ':root[data-theme="dark"] .enav-p .k-teal{--c:#4CC3D4}:root[data-theme="dark"] .enav-p .k-blue{--c:#6FA8D2}:root[data-theme="dark"] .enav-p .k-navy{--c:#8299DA}:root[data-theme="dark"] .enav-p .k-plum{--c:#D58FC1}:root[data-theme="dark"] .enav-p .k-slate{--c:#A3A9B6}' +
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .enav-p .k-teal{--c:#4CC3D4}:root:not([data-theme="light"]) .enav-p .k-blue{--c:#6FA8D2}:root:not([data-theme="light"]) .enav-p .k-navy{--c:#8299DA}:root:not([data-theme="light"]) .enav-p .k-plum{--c:#D58FC1}:root:not([data-theme="light"]) .enav-p .k-slate{--c:#A3A9B6}}' +
    '@media (max-width:520px){.enav-btn kbd{display:none}}' +
    /* the menu */
    '.enav-ov{position:fixed;inset:0;z-index:1000;background:rgba(5,7,10,.6);display:flex;justify-content:center;align-items:flex-start;padding:max(16px,env(safe-area-inset-top,0px)) 12px 16px}' +
    '.enav-ov[hidden]{display:none!important}' +
    '.enav-p{--s:#FBFAF8;--f:#0E1014;--m:#65676E;--r:#D3D1CC;--k:#ECEAE6;background:var(--s);color:var(--f);width:min(1120px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;border-top:5px solid #2CA5B8;box-shadow:0 20px 60px rgba(0,0,0,.35);font:400 16px/1.45 "Barlow","Segoe UI",system-ui,sans-serif}' +
    ':root[data-theme="dark"] .enav-p{--s:#161A20;--f:#ECEEF1;--m:#9BA1AB;--r:#2C323C;--k:#1D222A}' +
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .enav-p{--s:#161A20;--f:#ECEEF1;--m:#9BA1AB;--r:#2C323C;--k:#1D222A}}' +
    '.enav-top{display:flex;gap:8px;padding:12px;border-bottom:1px solid var(--r)}' +
    '.enav-top input{flex:1;min-width:0;font:500 18px "Barlow",system-ui,sans-serif;color:var(--f);background:var(--k);border:1px solid var(--r);padding:10px 12px;border-radius:0}' +
    '.enav-top input:focus{outline:2px solid #2CA5B8;outline-offset:-1px}' +
    '.enav-x{font:600 13px "Barlow Semi Condensed",sans-serif;letter-spacing:.1em;text-transform:uppercase;background:none;color:var(--f);border:1px solid var(--r);padding:0 14px;cursor:pointer;min-height:44px}' +
    '.enav-x:hover{border-color:var(--f)}' +
    '.enav-b{overflow:auto;padding:4px 16px 20px}' +
    '.enav-h{font:700 12px "Barlow Semi Condensed",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--m);margin:16px 0 8px}' +
    '.enav-p a{color:var(--f);text-decoration:none}' +
    '.enav-q{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}' +
    '.enav-q>li{border:1px solid var(--r);border-top:4px solid var(--c);padding:10px 12px}' +
    '.enav-q>li>a{display:block;font:600 17px/1.1 "Oswald","Arial Narrow",sans-serif;text-transform:uppercase;letter-spacing:.02em;color:var(--c)}' +
    '.enav-q ul{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-wrap:wrap;gap:5px}' +
    '.enav-q ul a{display:inline-block;font:600 12px/1 "Barlow Semi Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--r);padding:6px 7px}' +
    '.enav-q ul a:hover,.enav-q>li>a:hover{border-color:var(--c);color:var(--c);text-decoration:underline}' +
    '.enav-map{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}' +
    '.enav-map>section{border-top:3px solid var(--c);padding-top:8px;min-width:0}' +
    '.enav-map h3{margin:0 0 6px;font:600 18px/1.1 "Oswald","Arial Narrow",sans-serif;text-transform:uppercase;letter-spacing:.02em}' +
    '.enav-map h3 a{color:var(--c)}' +
    '.enav-map h4{margin:10px 0 2px;font:600 12px "Barlow Semi Condensed",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--m)}' +
    '.enav-map ul{list-style:none;margin:0;padding:0}' +
    '.enav-map li a{display:block;padding:3px 0;font-size:15px;line-height:1.3}' +
    '.enav-map li a:hover{text-decoration:underline;text-underline-offset:3px}' +
    '.enav-map li li a{padding:2px 0 2px 12px;font-size:14px;color:var(--m);border-left:2px solid var(--r)}' +
    '.enav-map a[aria-current="page"]{font-weight:700;color:var(--c)}' +
    '.enav-res{list-style:none;margin:8px 0 0;padding:0}' +
    '.enav-res a{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 12px;padding:10px 12px;border-bottom:1px solid var(--r);border-left:4px solid var(--c)}' +
    '.enav-res a b{font:600 17px/1.2 "Barlow Semi Condensed",sans-serif;text-transform:uppercase;letter-spacing:.03em}' +
    '.enav-res a span{grid-column:1;font-size:14px;color:var(--m);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.enav-res a i{grid-row:1/3;grid-column:2;align-self:center;font:600 12px "Barlow Semi Condensed",sans-serif;font-style:normal;letter-spacing:.1em;text-transform:uppercase;color:var(--m)}' +
    '.enav-res a:hover,.enav-res a.on{background:var(--k)}' +
    '.enav-none{color:var(--m);padding:12px 0}' +
    '@media (max-width:980px){.enav-q,.enav-map{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '@media (max-width:520px){.enav-q,.enav-map{grid-template-columns:1fr}}' +
    /* more in this folder */
    '.enav-more{border-top:1px solid #2C323C;background:#111419;color:#D6DAE2;font:400 15px/1.45 "Barlow","Segoe UI",system-ui,sans-serif}' +
    '.enav-more-in{max-width:1120px;margin:0 auto;padding:18px max(16px,env(safe-area-inset-right,0px)) 22px max(16px,env(safe-area-inset-left,0px))}' +
    '.enav-more p{margin:0 0 8px;font:700 12px "Barlow Semi Condensed",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#AEB5C2}' +
    '.enav-more p a{color:var(--nc,#2CA5B8)!important}' +
    '.enav-more ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}' +
    '.enav-more li a{display:inline-block;color:#FBFAF8!important;text-decoration:none;font:600 13px/1 "Barlow Semi Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;border:1px solid #3A3F48;padding:9px 10px}' +
    '.enav-more li a:hover{border-color:#FBFAF8}' +
    '.enav-more li a[aria-current="page"]{border-color:var(--nc,#2CA5B8);color:var(--nc,#2CA5B8)!important}' +
    '@media print{.enav,.enav-btn,.enav-ov,.enav-more{display:none!important}}';

  var ICON = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>';
  var MAC = /Mac|iPhone|iPad/.test(navigator.platform || '');

  /* ---------- the menu ---------- */
  var ov, input, body, results = [], hi = 0, lastFocus = null;

  function itemLinks(s) {
    var m = M[s]; if (!m) return '';
    var cur = !m.su && m.h === (ALIAS[file] || file);
    var h = '<li><a href="' + m.h + '"' + (cur ? ' aria-current="page"' : '') + '>' + esc(m.t) + '</a>';
    if (m.su) h += '<ul>' + m.parts.map(function (p) { return '<li><a href="' + p[0] + '"' + (p[0] === file ? ' aria-current="page"' : '') + '>' + esc(p[1]) + '</a></li>'; }).join('') + '</ul>';
    return h + '</li>';
  }
  function mapHTML() {
    var h = '<p class="enav-h">Quick links</p><ul class="enav-q">' + HUB_QUICK.map(function (k) {
      return '<li class="k-' + k.c + '"><a href="' + (isHub && k.h.indexOf('index.html#') === 0 ? k.h.slice(10) : k.h) + '">' + esc(k.t) + '</a><ul>' +
        k.sub.map(function (x) { return '<li><a href="' + x[1] + '">' + esc(x[0]) + '</a></li>'; }).join('') + '</ul></li>';
    }).join('') + '</ul>';
    h += '<p class="enav-h">Everything</p><div class="enav-map">' + HUB.map(function (f) {
      var s = '<section class="k-' + f.c + '"><h3><a href="' + link('f-' + f.id) + '">' + esc(f.n) + '</a></h3>';
      if (f.items) s += '<ul>' + f.items.map(itemLinks).join('') + '</ul>';
      else f.groups.forEach(function (g) { s += '<h4>' + esc(g.n) + '</h4><ul>' + g.items.map(itemLinks).join('') + '</ul>'; });
      return s + '</section>';
    }).join('') + '</div>';
    return h;
  }
  /* every page and suite tab, for search */
  var INDEX = [];
  Object.keys(M).forEach(function (s) {
    var m = M[s], hm = HUB_HOME[PAR[s] || s]; if (!hm) return;
    var where = hm.f.n + (hm.g ? ' › ' + hm.g.n : '');
    if (m.su) return;                                                   // suites are searched through their pages
    var suite = PAR[s] ? M[PAR[s]] : null;
    INDEX.push({ t: m.t, h: m.h, d: m.d, c: hm.f.c, where: suite ? where + ' › ' + suite.t : where,
      hay: (m.t + ' ' + m.d + ' ' + m.i.join(' ') + ' ' + m.p + ' ' + (m.k || '') + ' ' + (suite ? suite.t + ' ' + suite.d : '') + ' ' + where).toLowerCase() });
  });
  HUB_QUICK.forEach(function (k) { if (k.h.indexOf('index.html#') === 0) INDEX.push({ t: k.t, h: k.h, d: k.d, c: k.c, where: 'Folder', hay: (k.t + ' ' + k.d).toLowerCase() }); });

  function search(q) {
    var w = q.toLowerCase().split(/\s+/).filter(Boolean);
    var out = INDEX.filter(function (x) { return w.every(function (t) { return x.hay.indexOf(t) > -1; }); });
    out.sort(function (a, b) {
      var at = a.t.toLowerCase(), bt = b.t.toLowerCase(), q0 = w[0];
      var sa = at.indexOf(q0) === 0 ? 0 : at.indexOf(q0) > -1 ? 1 : 2, sb = bt.indexOf(q0) === 0 ? 0 : bt.indexOf(q0) > -1 ? 1 : 2;
      return sa - sb;
    });
    return out.slice(0, 30);
  }
  function draw() {
    var q = input.value.trim();
    if (!q) { results = []; body.innerHTML = mapHTML(); return; }
    results = search(q); hi = 0;
    body.innerHTML = results.length ?
      '<ul class="enav-res">' + results.map(function (x, i) {
        return '<li><a href="' + x.h + '" class="k-' + x.c + (i === 0 ? ' on' : '') + '"><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span><i>' + esc(x.where) + '</i></a></li>';
      }).join('') + '</ul>' :
      '<p class="enav-none">Nothing matches. Try another word.</p>';
  }
  function mark() { var a = body.querySelectorAll('.enav-res a'); a.forEach(function (el, i) { el.classList.toggle('on', i === hi); }); if (a[hi]) a[hi].scrollIntoView({ block: 'nearest' }); }

  function build() {
    ov = document.createElement('div');
    ov.className = 'enav-ov'; ov.hidden = true;
    ov.innerHTML = '<div class="enav-p" role="dialog" aria-modal="true" aria-label="Find anything on the Training Hub">' +
      '<div class="enav-top"><input type="search" placeholder="Find a page, tool or topic" aria-label="Find a page, tool or topic" autocomplete="off" spellcheck="false">' +
      '<button type="button" class="enav-x">Close</button></div><div class="enav-b"></div></div>';
    document.body.appendChild(ov);
    input = ov.querySelector('input'); body = ov.querySelector('.enav-b');
    input.addEventListener('input', draw);
    input.addEventListener('keydown', function (e) {
      if (!results.length) return;
      if (e.key === 'ArrowDown') { hi = Math.min(hi + 1, results.length - 1); mark(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { hi = Math.max(hi - 1, 0); mark(); e.preventDefault(); }
      else if (e.key === 'Enter') { var a = body.querySelectorAll('.enav-res a')[hi]; if (a) { go(a.getAttribute('href')); e.preventDefault(); } }
    });
    ov.querySelector('.enav-x').addEventListener('click', close);
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { close(); return; }
      var a = e.target.closest('a'); if (a && isHub && a.getAttribute('href').charAt(0) === '#') close();
    });
  }
  function go(h) { if (isHub && h.charAt(0) === '#') { location.hash = h; close(); } else if (isHub && h.indexOf('index.html#') === 0) { location.hash = h.slice(10); close(); } else location.href = h; }
  function open() {
    if (!ov) build();
    lastFocus = document.activeElement;
    input.value = ''; draw(); ov.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { input.focus(); }, 0);
  }
  function close() {
    if (!ov || ov.hidden) return;
    ov.hidden = true; document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ov && !ov.hidden ? close() : open(); return; }
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); open(); return; }
    if (e.key === 'Escape' && ov && !ov.hidden) { e.preventDefault(); close(); }
  });

  function menuBtn() {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'enav-btn';
    b.setAttribute('aria-label', 'Menu: find anything (' + (MAC ? 'Cmd' : 'Ctrl') + '+K)');
    b.title = 'Find anything. Shortcut: / or ' + (MAC ? 'Cmd' : 'Ctrl') + '+K';
    b.innerHTML = ICON + '<span>Menu</span><kbd>/</kbd>';
    b.addEventListener('click', open);
    return b;
  }
  /* on the hub, the tab follows whatever folder, group or page is open */
  function hubTab(nav) {
    function sync() {
      var h = decodeURIComponent(location.hash.slice(1)), id = null;
      if (/^f-/.test(h)) id = h.slice(2);
      else if (/^g-/.test(h)) HUB.forEach(function (f) { (f.groups || []).forEach(function (g) { if ('g-' + g.id === h) id = f.id; }); });
      else if (M[h]) { var hm = HUB_HOME[PAR[h] || h]; if (hm) id = hm.f.id; }
      if (!h) id = 'start';
      nav.querySelectorAll('a').forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#f-' + id ? 'true' : 'false'); });
    }
    sync(); window.addEventListener('hashchange', sync); window.addEventListener('hub:select', sync);
  }
  function tabs() {
    var n = document.createElement('nav');
    n.className = 'enav'; n.setAttribute('aria-label', 'Training Hub folders');
    n.innerHTML = HUB.map(function (f) {
      var cur = home && home.f.id === f.id;
      return '<a href="' + link('f-' + f.id) + '" style="--nc:' + COL[f.c] + '"' + (cur ? ' aria-current="true"' : '') + '>' + esc(f.n) + '</a>';
    }).join('');
    return n;
  }

  /* ---------- more in this folder ---------- */
  function more() {
    if (!home || isHub) return;
    var list = home.g ? home.g.items : home.f.items;
    var name = home.g ? home.g.n : home.f.n;
    var el = document.createElement('nav');
    el.className = 'enav-more'; el.setAttribute('aria-label', 'More in ' + name);
    el.style.setProperty('--nc', COL[home.f.c]);
    var cur = entry;
    el.innerHTML = '<div class="enav-more-in"><p>More in <a href="' + link('f-' + home.f.id) + '">' + esc(home.f.n) + '</a>' + (home.g ? ' › ' + esc(home.g.n) : '') + '</p><ul>' +
      list.concat(home.g && home.g.also ? home.g.also : []).filter(function (s) { return M[s]; }).map(function (s) {
        return '<li><a href="' + M[s].h + '"' + (s === cur ? ' aria-current="page"' : '') + '>' + esc(M[s].t) + '</a></li>';
      }).join('') + '<li><a href="' + link('f-' + home.f.id) + '">All of ' + esc(home.f.n) + ' &rarr;</a></li></ul></div>';
    var foot = document.querySelector('body > footer, .g-root > footer, footer.g-foot, footer');
    if (foot && foot.parentNode) foot.parentNode.insertBefore(el, foot); else document.body.appendChild(el);
  }

  /* ---------- mount ---------- */
  function mount() {
    if (document.querySelector('.enav-btn')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var spot;
    if ((spot = document.querySelector('nav.ehub .ehub-in'))) {             // training pages
      var homeLink = spot.querySelector('.ehub-home'), r = spot.querySelector('.ehub-r');
      if (homeLink) homeLink.insertAdjacentElement('afterend', tabs());
      if (r) r.insertBefore(menuBtn(), r.firstChild); else spot.appendChild(menuBtn());
      more();
    } else if ((spot = document.querySelector('.mast .tabs'))) {             // the hub itself
      var tb = tabs(); spot.insertBefore(tb, spot.firstChild); hubTab(tb);
      spot.insertBefore(menuBtn(), spot.children[1] || null);
    } else if ((spot = document.querySelector('header.top .acts'))) {        // report and handout builders
      spot.insertBefore(menuBtn(), spot.firstChild);
    } else if ((spot = document.querySelector('header.top'))) {              // simple builders (signature)
      var back = spot.querySelector('.back');
      if (back) spot.insertBefore(menuBtn(), back); else spot.appendChild(menuBtn());
    } else {
      var f = menuBtn(); f.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:999'; document.body.appendChild(f);
    }
    /* builders' back links went to the old Templates folder: send them to this page's own entry */
    if (entry) document.querySelectorAll('a[href="index.html#templates"]').forEach(function (a) { a.setAttribute('href', 'index.html#' + entry); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
