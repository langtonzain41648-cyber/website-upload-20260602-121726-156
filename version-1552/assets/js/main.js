(function () {
  const body = document.body;
  const navToggle = document.querySelector('[data-nav-toggle]');

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-error');
    });
  });

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;
  let slideTimer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  function startSlider() {
    if (slides.length <= 1) {
      return;
    }

    slideTimer = window.setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = Number(dot.getAttribute('data-hero-dot'));
      window.clearInterval(slideTimer);
      setSlide(index);
      startSlider();
    });
  });

  setSlide(0);
  startSlider();

  const searchInput = document.querySelector('[data-search-input]');
  const clearButton = document.querySelector('[data-clear-search]');
  const filterControls = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.searchable-card'));
  const countLabel = document.querySelector('[data-filter-count]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function activeFilters() {
    const filters = {};
    filterControls.forEach(function (control) {
      filters[control.getAttribute('data-filter')] = normalize(control.value);
    });
    return filters;
  }

  function cardMatches(card, query, filters) {
    const haystack = normalize([
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.dataset.tags
    ].join(' '));

    if (query && !haystack.includes(query)) {
      return false;
    }

    return Object.keys(filters).every(function (key) {
      return !filters[key] || normalize(card.dataset[key]) === filters[key];
    });
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const query = normalize(searchInput ? searchInput.value : '');
    const filters = activeFilters();
    let visible = 0;

    cards.forEach(function (card) {
      const matched = cardMatches(card, query, filters);
      card.classList.toggle('is-filter-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (countLabel) {
      countLabel.textContent = '当前显示 ' + visible + ' 部影片';
    }
  }

  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('q');
    if (preset) {
      searchInput.value = preset;
    }
    searchInput.addEventListener('input', applyFilters);
  }

  filterControls.forEach(function (control) {
    control.addEventListener('change', applyFilters);
  });

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = '';
      }
      filterControls.forEach(function (control) {
        control.value = '';
      });
      applyFilters();
    });
  }

  applyFilters();
})();
