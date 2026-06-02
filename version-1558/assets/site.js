(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-year-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      if (!cards.length) {
        return;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var chosenYear = year ? year.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-meta") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var yearValue = card.getAttribute("data-year") || "";
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var yearMatch = !chosenYear || yearValue === chosenYear;
          card.hidden = !(keywordMatch && yearMatch);
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    function setup() {
      var box = document.querySelector("[data-player]");
      var video = document.querySelector("[data-player-video]");
      var button = document.querySelector("[data-player-button]");
      var hlsInstance = null;
      if (!box || !video || !button || !streamUrl) {
        return;
      }

      function begin() {
        button.classList.add("is-hidden");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (video.src !== streamUrl) {
            video.src = streamUrl;
          }
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.play().catch(function () {});
          }
          return;
        }
        video.src = streamUrl;
        video.play().catch(function () {});
      }

      button.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });
    }
    ready(setup);
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
