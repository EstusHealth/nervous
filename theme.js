/* Estus Training Hub: light / dark switch.
   Loaded in <head> on every page so the saved choice applies before first paint.
   No saved choice = follow the device setting. The choice is saved in this
   browser only (localStorage "hub_theme") and shared by every hub page. */
(function () {
  var K = 'hub_theme', root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function load() { try { return localStorage.getItem(K); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(K, v); } catch (e) {} }
  function apply(v) {
    if (v === 'light' || v === 'dark') root.setAttribute('data-theme', v);
    else root.removeAttribute('data-theme');
  }
  function current() {
    var a = root.getAttribute('data-theme');
    if (a === 'light' || a === 'dark') return a;
    return mq && mq.matches ? 'dark' : 'light';
  }

  apply(load());

  var buttons = [];
  var SUN = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';

  function paint() {
    var dark = current() === 'dark';
    buttons.forEach(function (b) {
      b.innerHTML = (dark ? SUN : MOON) + '<span>' + (dark ? 'Light' : 'Dark') + '</span>';
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      b.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    });
  }
  function toggle() {
    var next = current() === 'dark' ? 'light' : 'dark';
    save(next); apply(next); paint();
  }

  function make(cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls + ' hub-theme';
    b.addEventListener('click', toggle);
    buttons.push(b);
    return b;
  }

  function mount() {
    var st = document.createElement('style');
    st.textContent =
      '.hub-theme{display:inline-flex;align-items:center;gap:7px}' +
      '.hub-theme svg{flex:none}' +
      '.hub-theme.hub-theme-own{font:600 12px/1 "Barlow Semi Condensed","Arial Narrow",sans-serif;letter-spacing:.1em;text-transform:uppercase;' +
      'border:1px solid #3A3F48;background:none;color:inherit;padding:9px 12px;min-height:36px;cursor:pointer}' +
      '.hub-theme.hub-theme-own:hover{border-color:currentColor}' +
      '.hub-theme:focus-visible{outline:2px solid #2CA5B8;outline-offset:2px}' +
      '@media print{.hub-theme{display:none!important}}';
    document.head.appendChild(st);

    var spot;
    if ((spot = document.querySelector('.ehub-r'))) {            // training pages
      spot.insertBefore(make('ehub-btn'), spot.firstChild);
    } else if ((spot = document.querySelector('.mast .tabs'))) {  // hub landing
      spot.appendChild(make('hub-theme-own'));
    } else if ((spot = document.querySelector('header.top .acts'))) { // template builders
      spot.appendChild(make('tb'));
    } else {
      return;
    }
    paint();
  }

  if (mq) {
    var onChange = function () { if (!load()) paint(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
  // Keep other open hub tabs in step.
  window.addEventListener('storage', function (e) { if (e.key === K) { apply(e.newValue); paint(); } });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
