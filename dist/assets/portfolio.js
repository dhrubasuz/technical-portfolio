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
  var grid = document.querySelector('[data-project-grid]');
  var count = document.querySelector('[data-work-count]');
  if (filters.length && cards.length && grid) {
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        var selected = button.getAttribute('data-project-filter');
        var visible = 0;
        filters.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === button));
        });
        cards.forEach(function (card) {
          var categories = card.getAttribute('data-project-categories').split(' ');
          var show = selected === 'all' || categories.indexOf(selected) !== -1;
          card.hidden = !show;
          if (show) visible += 1;
        });
        grid.classList.toggle('is-filtered', selected !== 'all');
        if (count) count.textContent = visible + (visible === 1 ? ' project' : ' projects');
      });
    });
  }
  document.querySelectorAll('[data-current-year]').forEach(function (item) {
    item.textContent = String(new Date().getFullYear());
  });
}());
