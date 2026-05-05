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
  // ── GLOBAL SEARCH OVERLAY (⌘K) ──

  var overlay = document.getElementById('searchOverlay');
  var overlayInput = document.getElementById('searchOverlayInput');
  var overlayResults = document.getElementById('searchOverlayResults');
  if (overlay && overlayInput && overlayResults) {
    var activeIdx = -1;
    var resultItems = [];
    var debounceTimer = null;
    var emptyStateHTML = overlayResults.innerHTML;

    function openSearch() {
      overlay.classList.add('open');
      overlayInput.value = '';
      overlayResults.innerHTML = emptyStateHTML;
      activeIdx = -1;
      resultItems = [];
      setTimeout(function () { overlayInput.focus(); }, 50);
    }

    function closeSearch() {
      overlay.classList.remove('open');
      overlayInput.value = '';
    }

    // ⌘K / Ctrl+K to open
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeSearch();
      }
    });

    // Backdrop click to close
    overlay.querySelector('.search-overlay-backdrop').addEventListener('click', closeSearch);

    // Dashboard topbar search input → open overlay
    var topbarInput = document.querySelector('.search-input');
    if (topbarInput) {
      topbarInput.addEventListener('focus', function () {
        topbarInput.blur();
        openSearch();
      });
    }

    // Category icons
    var categoryIcons = {
      customers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg>',
      policies: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>',
      pipeline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-5"/></svg>'
    };

    function renderResults(data) {
      var html = '';
      var count = 0;

      if (data.customers.length) {
        html += '<div class="search-result-group">Customers</div>';
        data.customers.forEach(function (c) {
          html += '<a class="search-result-item" href="/customers/' + c.slug + '" data-idx="' + count + '">'
            + '<div class="search-result-item-icon customer">' + categoryIcons.customers + '</div>'
            + '<div class="search-result-body">'
            + '<div class="search-result-name">' + escHtml(c.name) + '</div>'
            + '<div class="search-result-meta">' + escHtml(c.detail || '') + '</div>'
            + '</div>'
            + '<span class="search-result-badge">' + escHtml(c.customer_type || 'Customer') + '</span>'
            + '</a>';
          count++;
        });
      }

      if (data.policies.length) {
        html += '<div class="search-result-group">Policies</div>';
        data.policies.forEach(function (p) {
          html += '<a class="search-result-item" href="/customers/' + p.slug + '" data-idx="' + count + '">'
            + '<div class="search-result-item-icon policy">' + categoryIcons.policies + '</div>'
            + '<div class="search-result-body">'
            + '<div class="search-result-name">' + escHtml(p.policy_number) + '</div>'
            + '<div class="search-result-meta">' + escHtml(p.title) + '</div>'
            + '</div>'
            + '<span class="search-result-badge">' + escHtml(p.status) + '</span>'
            + '</a>';
          count++;
        });
      }

      if (data.pipeline.length) {
        html += '<div class="search-result-group">Pipeline</div>';
        data.pipeline.forEach(function (d) {
          html += '<a class="search-result-item" href="/customers/' + d.slug + '" data-idx="' + count + '">'
            + '<div class="search-result-item-icon pipeline">' + categoryIcons.pipeline + '</div>'
            + '<div class="search-result-body">'
            + '<div class="search-result-name">' + escHtml(d.customer_name) + '</div>'
            + '<div class="search-result-meta">' + escHtml(d.detail) + '</div>'
            + '</div>'
            + '<span class="search-result-badge">' + escHtml(d.stage) + '</span>'
            + '</a>';
          count++;
        });
      }

      if (count === 0) {
        html = '<div class="search-no-results">No results found</div>';
      }

      overlayResults.innerHTML = html;
      resultItems = Array.from(overlayResults.querySelectorAll('.search-result-item'));
      activeIdx = -1;
    }

    function setActive(idx) {
      resultItems.forEach(function (el) { el.classList.remove('active'); });
      if (idx >= 0 && idx < resultItems.length) {
        activeIdx = idx;
        resultItems[idx].classList.add('active');
        resultItems[idx].scrollIntoView({ block: 'nearest' });
      } else {
        activeIdx = -1;
      }
    }

    function escHtml(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    // Debounced fetch on input
    overlayInput.addEventListener('input', function () {
      var q = overlayInput.value.trim();
      clearTimeout(debounceTimer);

      if (q.length < 2) {
        overlayResults.innerHTML = q.length === 0 ? emptyStateHTML : '';
        resultItems = [];
        activeIdx = -1;
        return;
      }

      debounceTimer = setTimeout(function () {
        fetch('/api/search?q=' + encodeURIComponent(q))
          .then(function (r) { return r.json(); })
          .then(renderResults)
          .catch(function () {
            overlayResults.innerHTML = '<div class="search-no-results">Search unavailable</div>';
          });
      }, 200);
    });

    // Keyboard navigation inside overlay
    overlayInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(activeIdx < resultItems.length - 1 ? activeIdx + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIdx > 0 ? activeIdx - 1 : resultItems.length - 1);
      } else if (e.key === 'Enter' && activeIdx >= 0 && resultItems[activeIdx]) {
        e.preventDefault();
        window.location.href = resultItems[activeIdx].getAttribute('href');
      }
    });
  }

  // ── C360 TAB SWITCHING ──
  var c360Scope = document.querySelector('[data-c360-tabs]');
  if (c360Scope) {
    var c360Tabs = c360Scope.querySelectorAll('.tab');
    var c360Sections = document.querySelectorAll('[data-c360-section]');
    c360Tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        c360Tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var target = tab.getAttribute('data-c360-tab');
        c360Sections.forEach(function (s) {
          s.style.display = s.getAttribute('data-c360-section') === target ? '' : 'none';
        });
      });
    });
  }
})();
