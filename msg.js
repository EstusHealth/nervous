/* Estus Training Hub: message engine. Shared by welcome.html and nurture.html.
   Fill once, and every template fills itself. Copy as a branded email or plain text.
   Anything still blank is flagged in the preview and named when you copy.

   Storage:
   - Client details (names, call day, time, link) live in sessionStorage. Gone when the tab closes.
   - Your own name and links live in localStorage ("hub_msg_me"), this browser only.

   One place to change a fact: FEE and LINKS below. */
(function () {
  'use strict';

  var FEE = '$193.99';
  var LINKS = {
    book: 'https://www.estushealth.com/book-your-call',
    form: 'https://www.estushealth.com/contact',
    expect: 'https://www.estushealth.com/what-to-expect'
  };
  var BRANDS = {
    estus: { name: 'ESTUS HEALTH', sign: 'Estus Health', email: 'hello@estushealth.com' },
    dots: { name: 'DRIVING ON THE SPECTRUM', sign: 'Driving on the Spectrum', email: '' }
  };
  var FIELDS = {
    first: { label: 'Their first name', ph: 'Sam', blank: 'FIRST NAME', store: 's' },
    child: { label: "Client's first name", ph: 'Alex', blank: "CLIENT'S NAME", store: 's', aud: ['parent', 'coord'] },
    day: { label: 'Call day', ph: 'Tuesday 17 November', blank: 'CALL DAY', store: 's' },
    time: { label: 'Call time', ph: '3:30 pm AWST', blank: 'CALL TIME', store: 's' },
    join: { label: 'Call link', ph: 'https://meet.google.com/...', blank: 'CALL LINK', store: 's', wide: true },
    me: { label: 'Your first name', ph: 'Nik', blank: 'YOUR NAME', store: 'l' },
    book: { label: 'Booking page', blank: 'BOOKING LINK', store: 'l', def: LINKS.book, wide: true },
    form: { label: 'Referral form', blank: 'FORM LINK', store: 'l', def: LINKS.form, wide: true }
  };
  var ME_KEY = 'hub_msg_me', CL_KEY = 'hub_msg_client', AUD_KEY = 'hub_msg_aud';

  var state = { aud: 'adult', vals: {} };
  var cfg = { fields: [], audiences: [], hide: [] };
  var REG = {}, OPEN = {}, listeners = [], barEl = null;

  /* ---------- storage ---------- */
  function read(store, key) {
    try { return JSON.parse(store.getItem(key)) || {}; } catch (e) { return {}; }
  }
  function write(store, key, v) {
    try { store.setItem(key, JSON.stringify(v)); } catch (e) {}
  }
  function loadVals() {
    var l = read(window.localStorage, ME_KEY), s = read(window.sessionStorage, CL_KEY), out = {};
    Object.keys(FIELDS).forEach(function (k) {
      var f = FIELDS[k], src = f.store === 'l' ? l : s;
      out[k] = typeof src[k] === 'string' ? src[k] : (f.def || '');
    });
    return out;
  }
  function saveVals() {
    var l = {}, s = {};
    Object.keys(FIELDS).forEach(function (k) {
      (FIELDS[k].store === 'l' ? l : s)[k] = state.vals[k] || '';
    });
    write(window.localStorage, ME_KEY, l);
    write(window.sessionStorage, CL_KEY, s);
  }

  /* ---------- text helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function ctx() {
    var v = state.vals, me = (v.me || '').trim();
    var who = /^nik/i.test(me) ? 'nik' : /^nam/i.test(me) ? 'nam' : '';
    return {
      first: v.first, child: v.child, day: v.day, time: v.time, join: v.join, me: me,
      book: v.book, form: v.form, fee: FEE,
      expect: LINKS.expect + (who ? '?with=' + who : '')
    };
  }
  var TOKEN = /(\{[a-z]+\}|\[[A-Z0-9][A-Z0-9 ,'\/:.()+-]*\])/g;

  /* Fill one string. mode: 'prev' marks blanks, 'copy' gives clean HTML, 'text' gives plain text. */
  function seg(str, it, mode, blanks) {
    var c = ctx();
    var out = String(str).split(TOKEN).map(function (part) {
      if (!part) return '';
      var m = /^\{([a-z]+)\}$/.exec(part);
      if (m) {
        var val = (c[m[1]] || '').trim();
        if (val) return mode === 'text' ? val : esc(val);
        var label = '[' + ((FIELDS[m[1]] || {}).blank || m[1].toUpperCase()) + ']';
        if (blanks && blanks.indexOf(label) < 0) blanks.push(label);
        return mode === 'prev' ? '<mark class="hm-blank">' + esc(label) + '</mark>' : mode === 'text' ? label : esc(label);
      }
      if (/^\[[A-Z0-9]/.test(part) && /\]$/.test(part)) {
        if (it.auto && part === '[FIRST NAME]') return mode === 'prev' ? '<span class="hm-merge">' + esc(part) + '</span>' : mode === 'text' ? part : esc(part);
        if (blanks && blanks.indexOf(part) < 0) blanks.push(part);
        return mode === 'prev' ? '<mark class="hm-blank">' + esc(part) + '</mark>' : mode === 'text' ? part : esc(part);
      }
      return mode === 'text' ? part : esc(part);
    }).join('');
    if (mode === 'text') return out.replace(/\*\*(.+?)\*\*/g, '$1');
    return out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
  }
  function linkify(html) {
    return html.replace(/(https?:\/\/[^\s<]*[^\s<.,;:)!?])/g, '<a href="$1" style="color:#344982;">$1</a>');
  }

  /* ---------- variants ---------- */
  function resolve(it) {
    if (it.only && it.only.indexOf(state.aud) < 0) return null;
    var v = (it.v && it.v[state.aud]) || {}, out = {};
    Object.keys(it).forEach(function (k) { if (k !== 'v') out[k] = it[k]; });
    Object.keys(v).forEach(function (k) { out[k] = v[k]; });
    return out;
  }

  /* ---------- email ---------- */
  function signLines(it) {
    var B = BRANDS[it.brand || 'estus'];
    return (it.auto || it.sign === 'team') ? B.sign : '{me}, ' + B.sign;
  }
  function emailHTML(it, mode, blanks) {
    var B = BRANDS[it.brand || 'estus'];
    var P = 'margin:0 0 14px;';
    var body = (it.body || []).map(function (p) {
      return '<p style="' + P + '">' + linkify(seg(p, it, mode, blanks)) + '</p>';
    }).join('');
    var btn = '';
    if (it.btn) {
      var href = seg(it.btn.href, it, 'text', blanks);
      btn = '<tr><td style="border:none;padding:0 24px 24px;"><a href="' + esc(href) + '" style="display:inline-block;background:#344982;color:#ffffff;text-decoration:none;font-weight:bold;letter-spacing:1px;padding:14px 26px;border:2px solid #090909;">' + esc(it.btn.label) + ' &#9656;</a></td></tr>';
    }
    var foot = (it.foot || []).map(function (p) {
      return '<p style="margin:0 0 12px;">' + linkify(seg(p, it, mode, blanks)) + '</p>';
    }).join('');
    var sign = '<p style="margin:0;">' + seg(signLines(it), it, mode, blanks) +
      (B.email ? '<br><a href="mailto:' + B.email + '" style="color:#344982;">' + B.email + '</a>' : '') + '</p>';
    return '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background:#FBFAF8;font-family:Arial,Helvetica,sans-serif;color:#1A1A1A;"><tr><td align="center" style="padding:24px 12px;border:none;">' +
      '<table width="560" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;max-width:560px;width:100%;background:#ffffff;border:2px solid #090909;">' +
      '<tr><td style="background:#090909;padding:18px 24px;border:none;border-bottom:6px solid #2CA5B8;"><div style="color:#FBFAF8;font-size:16px;letter-spacing:3px;font-weight:bold;">' + B.name + '</div></td></tr>' +
      '<tr><td style="border:none;padding:28px 24px 8px;font-size:16px;line-height:1.55;">' + body + '</td></tr>' + btn +
      '<tr><td style="border:none;padding:0 24px 28px;font-size:15px;line-height:1.55;color:#3F434B;">' + foot + sign + '</td></tr>' +
      '</table></td></tr></table>';
  }
  function emailText(it) {
    var B = BRANDS[it.brand || 'estus'], out = [];
    (it.body || []).forEach(function (p) { out.push(seg(p, it, 'text')); });
    if (it.btn) out.push(it.btn.label + ': ' + seg(it.btn.href, it, 'text'));
    (it.foot || []).forEach(function (p) { out.push(seg(p, it, 'text')); });
    out.push(seg(signLines(it), it, 'text') + (B.email ? '\n' + B.email : ''));
    return out.join('\n\n');
  }

  /* ---------- cards ---------- */
  var KIND = { email: 'Email', sms: 'Text', say: 'Say it' };
  function smsCount(t) {
    var n = t.length, parts = n <= 160 ? 1 : Math.ceil(n / 153);
    return n + ' characters, ' + parts + (parts === 1 ? ' text' : ' texts');
  }
  function card(it0) {
    var it = resolve(it0);
    if (!it) return '';
    REG[it.id] = it;
    var head = '<div class="hm-bar"><div class="hm-meta"><span class="hm-tag ' + it.ch + '">' + (it.tag || KIND[it.ch]) + '</span>' +
      '<span class="hm-when">' + esc(it.when || '') + '</span>' +
      (it.auto ? '<span class="hm-auto">' + esc(it.autoLabel || 'Automatic, set once') + '</span>' : '') +
      '<b>' + esc(it.name) + '</b></div>' +
      '<button type="button" class="hm-copy" data-id="' + it.id + '">Copy ' + (it.ch === 'email' ? 'email' : it.ch === 'sms' ? 'text' : 'script') + '</button></div>';
    var mid = '';
    if (it.ch === 'email') {
      mid = '<div class="hm-subj"><span class="hm-l">Subject</span><span class="hm-subj-t">' + seg(it.subj, it, 'prev') + '</span>' +
        '<button type="button" class="hm-mini" data-subj="' + it.id + '">Copy subject</button></div>' +
        '<div class="hm-status" aria-live="polite"></div>' +
        '<details class="hm-prev" data-id="' + it.id + '"' + (OPEN[it.id] ? ' open' : '') + '><summary>Show email</summary><div class="hm-mail">' + emailHTML(it, 'prev') + '</div></details>';
    } else {
      var txt = seg(it.text, it, 'text');
      mid = '<div class="hm-status" aria-live="polite"></div>' +
        '<div class="hm-' + (it.ch === 'sms' ? 'sms' : 'say') + '">' + seg(it.text, it, 'prev').replace(/<br>/g, '\n') + '</div>' +
        (it.ch === 'sms' ? '<div class="hm-count">' + smsCount(txt) + '</div>' : '');
    }
    var why = it.why ? '<p class="hm-why"><b>Why it works.</b> ' + esc(it.why) + '</p>' : '';
    return '<article class="hm-card" data-card="' + it.id + '">' + head + mid + why + '</article>';
  }
  function matches(it0, term) {
    var it = resolve(it0);
    if (!it) return false;
    if (!term) return true;
    var hay = [it.name, it.when, it.subj, it.text, (it.body || []).join(' '), (it.foot || []).join(' '), it.ch === 'sms' ? 'sms text' : it.ch].join(' ').toLowerCase();
    return hay.indexOf(term.toLowerCase()) >= 0;
  }

  /* ---------- copy ---------- */
  function setStatus(id, msg, warn) {
    var c = document.querySelector('[data-card="' + id + '"] .hm-status');
    if (!c) return;
    c.textContent = msg;
    c.className = 'hm-status' + (warn ? ' warn' : '');
  }
  function report(id, blanks, what) {
    if (blanks.length) setStatus(id, 'Copied, but ' + blanks.length + (blanks.length === 1 ? ' blank is' : ' blanks are') + ' still in it: ' + blanks.join(', ') + '. Fill before you send.', true);
    else setStatus(id, what + ' copied.');
  }
  function legacyCopy(node) {
    var r = document.createRange(); r.selectNodeContents(node);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    return ok;
  }
  function copyItem(id) {
    var it = REG[id];
    if (!it) return;
    var blanks = [];
    var cardEl = document.querySelector('[data-card="' + id + '"]');
    var fail = function (node) {
      var ok = node && legacyCopy(node);
      if (ok) report(id, blanks, it.ch === 'email' ? 'Email' : 'Text');
      else setStatus(id, 'Selected. Press Ctrl+C (or Cmd+C) to copy.', true);
    };
    if (it.ch === 'email') {
      var html = emailHTML(it, 'copy', blanks), text = emailText(it);
      var prev = cardEl.querySelector('.hm-prev');
      try {
        if (navigator.clipboard && window.ClipboardItem) {
          navigator.clipboard.write([new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' })
          })]).then(function () { report(id, blanks, 'Email'); }, function () { prev.open = true; fail(prev.querySelector('.hm-mail')); });
        } else { prev.open = true; fail(prev.querySelector('.hm-mail')); }
      } catch (e) { prev.open = true; fail(prev.querySelector('.hm-mail')); }
    } else {
      var t = seg(it.text, it, 'text', blanks), node = cardEl.querySelector('.hm-sms,.hm-say');
      var what = it.ch === 'sms' ? 'Text' : 'Script';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { report(id, blanks, what); }, function () { fail(node); });
      } else fail(node);
    }
  }
  function copySubject(id) {
    var it = REG[id];
    if (!it) return;
    var blanks = [], t = seg(it.subj, it, 'text', blanks);
    var done = function () { report(id, blanks, 'Subject'); };
    var node = document.querySelector('[data-card="' + id + '"] .hm-subj-t');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(done, function () { if (legacyCopy(node)) done(); });
    } else if (legacyCopy(node)) done();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.hm-copy,.hm-mini') : null;
    if (!b) return;
    if (b.classList.contains('hm-copy')) copyItem(b.getAttribute('data-id'));
    else copySubject(b.getAttribute('data-subj'));
  });
  document.addEventListener('toggle', function (e) {
    var d = e.target;
    if (d && d.classList && d.classList.contains('hm-prev')) OPEN[d.getAttribute('data-id')] = d.open;
  }, true);

  /* ---------- fill bar ---------- */
  function emit() { listeners.forEach(function (fn) { fn(state); }); }
  function paintBar() {
    if (!barEl) return;
    barEl.querySelectorAll('.hm-aud button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-aud') === state.aud));
    });
    barEl.querySelectorAll('.hm-f').forEach(function (f) {
      var k = f.getAttribute('data-k'), a = FIELDS[k].aud;
      f.hidden = !!((a && a.indexOf(state.aud) < 0) || cfg.hide.indexOf(k) >= 0);
    });
  }
  function audButtons() {
    return cfg.audiences.map(function (a) {
      return '<button type="button" data-aud="' + a.id + '" aria-pressed="false">' + esc(a.label) + '</button>';
    }).join('');
  }
  function fillBar(el) {
    barEl = el;
    el.innerHTML = '<div class="hm-fill">' +
      '<div class="hm-fill-top"><div><h3>Fill once</h3><p>Type it here. Every template below fills itself.</p></div>' +
      '<button type="button" class="hm-mini hm-clear">Clear client</button></div>' +
      '<div class="hm-who"><span class="hm-l">Writing to</span><div class="hm-aud" role="group" aria-label="Who you are writing to">' + audButtons() + '</div></div>' +
      '<div class="hm-fields">' + cfg.fields.map(function (k) {
        var f = FIELDS[k];
        return '<div class="hm-f' + (f.wide ? ' wide' : '') + '" data-k="' + k + '"><label for="hm-' + k + '">' + esc(f.label) + '</label>' +
          '<input id="hm-' + k + '" data-k="' + k + '" type="text" autocomplete="off" spellcheck="false" placeholder="' + esc(f.ph || '') + '" value="' + esc(state.vals[k] || '') + '"></div>';
      }).join('') + '</div>' +
      '<p class="hm-note">Client details stay in this tab and clear when you close it. Your name and links are saved in this browser. Anything left blank shows up marked, so no brackets reach a client.</p>' +
      '</div>';
    el.addEventListener('input', function (e) {
      var k = e.target.getAttribute && e.target.getAttribute('data-k');
      if (!k || e.target.tagName !== 'INPUT') return;
      state.vals[k] = e.target.value;
      saveVals(); emit();
    });
    el.addEventListener('click', function (e) {
      var a = e.target.closest('.hm-aud button');
      if (a) { setAud(a.getAttribute('data-aud')); return; }
      if (e.target.closest('.hm-clear')) {
        cfg.fields.forEach(function (k) {
          if (FIELDS[k].store !== 's') return;
          state.vals[k] = '';
          var i = el.querySelector('#hm-' + k); if (i) i.value = '';
        });
        saveVals(); emit();
      }
    });
    paintBar();
  }
  function setAud(id) {
    var ok = cfg.audiences.some(function (a) { return a.id === id; });
    state.aud = ok ? id : (cfg.audiences[0] || { id: 'adult' }).id;
    try { sessionStorage.setItem(AUD_KEY, state.aud); } catch (e) {}
    paintBar(); emit();
  }
  function setAudiences(list) {
    cfg.audiences = list;
    if (barEl) { var box = barEl.querySelector('.hm-aud'); if (box) box.innerHTML = audButtons(); }
    setAud(state.aud);
  }

  /* ---------- styles ---------- */
  var css =
    '.hm-fill{background:var(--surface);border:2px solid var(--edge);border-top:8px solid var(--teal);padding:18px;display:flex;flex-direction:column;gap:14px}' +
    '.hm-fill-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}' +
    '.hm-fill h3{margin:0;font:600 24px/1.1 var(--display);text-transform:uppercase}' +
    '.hm-fill-top p{margin:2px 0 0;color:var(--muted);font-size:15px}' +
    '.hm-l{font:700 12px/1 var(--cond);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}' +
    '.hm-who{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}' +
    '.hm-aud{display:flex;flex-wrap:wrap;gap:8px}' +
    '.hm-aud button{font:700 14px/1 var(--cond);letter-spacing:.06em;text-transform:uppercase;min-height:40px;padding:6px 14px;border:2px solid var(--edge);background:var(--surface);color:var(--fg);cursor:pointer}' +
    '.hm-aud button[aria-pressed="true"]{background:var(--fg);color:var(--bg)}' +
    '.hm-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}' +
    '.hm-f{display:flex;flex-direction:column;gap:4px;min-width:0}' +
    '.hm-f label{font:700 12px/1.2 var(--cond);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}' +
    '.hm-f input{font:inherit;font-size:16px;padding:9px 12px;min-height:44px;width:100%;min-width:0;border:2px solid var(--edge);background:var(--bg);color:var(--fg);border-radius:0}' +
    '.hm-f input:placeholder-shown{border-color:var(--rule)}' +
    '.hm-f input::placeholder{color:var(--muted);opacity:.7}' +
    '.hm-note{margin:0;font-size:13px;color:var(--muted)}' +
    '@media (min-width:640px){.hm-f.wide{grid-column:span 2}}' +
    '.hm-card{background:var(--surface);border:2px solid var(--edge);padding:14px 16px;display:flex;flex-direction:column;gap:10px;min-width:0}' +
    '.hm-bar{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:10px}' +
    '.hm-meta{min-width:0;font-size:14px;color:var(--muted);display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px}' +
    '.hm-meta b{flex-basis:100%;font-size:18px;line-height:1.25;color:var(--fg)}' +
    '.hm-tag{font:700 12px/1.5 var(--cond);letter-spacing:.1em;text-transform:uppercase;padding:1px 8px;color:#fff}' +
    '.hm-tag.email{background:#344982}.hm-tag.sms{background:#8E4A7B}.hm-tag.say{background:#1E7C8B}' +
    '.hm-auto{font:700 11px/1.5 var(--cond);letter-spacing:.1em;text-transform:uppercase;border:1.5px solid currentColor;padding:0 7px;color:var(--muted)}' +
    '.hm-copy{font:500 16px/1 var(--display);letter-spacing:.06em;text-transform:uppercase;min-height:44px;padding:8px 16px;background:#2CA5B8;color:#090909;border:2px solid var(--edge);cursor:pointer}' +
    '.hm-copy:hover{background:#4CC3D4}' +
    '.hm-subj{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;font-size:15px;background:var(--sunk);padding:8px 12px}' +
    '.hm-subj-t{font-weight:600;min-width:0;overflow-wrap:anywhere}' +
    '.hm-mini{font:700 12px/1 var(--cond);letter-spacing:.08em;text-transform:uppercase;border:1.5px solid var(--edge);background:none;color:var(--fg);padding:6px 10px;min-height:32px;cursor:pointer}' +
    '.hm-subj .hm-mini{margin-left:auto}' +
    '.hm-mini:hover{background:var(--sunk)}' +
    '.hm-status{font-size:14px;font-weight:600;color:var(--good)}.hm-status:empty{display:none}.hm-status.warn{color:var(--warn)}' +
    '.hm-prev summary{cursor:pointer;font:700 14px/1 var(--cond);letter-spacing:.08em;text-transform:uppercase;color:var(--navy);min-height:32px;display:flex;align-items:center}' +
    '.hm-mail{border:1px dashed var(--rule);margin-top:8px;overflow-x:auto;background:#FBFAF8;color:#1A1A1A}' +
    '.hm-sms,.hm-say{background:var(--sunk);padding:12px 14px;font-size:16px;white-space:pre-wrap;overflow-wrap:anywhere}' +
    '.hm-say{border-left:5px solid var(--teal)}' +
    '.hm-count{font:600 13px/1 var(--cond);letter-spacing:.04em;color:var(--muted)}' +
    '.hm-why{margin:0;font-size:14px;color:var(--muted)}.hm-why b{color:var(--fg)}' +
    'mark.hm-blank{background:var(--warn-t);color:var(--warn);font-weight:700;padding:0 3px}' +
    '.hm-mail mark.hm-blank{background:#F6E8D2;color:#8A5608}' +
    '.hm-merge{font-weight:700;color:var(--navy)}.hm-mail .hm-merge{color:#344982}' +
    '@media print{.hm-fill,.hm-copy,.hm-mini{display:none}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- public ---------- */
  window.HubMsg = {
    fee: FEE,
    links: LINKS,
    state: state,
    init: function (o) {
      cfg.fields = o.fields; cfg.audiences = o.audiences;
      state.vals = loadVals();
      var a = null;
      try { a = sessionStorage.getItem(AUD_KEY); } catch (e) {}
      state.aud = cfg.audiences.some(function (x) { return x.id === a; }) ? a : cfg.audiences[0].id;
    },
    fillBar: fillBar,
    card: card,
    matches: matches,
    setAudiences: setAudiences,
    hideFields: function (keys) { cfg.hide = keys || []; paintBar(); },
    onChange: function (fn) { listeners.push(fn); },
    esc: esc
  };
})();
