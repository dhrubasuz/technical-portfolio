/* Dhruba Poudel — progressively enhanced portfolio interactions. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  function closeMenu(returnFocus) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
    nav.classList.remove('is-open');
    if (returnFocus) toggle.focus();
  }
  if (toggle && nav) {
    toggle.hidden = false;
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { closeMenu(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) closeMenu(true);
    });
    document.addEventListener('click', function (event) {
      if (!event.target.closest('.site-header')) closeMenu(false);
    });
    var desktop = window.matchMedia('(min-width: 781px)');
    function syncMenu() {
      toggle.hidden = desktop.matches;
      if (desktop.matches) closeMenu(false);
    }
    if (desktop.addEventListener) desktop.addEventListener('change', syncMenu);
    syncMenu();
  }

  var filters = document.querySelectorAll('[data-project-filter]');
  var cards = document.querySelectorAll('[data-project-categories]');
  var count = document.querySelector('[data-work-count]');
  var search = document.querySelector('[data-project-search]');
  var controls = document.querySelector('[data-project-controls]');
  var collections = document.querySelectorAll('[data-project-collection]');
  var empty = document.querySelector('[data-project-empty]');
  var reset = document.querySelector('[data-reset-projects]');
  function normalise(value) {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  if (filters.length && cards.length) {
    var selected = 'all';
    var entries = Array.from(cards, function (card) {
      return {
        element: card,
        categories: card.getAttribute('data-project-categories').split(/\s+/),
        text: normalise(card.textContent + ' ' + (card.getAttribute('data-project-keywords') || ''))
      };
    });
    function updateProjects() {
      var query = search ? normalise(search.value.trim()) : '';
      var terms = query.split(/\s+/).filter(Boolean);
      var visible = 0;
      entries.forEach(function (entry) {
        var categoryMatches = selected === 'all' || entry.categories.indexOf(selected) !== -1;
        var textMatches = terms.every(function (term) { return entry.text.indexOf(term) !== -1; });
        var show = categoryMatches && textMatches;
        entry.element.hidden = !show;
        if (show) visible += 1;
      });
      filters.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-project-filter') === selected));
      });
      collections.forEach(function (collection) {
        collection.hidden = !Array.from(collection.querySelectorAll('[data-project-categories]')).some(function (card) { return !card.hidden; });
      });
      if (empty) empty.hidden = visible !== 0;
      if (count) count.textContent = visible === entries.length
        ? visible + (visible === 1 ? ' project' : ' projects')
        : visible + ' of ' + entries.length + ' projects';
      if (reset) reset.disabled = selected === 'all' && query.length === 0;
    }
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        selected = button.getAttribute('data-project-filter');
        updateProjects();
      });
    });
    if (search) search.addEventListener('input', updateProjects);
    if (reset) reset.addEventListener('click', function () {
      selected = 'all';
      if (search) search.value = '';
      updateProjects();
      if (search) search.focus();
    });
    updateProjects();
    if (controls) controls.hidden = false;
  }
  document.querySelectorAll('[data-current-year]').forEach(function (item) {
    item.textContent = String(new Date().getFullYear());
  });
}());
