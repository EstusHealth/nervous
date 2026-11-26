/* Estus Training Hub: letterhead and headings, one module for every report and handout builder.
   Used by kit.js (the template kit), drive.js (the driving builders) and fca.html.
   Load it in <head>, before the engine: <script src="letterhead.js"></script>
   It covers what every builder shares, saved with the draft in S.meta:
   - meta.title: the letterhead title. Empty uses the builder's own title.
   - meta.wp: adds "Without prejudice" to the line under the title. On unless unticked.
   - meta.foot: the footer text, bottom left of every page. Empty uses the builder's standard footer.
   - meta.heads: renamed headings and sub-headings, standard heading to new one. Set by tapping a heading in the preview.
   Each engine still draws its own page, print and Word file from docTitle(), docSub(), footLeft() and withHeads().
   Change a rule here and every builder follows. */
var EstusLetterhead = (function () {
  'use strict';
  var WP = 'Without prejudice';
  var str = function (v) { return v == null ? '' : String(v).trim(); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };

  /* The letterhead fields a new draft starts with. */
  function defaults() { return { title: '', foot: '', wp: true, heads: {} }; }

  /* o.state(): the draft (S). o.persist(): save it. o.title(), o.sub(), o.foot(): the builder's standard title,
     line under the title and footer. Returns the functions the engine uses. */
  function make(o) {
    function meta() { var S = o.state(); if (!S.meta || typeof S.meta !== 'object') S.meta = {}; return S.meta; }
    var L = { WP: WP };

    L.docTitle = function () { return str(meta().title) || str(o.title()); };
    /* "Without prejudice" joins the line under the title unless unticked. */
    L.docSub = function () {
      var s = str(o.sub());
      if (meta().wp === false) return s;
      return !s ? WP + '.' : /[.!?]$/.test(s) ? s + ' ' + WP + '.' : s + ' · ' + WP;
    };
    L.stdFoot = function () { return o.foot(); };
    L.footLeft = function () { return str(meta().foot) || o.foot(); };

    /* Any heading or sub-heading can be renamed per draft. In the preview, tap a heading and type.
       Clear it to get the standard one back. */
    L.headOf = function (k) {
      var H = meta().heads;
      return H && typeof H === 'object' && Object.prototype.hasOwnProperty.call(H, k) ? str(H[k]) : '';
    };
    L.withHeads = function (B) {
      return B.map(function (b) {
        return (b.t === 'h' || b.t === 'sub') && str(b.text) ? Object.assign({}, b, { std: b.text, text: L.headOf(b.text) || b.text }) : b;
      });
    };
    L.hAttr = function (b, on) {
      return on && b.std ? ' class="hd" contenteditable="true" spellcheck="true" role="textbox" aria-label="' + esc('Heading: ' + b.std + '. Type to rename it.') + '" title="Tap to rename" data-std="' + esc(b.std) + '"' : '';
    };
    L.HDTIP = function (B) {
      return B.some(function (b) { return b.std; }) ? '<p class="hdtip">Tap any heading to rename it. Clear it to get the standard one back.</p>' : '';
    };

    /* The three letterhead settings, for the builder's last page. F and CB are the engine's own field makers. */
    L.fields = function (F, CB, kind) {
      var top = kind === 'page' ? 'page' : 'report';
      return '<div class="grid2">' +
        F('meta.title', 'Letterhead title', { ph: str(o.title()), hint: 'The big title at the top of the ' + top + '. Empty uses the standard one.' }) +
        F('meta.foot', 'Footer', { ph: o.foot(), hint: 'Bottom left of every page. Empty uses the standard one.' }) +
        '</div>\n' + CB('meta.wp', 'Add “Without prejudice” under the title');
    };

    /* Heading renames in the preview: Enter saves, Escape cancels, paste comes in as plain text. */
    L.wire = function (main) {
      var hdEl = function (e) { return e.target && e.target.closest ? e.target.closest('[data-std]') : null; };
      function setHead(std, val) {
        val = str(val).replace(/\s+/g, ' ');
        var m = meta();
        if (!m.heads || typeof m.heads !== 'object' || Array.isArray(m.heads)) m.heads = {};
        if (!val || val === std) delete m.heads[std]; else m.heads[std] = val;
        o.persist();
        main.querySelectorAll('[data-std]').forEach(function (el) { if (el.dataset.std === std) el.textContent = val || std; });
      }
      main.addEventListener('keydown', function (e) {
        var t = hdEl(e); if (!t || (e.key !== 'Enter' && e.key !== 'Escape')) return;
        e.preventDefault();
        if (e.key === 'Escape') t.textContent = L.headOf(t.dataset.std) || t.dataset.std;
        t.blur();
      });
      main.addEventListener('paste', function (e) {
        var t = hdEl(e); if (!t) return;
        e.preventDefault();
        document.execCommand('insertText', false, ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\s+/g, ' '));
      });
      main.addEventListener('focusout', function (e) { var t = hdEl(e); if (t) setHead(t.dataset.std, t.textContent); });
    };
    return L;
  }

  return { WP: WP, defaults: defaults, make: make };
})();
