(function () {
  'use strict';

  // ── TAB FILTERING ──
  // Any .tabs or .queue-tabs container with [data-filter-scope] activates filtering.
  // Each .tab / .queue-tab needs [data-filter].
  // Filterable rows inside [data-filter-scope] need [data-filter-value].

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var tabContainer = scope.querySelector('.tabs, .queue-tabs');
    if (!tabContainer) return;

    var tabs = tabContainer.querySelectorAll('.tab, .queue-tab');
    tabs.forEach(function (tab) {
      tab.style.cursor = 'pointer';
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        var filter = tab.getAttribute('data-filter');
        var rows = scope.querySelectorAll('[data-filter-value]');
        var groups = scope.querySelectorAll('[data-filter-group]');

        if (filter === 'all') {
          rows.forEach(function (r) { r.style.display = ''; });
          groups.forEach(function (g) { g.style.display = ''; });
        } else {
          rows.forEach(function (r) {
            var vals = r.getAttribute('data-filter-value').split(' ');
            r.style.display = vals.indexOf(filter) >= 0 ? '' : 'none';
          });
          // Hide empty groups
          groups.forEach(function (g) {
            var visible = g.querySelectorAll('[data-filter-value]:not([style*="display: none"])');
            g.style.display = visible.length ? '' : 'none';
          });
        }
      });
    });
  });

  // ── SEARCH ──
  // Any input[data-search-scope] filters rows inside the matching scope selector.
  // Rows must have [data-search-text].

  document.querySelectorAll('input[data-search-scope]').forEach(function (input) {
    var scopeSel = input.getAttribute('data-search-scope');
    var scope = document.querySelector(scopeSel);
    if (!scope) return;

    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      var rows = scope.querySelectorAll('[data-search-text]');
      var groups = scope.querySelectorAll('[data-filter-group]');

      rows.forEach(function (r) {
        if (!q) {
          r.style.display = '';
        } else {
          var text = r.getAttribute('data-search-text').toLowerCase();
          r.style.display = text.indexOf(q) >= 0 ? '' : 'none';
        }
      });

      groups.forEach(function (g) {
        var visible = g.querySelectorAll('[data-search-text]:not([style*="display: none"])');
        g.style.display = visible.length ? '' : 'none';
      });
    });
  });

  // ── SORT ──
  // Table headers with [data-sort] sort the rows inside the table body scope.
  // data-sort value is the data attribute name on each row (e.g. "premium").
  // data-sort-type can be "num" (default) or "alpha".

  document.querySelectorAll('[data-sort]').forEach(function (header) {
    header.style.cursor = 'pointer';
    header.setAttribute('title', 'Click to sort');

    header.addEventListener('click', function () {
      var sortKey = header.getAttribute('data-sort');
      var sortType = header.getAttribute('data-sort-type') || 'num';
      var scopeSel = header.getAttribute('data-sort-scope');
      var scope = scopeSel ? document.querySelector(scopeSel) : header.closest('[data-sort-container]');
      if (!scope) return;

      // Toggle direction
      var current = header.getAttribute('data-sort-dir') || 'none';
      var dir = current === 'asc' ? 'desc' : 'asc';

      // Clear other sort indicators in the same header row
      var siblings = header.parentElement.querySelectorAll('[data-sort]');
      siblings.forEach(function (s) {
        s.setAttribute('data-sort-dir', 'none');
        s.classList.remove('sort-asc', 'sort-desc');
      });

      header.setAttribute('data-sort-dir', dir);
      header.classList.add(dir === 'asc' ? 'sort-asc' : 'sort-desc');

      // Collect all sortable rows
      var rows = Array.from(scope.querySelectorAll('[data-sort-row]'));
      rows.sort(function (a, b) {
        var av = a.getAttribute('data-sort-' + sortKey) || '';
        var bv = b.getAttribute('data-sort-' + sortKey) || '';

        var result;
        if (sortType === 'num') {
          result = parseFloat(av) - parseFloat(bv);
        } else {
          result = av.localeCompare(bv);
        }
        return dir === 'desc' ? -result : result;
      });

      // Re-append in sorted order (removes from current position and appends)
      rows.forEach(function (row) {
        scope.appendChild(row);
      });
    });
  });
})();
