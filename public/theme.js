// Sets the color mode before the page is drawn, so a dark theme does not flash white on load.
// Same storage key and values as src/hooks/useTheme.ts. A file rather than an inline script: the
// Content-Security-Policy in public/_headers only allows scripts served by the site itself.
(function () {
  var stored = null;
  try {
    stored = localStorage.getItem('sheet-cutting.theme');
  } catch {
    // storage is blocked (private mode, cookies off): follow the system
  }
  var dark =
    stored === 'dark' ||
    ((stored === null || stored === 'auto') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
})();
