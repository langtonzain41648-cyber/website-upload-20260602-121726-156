(function() {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showHero(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        showHero(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showHero(current + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var cardList = document.querySelector('[data-card-list]');
  if (filterPanel && cardList) {
    var searchInput = filterPanel.querySelector('[data-local-search]');
    var emptyState = document.querySelector('[data-empty-state]');
    var activeYear = '';
    var activeRegion = '';
    var activeType = '';

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var cards = Array.prototype.slice.call(cardList.children);
      var visible = 0;

      cards.forEach(function(card) {
        var text = normalize(card.textContent + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-genre'));
        var year = card.getAttribute('data-year') || '';
        var region = card.getAttribute('data-region') || '';
        var type = card.getAttribute('data-type') || '';
        var okQuery = !query || text.indexOf(query) !== -1;
        var okYear = !activeYear || year === activeYear;
        var okRegion = !activeRegion || region.indexOf(activeRegion) !== -1;
        var okType = !activeType || type.indexOf(activeType) !== -1;
        var show = okQuery && okYear && okRegion && okType;

        card.classList.toggle('is-filter-hidden', !show);
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        searchInput.value = q;
      }
      searchInput.addEventListener('input', applyFilters);
    }

    filterPanel.addEventListener('click', function(event) {
      var target = event.target;
      if (target.matches('[data-filter-year]')) {
        activeYear = target.getAttribute('data-filter-year') || '';
        Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-year]')).forEach(function(button) {
          button.classList.toggle('is-active', button === target);
        });
        applyFilters();
      }
      if (target.matches('[data-filter-region]')) {
        activeRegion = target.getAttribute('data-filter-region') || '';
        Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-region]')).forEach(function(button) {
          button.classList.toggle('is-active', button === target);
        });
        applyFilters();
      }
      if (target.matches('[data-filter-type]')) {
        activeType = target.getAttribute('data-filter-type') || '';
        Array.prototype.slice.call(filterPanel.querySelectorAll('[data-filter-type]')).forEach(function(button) {
          button.classList.toggle('is-active', button === target);
        });
        applyFilters();
      }
    });

    applyFilters();
  }
})();
