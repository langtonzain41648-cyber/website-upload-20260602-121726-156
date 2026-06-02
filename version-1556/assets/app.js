(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var navToggle = qs('[data-nav-toggle]');
  var mainNav = qs('[data-main-nav]');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  qsa('[data-rail]').forEach(function (button) {
    button.addEventListener('click', function () {
      var wrap = button.closest('.rail-wrap');
      var track = qs('[data-rail-track]', wrap);
      if (!track) {
        return;
      }
      var direction = button.getAttribute('data-rail') === 'left' ? -1 : 1;
      track.scrollBy({ left: direction * 420, behavior: 'smooth' });
    });
  });

  qsa('[data-hero]').forEach(function (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  function setupFilters(root) {
    var input = qs('[data-filter-input]', root);
    var yearSelect = qs('[data-year-filter]', root);
    var typeSelect = qs('[data-type-filter]', root);
    var items = qsa('.searchable-list > *', root);
    if (!input && !yearSelect && !typeSelect) {
      return;
    }
    var years = [];
    var types = [];
    items.forEach(function (item) {
      var year = item.getAttribute('data-year');
      var type = item.getAttribute('data-type');
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });
    years.sort(function (a, b) {
      return parseInt(b, 10) - parseInt(a, 10);
    });
    types.sort();
    if (yearSelect && yearSelect.options.length === 1) {
      years.forEach(function (year) {
        yearSelect.appendChild(new Option(year, year));
      });
    }
    if (typeSelect && typeSelect.options.length === 1) {
      types.forEach(function (type) {
        typeSelect.appendChild(new Option(type, type));
      });
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-type'),
          item.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var ok = (!query || haystack.indexOf(query) !== -1) &&
          (!year || item.getAttribute('data-year') === year) &&
          (!type || item.getAttribute('data-type') === type);
        item.classList.toggle('hidden-by-filter', !ok);
      });
    }
    [input, yearSelect, typeSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  }

  setupFilters(document);

  function initializeVideo(shell) {
    var video = qs('video', shell);
    var src = shell.getAttribute('data-src');
    if (!video || !src || shell.getAttribute('data-ready') === '1') {
      return;
    }
    shell.setAttribute('data-ready', '1');
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      shell._hls = hls;
    } else {
      video.src = src;
    }
  }

  qsa('[data-video-player]').forEach(function (shell) {
    var video = qs('video', shell);
    var playButton = qs('[data-play-button]', shell);
    function play() {
      initializeVideo(shell);
      shell.classList.add('playing');
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            shell.classList.remove('playing');
          });
        }
      }
    }
    if (playButton) {
      playButton.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
    }
  });

  function renderSearchResults() {
    var input = qs('#site-search-input');
    var yearSelect = qs('#site-search-year');
    var typeSelect = qs('#site-search-type');
    var button = qs('#site-search-button');
    var box = qs('#site-search-results');
    var data = window.MOVIE_INDEX || [];
    if (!input || !box || !data.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';
    var years = Array.from(new Set(data.map(function (m) { return String(m.year); }))).sort(function (a, b) { return b - a; });
    var types = Array.from(new Set(data.map(function (m) { return m.type; }))).sort();
    years.forEach(function (year) {
      yearSelect.appendChild(new Option(year, year));
    });
    types.forEach(function (type) {
      typeSelect.appendChild(new Option(type, type));
    });
    function card(m) {
      return '<article class="movie-card">' +
        '<a class="poster" href="movie-' + m.id + '.html" aria-label="' + escapeHtml(m.title) + '">' +
        '<img src="' + m.cover + '" alt="' + escapeHtml(m.title) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
        '<span class="poster-shade"></span><span class="score">★ ' + m.rating + '</span><span class="duration">' + escapeHtml(m.duration) + '</span></a>' +
        '<div class="movie-info"><a class="movie-title" href="movie-' + m.id + '.html">' + escapeHtml(m.title) + '</a>' +
        '<div class="movie-meta">' + m.year + ' · ' + escapeHtml(m.region) + ' · ' + escapeHtml(m.type) + '</div>' +
        '<p>' + escapeHtml(m.oneLine) + '</p></div></article>';
    }
    function escapeHtml(text) {
      return String(text || '').replace(/[&<>"']/g, function (ch) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
      });
    }
    function apply() {
      var q = input.value.trim().toLowerCase();
      var year = yearSelect.value;
      var type = typeSelect.value;
      var results = data.filter(function (m) {
        var haystack = [m.title, m.region, m.type, m.genre, m.year, m.tags].join(' ').toLowerCase();
        return (!q || haystack.indexOf(q) !== -1) && (!year || String(m.year) === year) && (!type || m.type === type);
      }).slice(0, 120);
      box.innerHTML = results.map(card).join('');
    }
    [input, yearSelect, typeSelect].forEach(function (el) {
      el.addEventListener('input', apply);
      el.addEventListener('change', apply);
    });
    if (button) {
      button.addEventListener('click', apply);
    }
    apply();
  }

  renderSearchResults();
})();
